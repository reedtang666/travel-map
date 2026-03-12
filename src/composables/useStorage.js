import { ref } from 'vue'
import { useGithubApi } from './useGithubApi'

const DATA_PATH = 'data/travels.json'

// 本地存储备份键名
const LOCAL_STORAGE_KEY = 'travel_map_backup'

export function useStorage() {
  const visits = ref([])
  const wishlist = ref([])
  const settings = ref({
    defaultMarkerStyle: '📌',
    homeLocation: [116.407526, 39.904030]
  })
  const isOfflineMode = ref(false)
  const lastError = ref(null)

  const { getJSON, saveJSON, isConfigValid } = useGithubApi()

  // 从本地存储加载备份
  const loadFromLocalStorage = () => {
    try {
      const backup = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (backup) {
        const data = JSON.parse(backup)
        visits.value = data.visits || []
        wishlist.value = data.wishlist || []
        settings.value = data.settings || settings.value
        console.log('已从本地存储恢复数据')
        return true
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error)
    }
    return false
  }

  // 保存到本地存储备份
  const saveToLocalStorage = () => {
    try {
      const data = {
        visits: visits.value,
        wishlist: wishlist.value,
        settings: settings.value,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('保存到本地存储失败:', error)
    }
  }

  // 加载数据
  const loadData = async () => {
    lastError.value = null
    
    try {
      // 检查 GitHub 配置
      if (!isConfigValid()) {
        console.warn('GitHub 配置不完整，切换到离线模式')
        isOfflineMode.value = true
        const hasLocalData = loadFromLocalStorage()
        if (!hasLocalData) {
          visits.value = []
          wishlist.value = []
        }
        return { visits: visits.value, wishlist: wishlist.value, settings: settings.value }
      }
      
      const data = await getJSON(DATA_PATH)
      visits.value = data.visits || []
      wishlist.value = data.wishlist || []
      settings.value = data.settings || settings.value
      isOfflineMode.value = false
      
      // 成功加载后更新本地备份
      saveToLocalStorage()
      
      return data
    } catch (error) {
      console.error('加载数据失败:', error)
      lastError.value = error.message
      
      // 尝试从本地存储恢复
      const hasLocalData = loadFromLocalStorage()
      
      if (hasLocalData) {
        isOfflineMode.value = true
        console.warn('GitHub 加载失败，使用本地备份数据')
        return { visits: visits.value, wishlist: wishlist.value, settings: settings.value }
      }
      
      // 如果是 401/404 错误，使用空数据
      if (error.message.includes('401') || error.message.includes('404')) {
        console.warn('使用本地空数据')
        visits.value = []
        wishlist.value = []
        isOfflineMode.value = true
        return { visits: [], wishlist: [], settings: settings.value }
      }
      
      throw error
    }
  }

  // 保存所有数据
  const saveData = async () => {
    const data = {
      visits: visits.value,
      wishlist: wishlist.value,
      settings: settings.value
    }

    // 始终先保存到本地备份
    saveToLocalStorage()

    // 如果在离线模式，不尝试保存到 GitHub
    if (isOfflineMode.value) {
      console.warn('离线模式：数据仅保存到本地存储')
      return data
    }

    try {
      await saveJSON(DATA_PATH, data, 'Update travel data')
      return data
    } catch (error) {
      console.error('保存数据到 GitHub 失败:', error)
      
      // 切换到离线模式
      isOfflineMode.value = true
      lastError.value = error.message
      
      // 提示用户
      if (error.message.includes('网络连接已断开')) {
        alert('网络连接已断开，数据已保存到本地。恢复网络后请刷新页面同步。')
      } else if (error.message.includes('Token 无效')) {
        alert('GitHub Token 无效，请检查配置。数据已保存到本地。')
      } else {
        alert('保存到 GitHub 失败，数据已保存到本地备份。')
      }
      
      return data
    }
  }

  // 保存访问记录
  const saveVisit = async (visit) => {
    const index = visits.value.findIndex(v => v.id === visit.id)
    
    if (index > -1) {
      // 更新现有记录
      visits.value[index] = {
        ...visits.value[index],
        ...visit,
        updatedAt: new Date().toISOString()
      }
    } else {
      // 添加新记录
      visits.value.push({
        ...visit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    await saveData()
    return visit
  }

  // 删除访问记录
  const deleteVisit = async (id) => {
    visits.value = visits.value.filter(v => v.id !== id)
    await saveData()
  }

  // 保存愿望清单项
  const saveWishlist = async (wish) => {
    const index = wishlist.value.findIndex(w => w.id === wish.id)
    
    if (index > -1) {
      // 更新现有项
      wishlist.value[index] = {
        ...wishlist.value[index],
        ...wish
      }
    } else {
      // 添加新项
      wishlist.value.push({
        ...wish,
        createdAt: new Date().toISOString()
      })
    }

    await saveData()
    return wish
  }

  // 删除愿望清单项
  const deleteWishlist = async (id) => {
    wishlist.value = wishlist.value.filter(w => w.id !== id)
    await saveData()
  }

  // 更新设置
  const updateSettings = async (newSettings) => {
    settings.value = {
      ...settings.value,
      ...newSettings
    }
    await saveData()
  }

  // 手动同步到 GitHub（用户点击同步按钮时使用）
  const syncToGithub = async () => {
    if (!isConfigValid()) {
      throw new Error('GitHub 配置不完整，无法同步')
    }
    
    const data = {
      visits: visits.value,
      wishlist: wishlist.value,
      settings: settings.value
    }
    
    try {
      await saveJSON(DATA_PATH, data, 'Manual sync from local storage')
      isOfflineMode.value = false
      lastError.value = null
      return data
    } catch (error) {
      console.error('同步到 GitHub 失败:', error)
      throw error
    }
  }

  // 清除本地备份
  const clearLocalBackup = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch (error) {
      console.error('清除本地备份失败:', error)
    }
  }

  return {
    visits,
    wishlist,
    settings,
    isOfflineMode,
    lastError,
    loadData,
    saveData,
    saveVisit,
    deleteVisit,
    saveWishlist,
    deleteWishlist,
    updateSettings,
    syncToGithub,
    clearLocalBackup
  }
}
