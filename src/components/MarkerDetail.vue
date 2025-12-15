<template>
  <div class="marker-detail">
    <div class="marker-detail-header">
      <h2 class="marker-detail-title">{{ visit.cityName }}</h2>
      <button @click="emit('close')" class="btn-close">✕</button>
    </div>

    <div class="marker-detail-content">
      <div class="detail-item">
        <div class="detail-label">标记样式</div>
        <div class="marker-style-display">{{ visit.markerStyle }}</div>
      </div>

      <div class="detail-item">
        <div class="detail-label">访问日期</div>
        <div class="detail-value">{{ formatDate(visit.visitDate) }}</div>
      </div>

      <div class="detail-item" v-if="visit.description">
        <div class="detail-label">游记描述</div>
        <div class="detail-value">{{ visit.description }}</div>
      </div>

      <div class="detail-item" v-if="hasImages">
        <div class="detail-label">照片</div>
        <div class="detail-images">
          <img
            v-if="visit.mainImage"
            :src="getImageUrl(visit.mainImage)"
            :alt="visit.cityName"
            class="detail-image main"
            @click="openGallery(0)"
          />
          <img
            v-for="(img, index) in visit.subImages"
            :key="index"
            :src="getImageUrl(img)"
            :alt="`${visit.cityName} ${index + 1}`"
            class="detail-image"
            @click="openGallery(index + 1)"
          />
        </div>
      </div>

      <div class="detail-item">
        <div class="detail-label">创建时间</div>
        <div class="detail-value">{{ formatDateTime(visit.createdAt) }}</div>
      </div>
    </div>

    <div class="marker-detail-actions">
      <button @click="emit('edit')" class="btn-primary">✏️ 编辑</button>
      <button @click="handleDelete" class="btn-danger">🗑️ 删除</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'close'])

const hasImages = computed(() => {
  return props.visit.mainImage || (props.visit.subImages && props.visit.subImages.length > 0)
})

const getImageUrl = (path) => {
  if (!path) return ''
  // 如果是完整URL，直接返回
  if (path.startsWith('http')) return path
  // 否则返回相对路径
  return `/${path}`
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
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

const handleDelete = () => {
  emit('delete', props.visit.id)
}

const openGallery = (index) => {
  // Note: Gallery functionality would be triggered via parent component
  // This is a placeholder for future implementation via emit
  const images = []
  if (props.visit.mainImage) images.push(props.visit.mainImage)
  if (props.visit.subImages) images.push(...props.visit.subImages)
  console.log('Gallery click:', index, images)
}
</script>

<style scoped>
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #666;
}
</style>
