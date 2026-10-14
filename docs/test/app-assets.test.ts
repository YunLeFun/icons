import { describe, expect, it } from 'vitest'
import { appAssetManifest, filterAppAssets, isPublicHttpsUrl, parseAppAssetManifest } from '../.vitepress/components/app-assets/app-assets'

describe('external app asset contract', () => {
  it('keeps selected official sources, generated desktop variants and candidates separate', () => {
    const assets = appAssetManifest.assets
    expect(assets).toHaveLength(28)
    expect(filterAppAssets(assets, '', 'official')).toHaveLength(16)
    expect(filterAppAssets(assets, '', 'generated')).toHaveLength(12)
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
    expect(filterAppAssets(appAssetManifest.assets, 'YunYouJun/saier', 'generated').map(asset => asset.slug)).toEqual(['pixi-painter'])
    expect(filterAppAssets(appAssetManifest.assets, 'YunYouJun/saier', 'official')).toEqual([])
    expect(filterAppAssets(appAssetManifest.assets, 'cook', 'generated')).toEqual([])
  })

  it('selects the approved Saier artwork while preserving the old application and stored object records', () => {
    const assets = appAssetManifest.assets
    const saier = assets.find(asset => asset.slug === 'pixi-painter')!
    expect(saier.desktopAsset.kind).toBe('generated')
    expect(saier.desktopAsset.thumbnail.url).toContain('/v1/pixi-painter.webp')
    expect(saier.desktopAsset.status).toBeUndefined()
    expect(saier.desktopAsset.adoption).toEqual({ status: 'maintainer-approved', approvedAt: '2026-10-14', scope: 'application-icon' })
    expect(saier.candidates).toHaveLength(0)
    expect(saier.previousIcon!.url).toContain('/site/public/logo.svg')
    const archived = saier.previousIcon!.archivedArtwork!
    expect(archived.kind).toBe('official')
    expect(archived.usage).toBe('comparison-only')
    expect(archived.status).toBe('superseded')
    expect(archived.thumbnail.url).toContain('/v2/pixi-painter.webp')
    expect(archived.master.sha256).toBe('5597d94e453c78742432f515db061fbee514f033985ec8dcf98467a53e262f92')
    expect(saier.applicationIdentity.source!.repository).toBe('YunYouJun/saier')
    expect(saier.websitePublication.status).toBe('declared-only')
    expect(assets.flatMap(asset => asset.candidates)).toHaveLength(4)
    expect(assets.filter(asset => asset.previousIcon)).toHaveLength(16)
    expect(new Set(assets.flatMap(asset => [asset.desktopAsset.thumbnail.url,
      ...asset.candidates.map(candidate => candidate.thumbnail.url),
      ...(asset.previousIcon?.archivedArtwork ? [asset.previousIcon.archivedArtwork.thumbnail.url] : [])])).size).toBe(33)
  })

  it('rejects selected candidate or superseded records and approval attached to comparison artwork', () => {
    const selectedCandidate = structuredClone(appAssetManifest)
    selectedCandidate.assets[0].desktopAsset.status = 'candidate'
    expect(() => parseAppAssetManifest(selectedCandidate)).toThrow('artwork status')
    const promotedArchive = structuredClone(appAssetManifest)
    const saier = promotedArchive.assets.find(asset => asset.slug === 'pixi-painter')!
    saier.desktopAsset = structuredClone(saier.previousIcon!.archivedArtwork!)
    saier.desktopAsset.usage = 'desktop-selected'
    expect(() => parseAppAssetManifest(promotedArchive)).toThrow('artwork status')
    const archivedApproval = structuredClone(appAssetManifest)
    const archivedSaier = archivedApproval.assets.find(asset => asset.slug === 'pixi-painter')!
    archivedSaier.previousIcon!.archivedArtwork!.adoption = archivedSaier.desktopAsset.adoption
    expect(() => parseAppAssetManifest(archivedApproval)).toThrow('adoption is only valid')
    const invalidDate = structuredClone(appAssetManifest)
    invalidDate.assets.find(asset => asset.slug === 'pixi-painter')!.desktopAsset.adoption!.approvedAt = '2026-02-30'
    expect(() => parseAppAssetManifest(invalidDate)).toThrow('approval date')
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
