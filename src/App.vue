<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1>🗺️ 家庭旅行足迹地图</h1>
      <div class="header-actions">
        <button @click="showAddForm" class="btn-primary">
          ➕ 添加新记录
        </button>
        <button @click="toggleWishlist" class="btn-secondary">
          ⭐ 愿望清单
        </button>
      </div>
    </header>

    <main class="app-main">
      <!-- 地图组件 -->
      <TravelMap
        :visits="visits"
        :wishlist="wishlist"
        :selectedMarkerId="selectedMarkerId"
        @marker-click="handleMarkerClick"
        @map-click="handleMapClick"
      />

      <!-- 侧边栏 -->
      <div v-if="showSidebar" class="sidebar">
        <!-- 标记详情 -->
        <MarkerDetail
          v-if="selectedVisit && !isEditing"
          :visit="selectedVisit"
          @edit="handleEdit"
          @delete="handleDelete"
          @close="closeSidebar"
          @open-gallery="openGallery"
        />

        <!-- 添加/编辑表单 -->
        <AddEditForm
          v-if="isEditing || isAdding"
          :visit="editingVisit"
          :mode="isAdding ? 'add' : 'edit'"
          @save="handleSave"
          @cancel="closeForm"
        />

        <!-- 愿望清单面板 -->
        <WishlistPanel
          v-if="showWishlistPanel"
          :wishlist="wishlist"
          @add-wishlist="handleAddWishlist"
          @edit-wishlist="handleEditWishlist"
          @delete-wishlist="handleDeleteWishlist"
          @convert-to-visit="handleConvertToVisit"
          @close="toggleWishlist"
        />
      </div>
    </main>

    <!-- 时间线 -->
    <footer class="app-footer">
      <Timeline
        :visits="sortedVisits"
        @visit-click="handleTimelineClick"
      />
    </footer>

    <!-- 照片画廊 -->
    <PhotoGallery
      v-if="showGallery"
      :images="galleryImages"
      :currentIndex="galleryIndex"
      @close="closeGallery"
    />

    <!-- Loading 遮罩 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TravelMap from './components/TravelMap.vue'
import MarkerDetail from './components/MarkerDetail.vue'
import AddEditForm from './components/AddEditForm.vue'
import Timeline from './components/Timeline.vue'
import WishlistPanel from './components/WishlistPanel.vue'
import PhotoGallery from './components/PhotoGallery.vue'
import { useStorage } from './composables/useStorage'

// 数据状态
const { visits, wishlist, loadData, saveVisit, deleteVisit, saveWishlist, deleteWishlist } = useStorage()
const loading = ref(false)
const selectedMarkerId = ref(null)
const selectedVisit = ref(null)
const editingVisit = ref(null)
const isEditing = ref(false)
const isAdding = ref(false)
const showWishlistPanel = ref(false)
const showGallery = ref(false)
const galleryImages = ref([])
const galleryIndex = ref(0)

// 计算属性
const showSidebar = computed(() => {
  return selectedVisit.value || isEditing.value || isAdding.value || showWishlistPanel.value
})

const sortedVisits = computed(() => {
  return [...visits.value].sort((a, b) => {
    return new Date(a.visitDate) - new Date(b.visitDate)
  })
})

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await loadData()
  } catch (error) {
    console.error('加载数据失败:', error)
    alert('加载数据失败，请检查配置')
  } finally {
    loading.value = false
  }
})

// 方法
const handleMarkerClick = (visit) => {
  selectedMarkerId.value = visit.id
  selectedVisit.value = visit
  isEditing.value = false
  isAdding.value = false
  showWishlistPanel.value = false
}

const handleMapClick = (coordinates) => {
  if (!isAdding.value) return
  editingVisit.value = {
    ...editingVisit.value,
    coordinates
  }
}

const handleEdit = () => {
  editingVisit.value = { ...selectedVisit.value }
  isEditing.value = true
  selectedVisit.value = null
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这条记录吗？')) return
  
  loading.value = true
  try {
    await deleteVisit(id)
    closeSidebar()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  } finally {
    loading.value = false
  }
}

const showAddForm = () => {
  editingVisit.value = {
    id: null,
    cityName: '',
    coordinates: null,
    visitDate: new Date().toISOString().split('T')[0],
    description: '',
    mainImage: '',
    subImages: [],
    markerStyle: '📌'
  }
  isAdding.value = true
  isEditing.value = false
  selectedVisit.value = null
  showWishlistPanel.value = false
}

const handleSave = async (visit) => {
  loading.value = true
  try {
    await saveVisit(visit)
    closeForm()
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

const closeForm = () => {
  isEditing.value = false
  isAdding.value = false
  editingVisit.value = null
}

const closeSidebar = () => {
  selectedMarkerId.value = null
  selectedVisit.value = null
  isEditing.value = false
  isAdding.value = false
  showWishlistPanel.value = false
}

const toggleWishlist = () => {
  showWishlistPanel.value = !showWishlistPanel.value
  if (showWishlistPanel.value) {
    selectedVisit.value = null
    isEditing.value = false
    isAdding.value = false
  }
}

const handleAddWishlist = async (wishItem) => {
  loading.value = true
  try {
    await saveWishlist(wishItem)
  } catch (error) {
    console.error('添加愿望清单失败:', error)
    alert('添加失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleEditWishlist = async (wishItem) => {
  loading.value = true
  try {
    await saveWishlist(wishItem)
  } catch (error) {
    console.error('更新愿望清单失败:', error)
    alert('更新失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleDeleteWishlist = async (id) => {
  if (!confirm('确定要删除这个愿望吗？')) return
  
  loading.value = true
  try {
    await deleteWishlist(id)
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleConvertToVisit = async (wishItem) => {
  const visit = {
    id: null,
    cityName: wishItem.cityName,
    coordinates: wishItem.coordinates,
    visitDate: new Date().toISOString().split('T')[0],
    description: wishItem.note || '',
    mainImage: '',
    subImages: [],
    markerStyle: '📌'
  }
  
  loading.value = true
  try {
    await saveVisit(visit)
    await deleteWishlist(wishItem.id)
  } catch (error) {
    console.error('转换失败:', error)
    alert('转换失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleTimelineClick = (visit) => {
  handleMarkerClick(visit)
}

const openGallery = (images, index = 0) => {
  galleryImages.value = images
  galleryIndex.value = index
  showGallery.value = true
}

const closeGallery = () => {
  showGallery.value = false
  galleryImages.value = []
  galleryIndex.value = 0
}
</script>

<style>
/* Styles are in main.css */
</style>
