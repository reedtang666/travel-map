import { ref } from 'vue'
import { useGithubApi } from './useGithubApi'

const DATA_PATH = 'data/travels.json'

export function useStorage() {
  const visits = ref([])
  const wishlist = ref([])
  const settings = ref({
    defaultMarkerStyle: '📌',
    homeLocation: [116.407526, 39.904030]
  })

  const { getJSON, saveJSON } = useGithubApi()

  // 加载数据
  const loadData = async () => {
    try {
      const data = await getJSON(DATA_PATH)
      visits.value = data.visits || []
      wishlist.value = data.wishlist || []
      settings.value = data.settings || settings.value
      return data
    } catch (error) {
      console.error('加载数据失败:', error)
      // 如果是本地开发且无 GitHub 配置，使用空数据
      if (error.message.includes('401') || error.message.includes('404')) {
        console.warn('使用本地空数据')
        visits.value = []
        wishlist.value = []
      } else {
        throw error
      }
    }
  }

  // 保存所有数据
  const saveData = async () => {
    const data = {
      visits: visits.value,
      wishlist: wishlist.value,
      settings: settings.value
    }

    try {
      await saveJSON(DATA_PATH, data, 'Update travel data')
      return data
    } catch (error) {
      console.error('保存数据失败:', error)
      throw error
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

  return {
    visits,
    wishlist,
    settings,
    loadData,
    saveData,
    saveVisit,
    deleteVisit,
    saveWishlist,
    deleteWishlist,
    updateSettings
  }
}
