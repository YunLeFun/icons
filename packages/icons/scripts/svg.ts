import type { IconColorStrategy } from '../../../icons.config'
import { cleanupSVG, isEmptyColor, parseColors, runSVGO, SVG } from '@iconify/tools'

export interface OptimizeSVGOptions {
  /** Skip shape and path merging so each source path survives as its own element. */
  keepShapes?: boolean
}

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

  runSVGO(svg, { keepShapes: options.keepShapes })
  return svg
}

export function createOptimizedSVG(content: string, colorStrategy: IconColorStrategy, options: OptimizeSVGOptions = {}): SVG {
  return optimizeSVG(new SVG(content), colorStrategy, options)
}
