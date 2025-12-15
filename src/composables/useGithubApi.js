import { ref } from 'vue'

const config = {
  token: import.meta.env.VITE_GITHUB_TOKEN || '',
  owner: import.meta.env.VITE_GITHUB_OWNER || '',
  repo: import.meta.env.VITE_GITHUB_REPO || 'travel-map',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'main'
}

export function useGithubApi() {
  const loading = ref(false)
  const error = ref(null)

  const getHeaders = () => ({
    'Authorization': `token ${config.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  })

  const getApiUrl = (path) => {
    return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`
  }

  // 读取文件
  const getFile = async (path) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(getApiUrl(path), {
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error(`获取文件失败: ${response.statusText}`)
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
        throw new Error(`更新文件失败: ${response.statusText}`)
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
        throw new Error(`创建文件失败: ${response.statusText}`)
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
        throw new Error(`删除文件失败: ${response.statusText}`)
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
      // 读取 blob 为 base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1]
          resolve(base64data)
        }
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
        throw new Error(`上传图片失败: ${response.statusText}`)
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

  return {
    loading,
    error,
    getFile,
    updateFile,
    createFile,
    deleteFile,
    uploadImage,
    getJSON,
    saveJSON
  }
}
