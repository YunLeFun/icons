<script setup lang="ts">
import { addCollection, Icon } from '@iconify/vue'
import icons from '@yunlefun/icons/icons.json'
import components from '../generated/vue'
import probe from '../generated/probe.json'
import rows from '../generated/rows.json'

addCollection({ ...icons, icons: { ...icons.icons, 'reference-probe': probe } })
const drivers = ['reference', 'uno', 'iconify', 'vue', 'react']
</script>

<template>
  <main>
    <h1>YunLeFun · packed consumer acceptance</h1>
    <p>{{ rows.length - 1 }} icons · repeated instances · gradients / masks / clips / color · production build</p>
    <div class="row heading">
      <div>Icon / variant</div>
      <div v-for="driver in drivers" :key="driver">{{ driver }}</div>
    </div>
    <section v-for="row in rows" :key="row.name" class="row" :data-row="row.name">
      <div class="label">{{ row.name }}<small v-if="row.unoMonochrome">UnoCSS: monochrome mask</small></div>
      <div v-for="driver in drivers" :key="driver" class="pair">
        <template v-if="row.component || !['vue', 'react'].includes(driver)">
          <span v-for="copy in [0, 1]" :key="copy" class="sample" :data-name="row.name" :data-driver="driver" :data-copy="copy">
            <img v-if="driver === 'reference'" class="glyph" :src="`/reference/${row.name}-${copy}.svg`" alt="">
            <span v-else-if="driver === 'uno'" class="glyph" :class="`i-ylf-${row.name}`" />
            <Icon v-else-if="driver === 'iconify'" class="glyph" :icon="`ylf:${row.name}`" width="64" height="64" />
            <component :is="components[row.name]" v-else-if="driver === 'vue'" class="glyph" :size="64" :title="copy === 0 ? row.name : undefined" />
          </span>
        </template>
        <span v-else class="omitted">—</span>
      </div>
    </section>
  </main>
</template>
