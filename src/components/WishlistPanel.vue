<template>
  <div class="wishlist-panel">
    <div class="wishlist-header">
      <h2 class="wishlist-title">⭐ 愿望清单</h2>
      <button @click="emit('close')" class="btn-close">✕</button>
    </div>

    <button @click="showAddForm = true" class="btn-primary" style="width: 100%; margin-bottom: 1rem;">
      ➕ 添加愿望
    </button>

    <div v-if="showAddForm || editingWish" class="form-container" style="padding: 0;">
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

        <div class="form-group">
          <label class="form-label">备注</label>
          <textarea
            v-model="formData.note"
            class="form-textarea"
            placeholder="为什么想去这里？"
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="cancelForm" class="btn-outline">
            取消
          </button>
          <button type="submit" class="btn-primary" :disabled="!isValid">
            {{ editingWish ? '保存' : '添加' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="wishlist.length === 0 && !showAddForm" class="empty-state">
      <div class="empty-state-icon">⭐</div>
      <div class="empty-state-text">还没有愿望清单</div>
      <div class="empty-state-hint">添加你想去的城市</div>
    </div>

    <div v-else-if="!showAddForm && !editingWish" class="wishlist-list">
      <div
        v-for="wish in wishlist"
        :key="wish.id"
        class="wishlist-item"
      >
        <div class="wishlist-item-header">
          <div class="wishlist-city">{{ wish.cityName }}</div>
          <div class="wishlist-actions">
            <button @click="handleConvert(wish)" class="btn-primary">
              ✅ 已去过
            </button>
            <button @click="handleEdit(wish)" class="btn-secondary">
              ✏️
            </button>
            <button @click="handleDelete(wish.id)" class="btn-danger">
              🗑️
            </button>
          </div>
        </div>
        <div v-if="wish.note" class="wishlist-note">{{ wish.note }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { searchCity } from '../utils/helpers'

const props = defineProps({
  wishlist: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-wishlist', 'edit-wishlist', 'delete-wishlist', 'convert-to-visit', 'close'])

const showAddForm = ref(false)
const editingWish = ref(null)
const searchResults = ref([])
const searchTimeout = ref(null)

const formData = reactive({
  id: null,
  cityName: '',
  coordinates: null,
  note: ''
})

const isValid = computed(() => {
  return formData.cityName && formData.coordinates
})

const handleCitySearch = (event) => {
  const query = event.target.value
  if (!query || query.length < 2) {
    searchResults.value = []
    return
  }

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
  const wishData = {
    id: formData.id || generateId(),
    cityName: formData.cityName,
    coordinates: formData.coordinates,
    note: formData.note,
    createdAt: formData.id ? undefined : new Date().toISOString()
  }

  if (editingWish.value) {
    emit('edit-wishlist', wishData)
  } else {
    emit('add-wishlist', wishData)
  }

  cancelForm()
}

const cancelForm = () => {
  showAddForm.value = false
  editingWish.value = null
  formData.id = null
  formData.cityName = ''
  formData.coordinates = null
  formData.note = ''
}

const handleEdit = (wish) => {
  editingWish.value = wish
  formData.id = wish.id
  formData.cityName = wish.cityName
  formData.coordinates = wish.coordinates
  formData.note = wish.note || ''
}

const handleDelete = (id) => {
  emit('delete-wishlist', id)
}

const handleConvert = (wish) => {
  emit('convert-to-visit', wish)
}

const generateId = () => {
  return `wish_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
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
