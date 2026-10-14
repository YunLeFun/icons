import { describe, expect, it } from 'vitest'
import { appAssetManifest, filterAppAssets, isPublicHttpsUrl, parseAppAssetManifest } from '../.vitepress/components/app-assets/app-assets'

describe('external app asset contract', () => {
  it('keeps selected official sources, generated desktop variants and candidates separate', () => {
    const assets = appAssetManifest.assets
    expect(assets).toHaveLength(28)
    expect(filterAppAssets(assets, '', 'official')).toHaveLength(17)
    expect(filterAppAssets(assets, '', 'generated')).toHaveLength(11)
    const cook = assets.find(asset => asset.slug === 'cook')!
    expect(cook.desktopAsset.kind).toBe('official')
    expect(cook.desktopAsset.thumbnail.url).toContain('/v2/cook.webp')
    expect(cook.candidates[0].status).toBe('candidate')
    expect(cook.candidates[0].usage).toBe('comparison-only')
    expect(cook.candidates[0].thumbnail.url).toContain('/v1/cook.webp')
    expect(assets.find(asset => asset.slug === 'electric-fan')!.applicationIdentity.status).toBe('legacy_icon_unverified')
    expect(assets.find(asset => asset.slug === 'augma')!.applicationIdentity.status).toBe('project_mark_only')
    expect(assets.find(asset => asset.slug === 'explosions')!.applicationIdentity.status).toBe('framework_default')
    expect(JSON.stringify(appAssetManifest)).not.toMatch(/\/Users\/|data:image|token=/)
    for (const asset of assets)
      expect(`${asset.title} ${asset.description}`).not.toMatch(/测试|隐藏|权威|内部|mock|test|staging|internal|fixture|production|待发布/i)
  })

  it('searches names and provenance without ignoring the selected source filter', () => {
    expect(filterAppAssets(appAssetManifest.assets, '  云风扇 ', 'all').map(asset => asset.slug)).toEqual(['electric-fan'])
    expect(filterAppAssets(appAssetManifest.assets, 'YunYouJun/saier', 'official').map(asset => asset.slug)).toEqual(['pixi-painter'])
    expect(filterAppAssets(appAssetManifest.assets, 'cook', 'generated')).toEqual([])
  })

  it('rejects duplicate slugs, tampered destinations and invalid file identities', () => {
    const duplicate = structuredClone(appAssetManifest)
    duplicate.assets.push(duplicate.assets[0])
    expect(() => parseAppAssetManifest(duplicate)).toThrow('duplicate slug')
    const tampered = structuredClone(appAssetManifest)
    tampered.assets[0].desktopAsset.thumbnail.url = 'https://example.com/cook.webp'
    expect(() => parseAppAssetManifest(tampered)).toThrow('fixed object path')
    tampered.assets[0].desktopAsset.thumbnail.url = appAssetManifest.assets[0].desktopAsset.thumbnail.url
    tampered.assets[0].desktopAsset.thumbnail.sha256 = 'not-a-hash'
    expect(() => parseAppAssetManifest(tampered)).toThrow('SHA-256')
  })

  it('rejects local, credentialed and temporary URLs while accepting pinned public originals', () => {
    for (const url of ['http://example.com/icon.png', 'https://localhost/icon.png', 'https://127.0.0.1/icon.png', 'https://user:pass@example.com/icon.png', 'https://example.com/icon.png?token=temporary', 'data:image/png;base64,a'])
      expect(isPublicHttpsUrl(url)).toBe(false)
    expect(isPublicHttpsUrl('https://raw.githubusercontent.com/YunLeFun/fc/f075eb20982d545fe9859dcae658a4e5316456de/public/icon.svg')).toBe(true)
  })
})
