<template>
  <div class="timeline-container">
    <h3 class="timeline-title">🕐 旅行时间线</h3>
    
    <div v-if="visits.length === 0" class="empty-state">
      <div class="empty-state-icon">🗺️</div>
      <div class="empty-state-text">还没有旅行记录</div>
      <div class="empty-state-hint">点击上方"添加新记录"开始记录你的旅程</div>
    </div>

    <div v-else class="timeline-list">
      <div
        v-for="visit in visits"
        :key="visit.id"
        class="timeline-item"
        @click="emit('visit-click', visit)"
      >
        <div class="timeline-image" :class="{ placeholder: !visit.mainImage }">
          <img v-if="visit.mainImage" :src="getImageUrl(visit.mainImage)" :alt="visit.cityName" />
          <span v-else>{{ visit.markerStyle || '📌' }}</span>
        </div>
        <div class="timeline-info">
          <div class="timeline-city">{{ visit.cityName }}</div>
          <div class="timeline-date">{{ formatDate(visit.visitDate) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visits: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['visit-click'])

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `/${path}`
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
/* Styles inherited from main.css */
</style>
