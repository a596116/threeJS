<template>
  <NuxtImg
    v-bind="$attrs"
    :format
    :src
    :alt
    :style="{ 'object-fit': fit }"
    @error="handleImageError" />
</template>

<script setup lang="ts">
// ----------- props -----------
const src = defineModel<string>('src', { default: 'https://i.imgur.com/plvQYCr.jpeg' })
const props = withDefaults(
  defineProps<{
    alt?: string
    fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
    format?: string
  }>(),
  {
    alt: '浩呆',
    fit: 'cover',
    format: 'webp',
  },
)

// ----------- emit -----------
const emit = defineEmits<{
  (e: 'on-error'): ((...args: any[]) => any) | undefined
}>()

const handleImageError = () => {
  src.value = 'https://i.imgur.com/plvQYCr.jpeg'
  emit('on-error')
}
</script>

<style scoped></style>
