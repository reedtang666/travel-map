<template>
  <div class="marker-style-picker">
    <div
      v-for="style in styles"
      :key="style"
      :class="['style-option', { active: modelValue === style }]"
      @click="selectStyle(style)"
    >
      {{ style }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '📌'
  }
})

const emit = defineEmits(['update:modelValue'])

const styles = ['📌', '🦶', '👆', '❤️', '⭐', '🎯', '🏁', '🚩', '⛳', '🎪']

const selectStyle = (style) => {
  emit('update:modelValue', style)
}
</script>

<style scoped>
/* Styles inherited from main.css */
</style>
