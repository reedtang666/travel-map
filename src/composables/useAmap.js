import { ref } from 'vue'

const map = ref(null)
const AMap = ref(null)
const markers = ref([])
const loadError = ref(null)
const isLoading = ref(false)

export function useAmap() {
  const loadAmapScript = () => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        AMap.value = window.AMap
        resolve(window.AMap)
        return
      }

      const key = import.meta.env.VITE_AMAP_KEY
      if (!key || key === 'your_amap_key_here') {
        reject(new Error('高德地图 API Key 未配置，请在 .env 文件中设置 VITE_AMAP_KEY'))
        return
      }

      // 设置超时处理
      const timeout = setTimeout(() => {
        reject(new Error('高德地图脚本加载超时，请检查网络连接'))
      }, 30000)

      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geocoder,AMap.PlaceSearch`
      script.onload = () => {
        clearTimeout(timeout)
        AMap.value = window.AMap
        resolve(window.AMap)
      }
      script.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('高德地图脚本加载失败，请检查网络连接或 API Key 是否正确'))
      }
      document.head.appendChild(script)
    })
  }

  const initMap = async (containerId) => {
    isLoading.value = true
    loadError.value = null
    
    try {
      await loadAmapScript()
      
      // 检查容器是否存在
      const container = document.getElementById(containerId)
      if (!container) {
        throw new Error(`地图容器 #${containerId} 不存在`)
      }
      
      map.value = new AMap.value.Map(containerId, {
        zoom: 5,
        center: [116.397428, 39.90923], // 北京
        mapStyle: 'amap://styles/normal',
        viewMode: '2D',
        features: ['bg', 'road', 'building', 'point'],
        showLabel: true
      })

      // 监听地图加载完成事件
      map.value.on('complete', () => {
        console.log('地图加载完成')
      })

      return map.value
    } catch (error) {
      console.error('地图初始化失败:', error)
      loadError.value = error.message
      
      // 在页面上显示错误信息
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #f5f5f5;
            color: #666;
            padding: 2rem;
            text-align: center;
          ">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
            <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem;">地图加载失败</div>
            <div style="font-size: 0.9rem; color: #999;">${error.message}</div>
            <button onclick="window.location.reload()" style="
              margin-top: 1rem;
              padding: 0.5rem 1rem;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">重新加载</button>
          </div>
        `
      }
      
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addMarker = (coordinates, content = '📌', onClick = null, style = {}) => {
    if (!map.value || !AMap.value) return null

    const marker = new AMap.value.Marker({
      position: coordinates,
      content: `<div style="
        font-size: 24px;
        cursor: pointer;
        transform: translate(-50%, -50%);
        ${style.color ? `color: ${style.color};` : ''}
      ">${content}</div>`,
      offset: new AMap.value.Pixel(0, 0)
    })

    marker.setMap(map.value)
    
    if (onClick) {
      marker.on('click', onClick)
    }

    markers.value.push(marker)
    return marker
  }

  const removeMarker = (marker) => {
    if (marker && map.value) {
      marker.setMap(null)
      const index = markers.value.indexOf(marker)
      if (index > -1) {
        markers.value.splice(index, 1)
      }
    }
  }

  const clearMarkers = () => {
    markers.value.forEach(marker => {
      marker.setMap(null)
    })
    markers.value = []
  }

  const setCenter = (coordinates, zoom) => {
    if (map.value) {
      map.value.setCenter(coordinates)
      if (zoom) {
        map.value.setZoom(zoom)
      }
    }
  }

  const geocode = async (address) => {
    if (!AMap.value) await loadAmapScript()

    return new Promise((resolve, reject) => {
      const geocoder = new AMap.value.Geocoder()
      geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.geocodes.length) {
          const location = result.geocodes[0].location
          resolve([location.lng, location.lat])
        } else {
          reject(new Error('地址解析失败'))
        }
      })
    })
  }

  const searchPlace = async (keyword) => {
    if (!AMap.value) await loadAmapScript()

    return new Promise((resolve, reject) => {
      const placeSearch = new AMap.value.PlaceSearch({
        type: '行政区域',
        pageSize: 10
      })

      placeSearch.search(keyword, (status, result) => {
        if (status === 'complete' && result.poiList.pois) {
          const results = result.poiList.pois.map(poi => ({
            name: poi.name,
            district: poi.address || poi.pname + poi.cityname,
            location: [poi.location.lng, poi.location.lat]
          }))
          resolve(results)
        } else {
          reject(new Error('搜索失败'))
        }
      })
    })
  }

  // 重试加载地图
  const retryInitMap = async (containerId, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await initMap(containerId)
      } catch (error) {
        console.warn(`地图加载尝试 ${i + 1}/${maxRetries} 失败:`, error)
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
      }
    }
  }

  // 检查网络状态
  const checkNetworkStatus = () => {
    return navigator.onLine
  }

  return {
    map,
    AMap,
    loadError,
    isLoading,
    initMap,
    retryInitMap,
    addMarker,
    removeMarker,
    clearMarkers,
    setCenter,
    geocode,
    searchPlace,
    checkNetworkStatus
  }
}
