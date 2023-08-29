import type * as ESBuild from 'esbuild'
import type * as Rollup from 'rollup'
import type * as Babel from '@babel/standalone'
import { FsPlugin } from './plugins/FsPlugin'
import type * as swc from '@swc/core'
import { pascalCase } from 'pascal-case'
import { join, relative, isAbsolute } from 'path-browserify'
import { Vue } from './plugins/vue'
import type * as Compiler from '@vue/compiler-sfc'

const isSubPath = (parent: string, dir: string) => {
  const relativePath = relative(parent, dir)
  return (
    relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)
  )
}

export interface IPkgJson {
  dependencies: Record<string, string>
}

export interface ICookConfig {
  root: string
  componentFileName: string
  pageFileName: string
  entryFileName: string
  ignorePaths: string[]
  outdir: string
  tempDir?: string
  deps?: Record<
    string,
    {
      entry: string
    }
  >
}

export interface IBuildOptions {
  esbuild: typeof ESBuild
  rollup: typeof Rollup
  babel: typeof Babel
  swc: typeof swc
  vueCompiler: typeof Compiler
  config: ICookConfig
  pkgJson: IPkgJson
  modules: Record<string, string>
}

export const defineMethodName = '__vueCookAmdDefine__'

export const build = async (options: IBuildOptions) => {
  const { esbuild, rollup, config, pkgJson, modules, babel, swc, vueCompiler } =
    options
  if (!config) {
    return
  }
  if (!pkgJson) {
    return
  }
  let { root } = config
  const { dependencies = {} } = pkgJson
  const entryTsPath = join(root, config.entryFileName)
  const componentsPath = join(root, config.componentFileName)
  const components: Record<
    string,
    {
      path: string
    }
  > = {}
  const pagesPath = join(root, config.pageFileName)
  const pages: Record<
    string,
    {
      path: string
    }
  > = {}
  Object.keys(modules).map(modulePath => {
    if (modulePath.startsWith(componentsPath)) {
      const subPath = modulePath.slice(componentsPath.length)
      const name = subPath.split('/')[1]
      const normalizeName = pascalCase(name)
      if (!components[normalizeName]) {
        const componentEntryPath = join(componentsPath, name, 'index.ts')
        const realtivePath = relative(entryTsPath + '/../', componentEntryPath)
        components[normalizeName] = {
          path: './' + realtivePath
        }
      }
    }
    if (modulePath.startsWith(pagesPath)) {
      const subPath = modulePath.slice(pagesPath.length)
      const name = subPath.split('/')[1]
      const normalizeName = pascalCase(name)
      if (!components[normalizeName]) {
        const pageEntryPath = join(pagesPath, name, 'index.ts')
        const realtivePath = relative(entryTsPath + '/../', pageEntryPath)
        pages[normalizeName] = {
          path: './' + realtivePath
        }
      }
    }
  })

  const entryTs = `
${Object.keys(components)
  .map(componentName => {
    const component = components[componentName]
    return `import Component${componentName} from '${component.path}';`
  })
  .join('\n')}

${Object.keys(pages)
  .map(pageName => {
    const page = pages[pageName]
    return `import Page${pageName} from '${page.path}';`
  })
  .join('\n')}

const components = {
${Object.keys(components)
  .map(componentName => {
    return `  ${componentName}:Component${componentName}`
  })
  .join(',\n')}
}

const pages = {
${Object.keys(pages)
  .map(pageName => {
    return `  ${pageName}:Page${pageName}`
  })
  .join(',\n')}
}

export {
  components,
  pages
}
  `

  console.log('entryTs', entryTs)
  modules[entryTsPath] = entryTs

  let bundleRes = await esbuild.build({
    entryPoints: [entryTsPath],
    bundle: true,
    target: ['es2015'],
    format: 'esm',
    write: false,
    external: Object.keys(dependencies),
    outdir: join(config.outdir, './schema'),
    sourcemap: true,
    plugins: [Vue({ modules, compiler: vueCompiler }), FsPlugin({ modules })]
  })

  const outputFiles: Record<string, string> = {}

  {
    ;(bundleRes.outputFiles || []).map(e => {
      outputFiles[e.path] = e.text
    })
  }

  // swc转译下
  await Promise.all(
    Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async key => {
        const bundle = await swc.transform(outputFiles[key], {
          module: {
            type: 'amd'
          },
          sourceMaps: 'inline',
          inputSourceMap: outputFiles[key + '.map'] || '{}'
        })
        outputFiles[key] = bundle.code || ''
        //@ts-ignore
        outputFiles[key + '.map'] = JSON.stringify(bundle.map || '')
      })
  )
  // TODO：接入less
  // TODO: 构建结果含有隐私私有路径的问题

  await Promise.all([
    ...Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async key => {
        const minifyRes = await esbuild.transform(outputFiles[key], {
          loader: 'js',
          // minify: true,
          sourcemap: true,
          banner: `(function () {
var define = window['${defineMethodName}']`,
          footer: '})();'
        })
        outputFiles[key] =
          minifyRes.code + `//# sourceMappingURL=` + 'index.js.map'
        outputFiles[key + '.map'] = minifyRes.map
      }),
    ...Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.css')) {
          return true
        }
        return false
      })
      .map(async key => {
        const minifyRes = await esbuild.transform(outputFiles[key], {
          loader: 'css',
          minify: true,
          sourcemap: true
        })
        outputFiles[key] = minifyRes.code
        outputFiles[key + '.map'] = minifyRes.map
      })
  ])

  return outputFiles
}
