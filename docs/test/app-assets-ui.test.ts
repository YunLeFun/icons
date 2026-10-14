import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppAssetCatalog from '../.vitepress/components/app-assets/AppAssetCatalog.vue'
import AssetImage from '../.vitepress/components/app-assets/AssetImage.vue'
import { appAssetManifest } from '../.vitepress/components/app-assets/app-assets'

describe('app artwork preview', () => {
  it('shows real media with separate desktop and application identity labels', async () => {
    const wrapper = mount(AppAssetCatalog)
    expect(wrapper.get('h1').text()).toBe('应用图标素材')
    expect(wrapper.findAll('article')).toHaveLength(28)
    const cook = wrapper.get('[data-asset="cook"]')
    expect(cook.text()).toContain('桌面采用 · v2')
    expect(cook.text()).toContain('正式应用图标')
    expect(cook.text()).toContain('生成候选 · 未采用')
    expect(cook.get('img').attributes('src')).toContain('/v2/cook.webp')
    expect(cook.get('img').attributes('referrerpolicy')).toBe('no-referrer')
    const search = wrapper.get('input[type="search"]')
    await search.setValue('云风扇')
    expect(wrapper.findAll('article')).toHaveLength(1)
    expect(wrapper.text()).toContain('已有旧图，品牌来源未确认')
    await search.setValue('no such app')
    expect(wrapper.findAll('article')).toHaveLength(0)
    expect(wrapper.get('[role="status"]').text()).toContain('没有找到匹配的素材')
    await wrapper.findAll('button').find(button => button.text() === '清除筛选')!.trigger('click')
    expect(wrapper.findAll('article')).toHaveLength(28)
    wrapper.unmount()
  })

  it('filters the gallery and changes actual image size and mask', async () => {
    const wrapper = mount(AppAssetCatalog)
    const official = wrapper.findAll('button').find(button => button.text() === '正式来源')!
    await official.trigger('click')
    expect(wrapper.findAll('article')).toHaveLength(16)
    const larger = wrapper.findAll('button').find(button => button.text() === '128px')!
    await larger.trigger('click')
    expect(wrapper.get('article img').attributes('style')).toContain('width: 128px')
    const mask = wrapper.findAll('button').find(button => button.text() === '圆角预览')!
    await mask.trigger('click')
    expect(wrapper.get('article img').attributes('style')).toContain('border-radius: 0')
    wrapper.unmount()
  })

  it('shows the selected Saier paintbrush and keeps the previous official export clearly archived', () => {
    const wrapper = mount(AppAssetCatalog)
    const saier = wrapper.get('[data-asset="pixi-painter"]')
    expect(saier.get('img').attributes('src')).toContain('/v1/pixi-painter.webp')
    expect(saier.text()).toContain('已选用新版图标 · v1')
    expect(saier.text()).toContain('维护者已确认 · 2026-10-14')
    expect(saier.text()).toContain('上一版桌面图 · 已归档')
    expect(saier.text()).toContain('站点声明已核实，图像访问未确认')
    expect(saier.text()).not.toContain('生成候选 · 未采用')
    expect(saier.text()).not.toContain('仅作为桌面目录变体')
    const archive = saier.findAll('figure').find(figure => figure.text().includes('已归档'))!
    expect(archive.get('img').attributes('src')).toContain('/v2/pixi-painter.webp')
    expect(archive.get('a').attributes('href')).toContain('/masters/v2/pixi-painter.png')
    wrapper.unmount()
  })

  it('handles missing media and ignores late errors from a replaced image', async () => {
    const urls = appAssetManifest.assets.map(asset => asset.desktopAsset.thumbnail.url)
    const wrapper = mount(AssetImage, { props: { url: urls[0], label: '当前素材', size: 56 } })
    const original = wrapper.get('img')
    await original.trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toBe('预览暂不可用')
    await wrapper.setProps({ url: urls[1] })
    expect(wrapper.get('img').attributes('src')).toBe(urls[1])
    await original.trigger('error')
    expect(wrapper.find('img').exists()).toBe(true)
    await wrapper.setProps({ url: urls[0] })
    expect(wrapper.get('img').element).not.toBe(original.element)
    await original.trigger('error')
    expect(wrapper.get('img').attributes('src')).toBe(urls[0])
    wrapper.unmount()
  })
})
