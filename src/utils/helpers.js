import { useAmap } from '../composables/useAmap'
import { useGithubApi } from '../composables/useGithubApi'

// 搜索城市
export async function searchCity(keyword) {
  try {
    const { searchPlace } = useAmap()
    const results = await searchPlace(keyword)
    return results
  } catch (error) {
    console.error('城市搜索失败:', error)
    return []
  }
}

// 压缩图片
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 计算新尺寸
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('压缩失败'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

// 上传图片
export async function uploadImage(blob, filename) {
  try {
    const { uploadImage: upload } = useGithubApi()
    const path = await upload(blob, filename)
    return path
  } catch (error) {
    console.error('图片上传失败:', error)
    throw error
  }
}

// 格式化日期
export function formatDate(dateString, format = 'YYYY-MM-DD') {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
}

// 格式化日期时间
export function formatDateTime(dateString) {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生成唯一 ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// 获取图片 URL
export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  
  // 对于 GitHub Pages，使用相对路径
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path}`.replace(/\/+/g, '/')
}

// 计算两点间距离（km）
export function calculateDistance(coord1, coord2) {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2
  
  const R = 6371 // 地球半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance.toFixed(2)
}

// 防抖函数
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export function throttle(func, limit = 300) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
