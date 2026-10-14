<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { isPublicHttpsUrl } from './app-assets'

const props = defineProps<{ url: string, label: string, size: number, rounded?: boolean }>()
const failed = shallowRef(false)
const image = useTemplateRef<HTMLImageElement>('image')
const safeUrl = computed(() => isPublicHttpsUrl(props.url) ? props.url : '')
const imageStyle = computed(() => ({ width: `${props.size}px`, height: `${props.size}px`, borderRadius: props.rounded ? `${props.size * 12 / 56}px` : '0' }))
watch(() => props.url, () => { failed.value = false }, { flush: 'sync' })

function onError(event: Event) {
  if (event.target === image.value && image.value?.getAttribute('src') === props.url)
    failed.value = true
}
</script>

<template>
  <div class="asset-image-frame">
    <img v-if="safeUrl && !failed" :key="safeUrl" ref="image" :src="safeUrl" :alt="label" :style="imageStyle" loading="lazy" decoding="async" referrerpolicy="no-referrer" @error="onError">
    <span v-else class="asset-image-unavailable" role="status">预览暂不可用</span>
  </div>
</template>

<style scoped>
.asset-image-frame { display: grid; min-width: 0; min-height: 148px; place-items: center; background: var(--ylf-c-bg-soft); border-radius: var(--ylf-radius-sm); }
.asset-image-frame img { display: block; object-fit: contain; max-width: 100%; }
.asset-image-unavailable { color: var(--ylf-c-text-2); font-size: 12px; text-align: center; }
</style>
