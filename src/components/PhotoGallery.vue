<template>
  <div class="photo-gallery-overlay" @click.self="emit('close')">
    <div class="gallery-content">
      <button @click="emit('close')" class="gallery-close">✕</button>
      
      <img
        :src="getImageUrl(images[currentIndex])"
        :alt="`Photo ${currentIndex + 1}`"
        class="gallery-image"
      />

      <button
        v-if="images.length > 1 && currentIndex > 0"
        @click="prev"
        class="gallery-nav prev"
      >
        ‹
      </button>

      <button
        v-if="images.length > 1 && currentIndex < images.length - 1"
        @click="next"
        class="gallery-nav next"
      >
        ›
      </button>

      <div class="gallery-indicator" v-if="images.length > 1">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const currentIndex = ref(props.currentIndex)

watch(() => props.currentIndex, (newIndex) => {
  currentIndex.value = newIndex
})

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `/${path}`
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

// 键盘导航
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'Escape') emit('close')
}

// 生命周期管理键盘监听
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.gallery-indicator {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 20px;
}
</style>
