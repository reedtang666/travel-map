import { ref } from 'vue'

const map = ref(null)
const AMap = ref(null)
const markers = ref([])

export function useAmap() {
  const loadAmapScript = () => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        AMap.value = window.AMap
        resolve(window.AMap)
        return
      }

      const key = import.meta.env.VITE_AMAP_KEY || 'your_amap_key_here'
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geocoder,AMap.PlaceSearch`
      script.onload = () => {
        AMap.value = window.AMap
        resolve(window.AMap)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const initMap = async (containerId) => {
    try {
      await loadAmapScript()
      
      map.value = new AMap.value.Map(containerId, {
        zoom: 5,
        center: [116.397428, 39.90923], // 北京
        mapStyle: 'amap://styles/normal',
        viewMode: '2D',
        features: ['bg', 'road', 'building', 'point'],
        showLabel: true
      })

      return map.value
    } catch (error) {
      console.error('地图初始化失败:', error)
      throw error
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

  return {
    map,
    AMap,
    initMap,
    addMarker,
    removeMarker,
    clearMarkers,
    setCenter,
    geocode,
    searchPlace
  }
}
