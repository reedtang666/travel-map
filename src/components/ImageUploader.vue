<template>
  <div>
    <div
      class="image-uploader"
      @click="triggerFileInput"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleFileSelect"
      />
      <div>
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div>
        <div>点击或拖拽上传照片</div>
        <div style="font-size: 0.85rem; color: #888; margin-top: 0.25rem;">
          最多{{ maxImages }}张，支持 JPG、PNG 格式
        </div>
      </div>
    </div>

    <div v-if="previewImages.length > 0" class="upload-preview">
      <div
        v-for="(image, index) in previewImages"
        :key="index"
        class="preview-item"
      >
        <img :src="image.url" :alt="`Preview ${index + 1}`" class="preview-image" />
        <button @click="removeImage(index)" class="preview-remove">✕</button>
        <div v-if="index === 0" class="preview-badge">主图</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { uploadImage, compressImage } from '../utils/helpers'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxImages: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const previewImages = ref([])

// 初始化预览图片
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0) {
    previewImages.value = newVal.map(path => ({
      url: path.startsWith('http') ? path : `/${path}`,
      path: path
    }))
  }
}, { immediate: true })

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  await processFiles(files)
}

const handleDrop = async (event) => {
  const files = Array.from(event.dataTransfer.files)
  await processFiles(files)
}

const processFiles = async (files) => {
  const remainingSlots = props.maxImages - previewImages.value.length
  const filesToProcess = files.slice(0, remainingSlots)

  for (const file of filesToProcess) {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      continue
    }

    try {
      // 压缩图片
      const compressedBlob = await compressImage(file)
      
      // 创建预览
      const url = URL.createObjectURL(compressedBlob)
      
      // 上传图片
      const imagePath = await uploadImage(compressedBlob, file.name)
      
      previewImages.value.push({
        url: url,
        path: imagePath
      })

      // 更新父组件
      updateValue()
    } catch (error) {
      console.error('图片处理失败:', error)
      alert('图片上传失败，请重试')
    }
  }
}

const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  updateValue()
}

const updateValue = () => {
  const paths = previewImages.value.map(img => img.path)
  emit('update:modelValue', paths)
}
</script>

<style scoped>
.preview-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background-color: #667eea;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}
</style>
