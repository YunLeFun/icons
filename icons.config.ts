import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type IconColorStrategy =
  | { mode: 'preserve' }
  | { mode: 'current-color' }
  | { mode: 'replace-current-color', color: string }

export interface IconsConfig {
  prefix: string
  collection: {
    name: string
    author: {
      name: string
      url: string
    }
    license: {
      title: string
      spdx: string
      url: string
    }
    palette: boolean
  }
  paths: {
    packageRoot: string
    inputs: {
      svgDirectory: string
      metadataFile: string
    }
    outputs: {
      iconifyFile: string
      generatedSourceFile: string
    }
  }
  package: {
    name: string
    description: string
    license: string
    homepage: string
    repository: {
      type: string
      url: string
      directory: string
    }
    bugs: string
  }
  colors: {
    default: IconColorStrategy
    icons: Record<string, IconColorStrategy>
  }
  sources: {
    repositoriesRoot: string
    repositories: Record<string, string>
  }
}

const workspaceRoot = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(workspaceRoot, 'packages/icons')
const repositoriesRoot = process.env.YLF_REPOSITORIES_ROOT
  ? resolve(process.env.YLF_REPOSITORIES_ROOT)
  : resolve(workspaceRoot, '..')

const iconsConfig: IconsConfig = {
  prefix: 'ylf',
  collection: {
    name: 'YunLeFun Icons',
    author: {
      name: 'YunLeFun',
      url: 'https://github.com/YunLeFun',
    },
    license: {
      title: 'MIT',
      spdx: 'MIT',
      url: 'https://github.com/YunLeFun/icons/blob/main/LICENSE',
    },
    palette: true,
  },
  paths: {
    packageRoot,
    inputs: {
      svgDirectory: resolve(packageRoot, 'svg'),
      metadataFile: resolve(packageRoot, 'metadata.json'),
    },
    outputs: {
      iconifyFile: resolve(packageRoot, 'icons.json'),
      generatedSourceFile: resolve(packageRoot, 'src/generated.ts'),
    },
  },
  package: {
    name: '@yunlefun/icons',
    description: 'YunLeFun brand and application icons in IconifyJSON format',
    license: 'MIT',
    homepage: 'https://icons.yunle.fun/',
    repository: {
      type: 'git',
      url: 'git+https://github.com/YunLeFun/icons.git',
      directory: 'packages/icons',
    },
    bugs: 'https://github.com/YunLeFun/icons/issues',
  },
  colors: {
    default: { mode: 'preserve' },
    icons: {
      brand: { mode: 'current-color' },
      apps: { mode: 'replace-current-color', color: '#0078E7' },
    },
  },
  sources: {
    repositoriesRoot,
    repositories: {
      'YunLeFun/apps.yunle.fun': 'apps.yunle.fun',
      'YunLeFun/cms': 'cms',
      'YunLeFun/drive': 'drive',
      'YunLeFun/play': 'play',
      'YunLeFun/skykeeper': 'skykeeper',
      'YunLeFun/support.yunle.fun': 'support.yunle.fun',
      'YunLeFun/www.yunle.fun': 'www.yunle.fun',
    },
  },
}

export function getIconColorStrategy(name: string): IconColorStrategy {
  return iconsConfig.colors.icons[name] ?? iconsConfig.colors.default
}

export default iconsConfig
