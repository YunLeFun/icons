import type { IconColorStrategy } from '../../../icons.config'
import { cleanupSVG, isEmptyColor, parseColors, runSVGO, SVG } from '@iconify/tools'

export function optimizeSVG(svg: SVG, colorStrategy: IconColorStrategy): SVG {
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

  runSVGO(svg)
  return svg
}

export function createOptimizedSVG(content: string, colorStrategy: IconColorStrategy): SVG {
  return optimizeSVG(new SVG(content), colorStrategy)
}
