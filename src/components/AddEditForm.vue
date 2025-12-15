<template>
  <div class="form-container">
    <div class="form-header">
      <h2 class="form-title">{{ mode === 'add' ? '➕ 添加新记录' : '✏️ 编辑记录' }}</h2>
      <button @click="emit('cancel')" class="btn-close">✕</button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">城市名称 *</label>
        <div class="city-search">
          <input
            v-model="formData.cityName"
            type="text"
            class="form-input"
            placeholder="输入城市名称搜索..."
            required
            @input="handleCitySearch"
          />
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="(result, index) in searchResults"
              :key="index"
              class="search-result-item"
              @click="selectCity(result)"
            >
              {{ result.name }} - {{ result.district }}
            </div>
          </div>
        </div>
      </div>

      <div class="form-group" v-if="formData.coordinates">
        <label class="form-label">坐标</label>
        <div class="detail-value">
          {{ formData.coordinates[0].toFixed(6) }}, {{ formData.coordinates[1].toFixed(6) }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">访问日期 *</label>
        <input
          v-model="formData.visitDate"
          type="date"
          class="form-input"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">标记样式</label>
        <MarkerStylePicker
          v-model="formData.markerStyle"
        />
      </div>

      <div class="form-group">
        <label class="form-label">游记描述</label>
        <textarea
          v-model="formData.description"
          class="form-textarea"
          placeholder="写下你的旅行故事..."
          rows="5"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">照片（最多4张）</label>
        <ImageUploader
          v-model="formData.images"
          :maxImages="4"
        />
      </div>

      <div class="form-actions">
        <button type="button" @click="emit('cancel')" class="btn-outline">
          取消
        </button>
        <button type="submit" class="btn-primary" :disabled="!isValid">
          {{ mode === 'add' ? '添加' : '保存' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import MarkerStylePicker from './MarkerStylePicker.vue'
import ImageUploader from './ImageUploader.vue'
import { searchCity } from '../utils/helpers'

const props = defineProps({
  visit: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add' // 'add' or 'edit'
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = reactive({
  id: props.visit?.id || null,
  cityName: props.visit?.cityName || '',
  coordinates: props.visit?.coordinates || null,
  visitDate: props.visit?.visitDate || new Date().toISOString().split('T')[0],
  description: props.visit?.description || '',
  markerStyle: props.visit?.markerStyle || '📌',
  images: []
})

const searchResults = ref([])
const searchTimeout = ref(null)

// 初始化图片数据
if (props.visit) {
  const images = []
  if (props.visit.mainImage) images.push(props.visit.mainImage)
  if (props.visit.subImages) images.push(...props.visit.subImages)
  formData.images = images
}

const isValid = computed(() => {
  return formData.cityName && formData.coordinates && formData.visitDate
})

const handleCitySearch = (event) => {
  const query = event.target.value
  if (!query || query.length < 2) {
    searchResults.value = []
    return
  }

  // 防抖搜索
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      const results = await searchCity(query)
      searchResults.value = results
    } catch (error) {
      console.error('城市搜索失败:', error)
    }
  }, 300)
}

const selectCity = (city) => {
  formData.cityName = city.name
  formData.coordinates = city.location
  searchResults.value = []
}

const handleSubmit = () => {
  const [mainImage, ...subImages] = formData.images
  
  const visitData = {
    id: formData.id,
    cityName: formData.cityName,
    coordinates: formData.coordinates,
    visitDate: formData.visitDate,
    description: formData.description,
    markerStyle: formData.markerStyle,
    mainImage: mainImage || '',
    subImages: subImages || [],
    updatedAt: new Date().toISOString()
  }

  if (!visitData.id) {
    visitData.id = generateId()
    visitData.createdAt = new Date().toISOString()
  }

  emit('save', visitData)
}

const generateId = () => {
  return `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
