import type * as ESBuild from 'esbuild'
import type * as Rollup from 'rollup'
import type * as Babel from '@babel/standalone'
import { FsPlugin } from './plugins/FsPlugin'
import type * as Swc from '@swc/core'

export interface IPkgJson {
  dependencies: Record<string, string>
}

export interface ICookConfig {
  version: string
  ignorePaths: string[]
  entry: string
  components: string
  rootPath: string
  outdir: string
}

export interface IBuildOptions {
  esbuild: typeof ESBuild
  rollup: typeof Rollup
  babel: typeof Babel
  swc: typeof Swc
  config: ICookConfig
  pkgJson: IPkgJson
  modules: Record<string, string>
}

export const defineMethodName = '__vueCookAmdDefine__'

export const build = async (options: IBuildOptions) => {
  const { esbuild, rollup, config, pkgJson, modules, babel, swc } = options
  if (!config) {
    return
  }
  if (!pkgJson) {
    return
  }
  const { dependencies = {} } = pkgJson
  let bundleRes = await esbuild.build({
    entryPoints: [config.entry],
    bundle: true,
    target: ['es2015'],
    format: 'esm',
    write: false,
    // minify: true,
    external: Object.keys(dependencies),
    outdir: config.outdir,
    sourcemap: true,
    plugins: [FsPlugin({ modules })]
  })

  const outputFiles: Record<string, string> = {}

  {
    ;(bundleRes.outputFiles || []).map(e => {
      outputFiles[e.path] = e.text
    })
  }
  console.log('====>')

  // // babel转译下
  await Promise.all(
    Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async key => {
        const bundle = babel.transform(outputFiles[key], {
          presets: ['env'],
          caller: {
            name: 'my-custom-tool',
            supportsStaticESM: true
          },
          sourceMaps: true,
          inputSourceMap: JSON.parse(outputFiles[key + '.map'] || '{}')
        })
        outputFiles[key] = bundle.code || ''
        //@ts-ignore
        outputFiles[key + '.map'] = JSON.stringify(bundle.map || '')
      })
  )
  // TODO：接入less
  // TODO: 构建结果含有隐私私有路径的问题

  await Promise.all(
    Object.keys(outputFiles)
      .filter(e => {
        if (e.endsWith('.js')) {
          return true
        }
        return false
      })
      .map(async key => {
        const bundle = await rollup.rollup({
          input: key,
          external: Object.keys(dependencies),
          plugins: [
            {
              name: 'loader',
              resolveId (source) {
                if (source === key) {
                  return source
                }
                return ''
              },
              async load (id) {
                if (id === key) {
                  return {
                    code: outputFiles[key],
                    map: JSON.parse(outputFiles[key + '.map']) || null
                  }
                }
                return ''
              }
            }
          ]
        })

        const { output } = await bundle.generate({
          format: 'amd',
          name: 'schema',
          sourcemap: true,
          amd: {
            define: defineMethodName
          }
        })
        outputFiles[key] = output[0].code
        //@ts-ignore
        outputFiles[key + '.map'] = output[1]?.source
      })
  )

  // await Promise.all([
  //   ...Object.keys(outputFiles)
  //     .filter(e => {
  //       if (e.endsWith('.js')) {
  //         return true
  //       }
  //       return false
  //     })
  //     .map(async key => {
  //       const minifyRes = await esbuild.transform(outputFiles[key], {
  //         loader: 'js',
  //         minify: true,
  //         sourcemap: true
  //       })
  //       outputFiles[key] =
  //         minifyRes.code + `//# sourceMappingURL=` + 'index.js.map'
  //       outputFiles[key + '.map'] = minifyRes.map
  //     }),
  //   ...Object.keys(outputFiles)
  //     .filter(e => {
  //       if (e.endsWith('.css')) {
  //         return true
  //       }
  //       return false
  //     })
  //     .map(async key => {
  //       const minifyRes = await esbuild.transform(outputFiles[key], {
  //         loader: 'css',
  //         minify: true,
  //         sourcemap: true
  //       })
  //       outputFiles[key] = minifyRes.code
  //       outputFiles[key + '.map'] = minifyRes.map
  //     })
  // ])

  return outputFiles
}
