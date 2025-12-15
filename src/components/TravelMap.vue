<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useAmap } from '../composables/useAmap'

const props = defineProps({
  visits: {
    type: Array,
    default: () => []
  },
  wishlist: {
    type: Array,
    default: () => []
  },
  selectedMarkerId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['marker-click', 'map-click'])

const { map, AMap, initMap, addMarker, removeMarker, clearMarkers, setCenter } = useAmap()
const markers = ref(new Map())

onMounted(async () => {
  await initMap('map')
  updateMarkers()
  
  // 监听地图点击事件
  if (map.value) {
    map.value.on('click', (e) => {
      emit('map-click', [e.lnglat.getLng(), e.lnglat.getLat()])
    })
  }
})

// 监听数据变化
watch(() => [props.visits, props.wishlist], () => {
  updateMarkers()
}, { deep: true })

// 监听选中的标记
watch(() => props.selectedMarkerId, (newId) => {
  if (newId) {
    const visit = props.visits.find(v => v.id === newId)
    if (visit && visit.coordinates) {
      setCenter(visit.coordinates)
    }
  }
})

const updateMarkers = async () => {
  if (!map.value || !AMap.value) return
  
  // 清除现有标记
  clearMarkers()
  markers.value.clear()
  
  // 添加已访问城市标记
  props.visits.forEach(visit => {
    if (visit.coordinates) {
      const marker = addMarker(
        visit.coordinates,
        visit.markerStyle || '📌',
        () => emit('marker-click', visit)
      )
      markers.value.set(visit.id, marker)
    }
  })
  
  // 添加愿望清单标记
  props.wishlist.forEach(wish => {
    if (wish.coordinates) {
      const marker = addMarker(
        wish.coordinates,
        '⚪',
        () => {
          // 可以添加愿望清单点击事件
        },
        { fillColor: '#cccccc', strokeColor: '#999999' }
      )
      markers.value.set(wish.id, marker)
    }
  })
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
