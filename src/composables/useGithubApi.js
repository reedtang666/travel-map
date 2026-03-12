import { ref } from 'vue'

const config = {
  token: import.meta.env.VITE_GITHUB_TOKEN || '',
  owner: import.meta.env.VITE_GITHUB_OWNER || '',
  repo: import.meta.env.VITE_GITHUB_REPO || 'travel-map',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main'
}

// 检查配置是否有效
const isConfigValid = () => {
  return config.token && 
         config.token !== 'your_github_token_here' &&
         config.owner && 
         config.owner !== 'your_github_username' &&
         config.repo
}

// 获取友好的错误信息
const getFriendlyErrorMessage = (status, statusText) => {
  const errorMessages = {
    401: 'GitHub Token 无效或已过期，请检查 VITE_GITHUB_TOKEN 配置',
    403: 'GitHub API 请求被拒绝，可能是 Token 权限不足或达到速率限制',
    404: '仓库或文件不存在，请检查 VITE_GITHUB_OWNER 和 VITE_GITHUB_REPO 配置',
    422: '请求数据格式错误，请检查提交的内容',
    500: 'GitHub 服务器内部错误，请稍后重试',
    502: 'GitHub 服务暂时不可用，请稍后重试',
    503: 'GitHub 服务维护中，请稍后重试'
  }
  return errorMessages[status] || `请求失败: ${statusText} (HTTP ${status})`
}

export function useGithubApi() {
  const loading = ref(false)
  const error = ref(null)
  const isOnline = ref(navigator.onLine)

  // 监听网络状态
  const updateNetworkStatus = () => {
    isOnline.value = navigator.onLine
  }
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)

  const getHeaders = () => ({
    'Authorization': `token ${config.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  })
  
  // 检查配置
  const validateConfig = () => {
    if (!isConfigValid()) {
      const missing = []
      if (!config.token || config.token === 'your_github_token_here') missing.push('VITE_GITHUB_TOKEN')
      if (!config.owner || config.owner === 'your_github_username') missing.push('VITE_GITHUB_OWNER')
      if (!config.repo) missing.push('VITE_GITHUB_REPO')
      throw new Error(`GitHub 配置不完整，缺少: ${missing.join(', ')}。请在 .env 文件中配置这些环境变量。`)
    }
  }

  const getApiUrl = (path) => {
    return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`
  }

  // 读取文件
  const getFile = async (path) => {
    loading.value = true
    error.value = null

    try {
      // 检查网络状态
      if (!isOnline.value) {
        throw new Error('网络连接已断开，请检查网络后重试')
      }
      
      validateConfig()
      
      const response = await fetch(getApiUrl(path), {
        headers: getHeaders()
      })

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage(response.status, response.statusText)
        throw new Error(friendlyMessage)
      }

      const data = await response.json()
      
      // 解码 base64 内容
      const content = atob(data.content)
      
      return {
        content: content,
        sha: data.sha
      }
    } catch (err) {
      error.value = err.message
      console.error('获取文件失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新文件
  const updateFile = async (path, content, message, sha) => {
    loading.value = true
    error.value = null

    try {
      // 检查网络状态
      if (!isOnline.value) {
        throw new Error('网络连接已断开，请检查网络后重试')
      }
      
      validateConfig()
      
      // 编码为 base64 (使用 TextEncoder for proper UTF-8 encoding)
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const base64 = btoa(String.fromCharCode(...data))

      const response = await fetch(getApiUrl(path), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          message: message || 'Update file',
          content: base64,
          sha: sha,
          branch: config.branch
        })
      })

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage(response.status, response.statusText)
        throw new Error(friendlyMessage)
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      console.error('更新文件失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建文件
  const createFile = async (path, content, message) => {
    loading.value = true
    error.value = null

    try {
      // 检查网络状态
      if (!isOnline.value) {
        throw new Error('网络连接已断开，请检查网络后重试')
      }
      
      validateConfig()
      
      // 编码为 base64 (使用 TextEncoder for proper UTF-8 encoding)
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const base64 = btoa(String.fromCharCode(...data))

      const response = await fetch(getApiUrl(path), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          message: message || 'Create file',
          content: base64,
          branch: config.branch
        })
      })

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage(response.status, response.statusText)
        throw new Error(friendlyMessage)
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      console.error('创建文件失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除文件
  const deleteFile = async (path, message, sha) => {
    loading.value = true
    error.value = null

    try {
      // 检查网络状态
      if (!isOnline.value) {
        throw new Error('网络连接已断开，请检查网络后重试')
      }
      
      validateConfig()
      
      const response = await fetch(getApiUrl(path), {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({
          message: message || 'Delete file',
          sha: sha,
          branch: config.branch
        })
      })

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage(response.status, response.statusText)
        throw new Error(friendlyMessage)
      }

      return await response.json()
    } catch (err) {
      error.value = err.message
      console.error('删除文件失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 上传图片文件（二进制）
  const uploadImage = async (blob, filename) => {
    loading.value = true
    error.value = null

    try {
      // 检查网络状态
      if (!isOnline.value) {
        throw new Error('网络连接已断开，请检查网络后重试')
      }
      
      validateConfig()
      
      // 读取 blob 为 base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1]
          resolve(base64data)
        }
        reader.onerror = () => reject(new Error('图片读取失败'))
        reader.readAsDataURL(blob)
      })

      const timestamp = Date.now()
      const path = `images/${timestamp}_${filename}`

      const response = await fetch(getApiUrl(path), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          message: `Upload image: ${filename}`,
          content: base64,
          branch: config.branch
        })
      })

      if (!response.ok) {
        const friendlyMessage = getFriendlyErrorMessage(response.status, response.statusText)
        throw new Error(friendlyMessage)
      }

      return path
    } catch (err) {
      error.value = err.message
      console.error('上传图片失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 读取 JSON 配置
  const getJSON = async (path) => {
    const { content } = await getFile(path)
    return JSON.parse(content)
  }

  // 保存 JSON 配置
  const saveJSON = async (path, data, message) => {
    try {
      // 先获取当前文件的 sha
      const { sha } = await getFile(path)
      
      const content = JSON.stringify(data, null, 2)
      return await updateFile(path, content, message, sha)
    } catch (err) {
      // 如果文件不存在，创建新文件
      if (err.message.includes('404')) {
        const content = JSON.stringify(data, null, 2)
        return await createFile(path, content, message)
      }
      throw err
    }
  }

  // 重试机制包装器
  const withRetry = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        console.warn(`请求尝试 ${i + 1}/${maxRetries} 失败:`, error.message)
        
        // 如果是配置错误或网络断开，直接抛出不再重试
        if (error.message.includes('配置不完整') || 
            error.message.includes('网络连接已断开') ||
            error.message.includes('无效或已过期')) {
          throw error
        }
        
        if (i === maxRetries - 1) throw error
        
        // 指数退避
        const delay = Math.min(1000 * Math.pow(2, i), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // 带重试的保存 JSON
  const saveJSONWithRetry = async (path, data, message) => {
    return withRetry(() => saveJSON(path, data, message))
  }

  // 带重试的上传图片
  const uploadImageWithRetry = async (blob, filename) => {
    return withRetry(() => uploadImage(blob, filename))
  }

  return {
    loading,
    error,
    isOnline,
    isConfigValid,
    getFile,
    updateFile,
    createFile,
    deleteFile,
    uploadImage,
    uploadImageWithRetry,
    getJSON,
    saveJSON,
    saveJSONWithRetry,
    withRetry
  }
}
