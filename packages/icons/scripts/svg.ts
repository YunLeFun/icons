import type { IconColorStrategy } from '../../../icons.config'
import { cleanupSVG, isEmptyColor, parseColors, runSVGO, SVG } from '@iconify/tools'
import { getSVGOPlugins } from '@iconify/tools/lib/optimise/svgo'

export interface OptimizeSVGOptions {
  /** Keep sibling paths apart so each source part stays animatable; path data is still normalized. */
  separatePaths?: boolean
  /** Decimal places for path data; only for flat paths on large canvases (no scaled groups). */
  pathPrecision?: number
}

const separatePathPlugins = getSVGOPlugins({}).filter(plugin => typeof plugin === 'string' || plugin.name !== 'mergePaths')

export function optimizeSVG(svg: SVG, colorStrategy: IconColorStrategy, options: OptimizeSVGOptions = {}): SVG {
  if (colorStrategy.mode === 'replace-current-color') {
    svg.load(svg.toString().replace(/currentcolor/gi, colorStrategy.color))
  }

  cleanupSVG(svg)

  if (colorStrategy.mode === 'current-color') {
    parseColors(svg, {
      defaultColor: 'currentColor',
      callback: (_attribute, colorString, color) => {
        if (!color)
          return colorString

        return isEmptyColor(color) ? color : 'currentColor'
      },
    })
  }

  runSVGO(svg, options.separatePaths ? { plugins: separatePathPlugins } : {})
  if (options.pathPrecision !== undefined)
    runSVGO(svg, { plugins: [{ name: 'convertPathData', params: { floatPrecision: options.pathPrecision, noSpaceAfterFlags: true } }] })
  return svg
}

export function createOptimizedSVG(content: string, colorStrategy: IconColorStrategy, options: OptimizeSVGOptions = {}): SVG {
  return optimizeSVG(new SVG(content), colorStrategy, options)
}
