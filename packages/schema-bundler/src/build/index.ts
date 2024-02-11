import { createVfs, type IVirtulFileSystem } from '../utils/fs'
import type * as esbuild from 'esbuild'
import type { Plugin as IEsbuildPlugin, Loader, BuildOptions } from 'esbuild'
import type * as swc from '@swc/core'
import {
  ElementDataCoreLibOnceGetterIdIdKey,
  getCookConfigFromFs,
  getPkgJsonFromFs,
  getViewFilesFromFs,
  getViewSchemaFilePathListFromFs,
  path,
  templateSchemaParser,
  viewSchemaParser,
  CjsWrapperBanner,
  CjsWrapperFooter
} from '@vue-cook/core'
import { virtualFsPlugin } from './plugins/virtual-fs-plugin'
import { generateExternal } from '../utils/external'
import { vueSfcPlugin } from './plugins/vue-sfc-plugin'
import { transform } from '@/transform'
const { resolve, dirname, relative, trimExtname } = path

export type IEsbuild = typeof esbuild
export type ISwc = typeof swc

export interface IOutJsFile {
  type: 'js'
  content: string
}

export interface IOutCssFile {
  type: 'css'
  content: string
}

export type IOutFile = IOutJsFile | IOutCssFile
export const getOutFilesByType = <T extends IOutFile = IOutFile>(
  outputFiles: Record<string, IOutFile>,
  type: T['type']
) => {
  let files: Record<string, T> = {}
  Object.keys(outputFiles).map((filePath) => {
    const outFile = outputFiles[filePath]
    if (outFile.type === type) {
      files[filePath] = outFile as T
    }
  })
  return files
}

export const build = async (params: { vfs: IVirtulFileSystem; esbuild: IEsbuild; swc: ISwc }) => {
  // TODO:实现build
  const { esbuild, vfs: orginVfs, swc } = params
  const codeVfs = await transform({
    vfs: orginVfs
  })
  const vfs = createVfs()
  await vfs.copyFromFs('/', codeVfs)
  const pkgJsonObj = await getPkgJsonFromFs(vfs)
  if (!pkgJsonObj) {
    return
  }
  const { content: pkgJson, path: pkgJsonPath } = pkgJsonObj

  const cookConfigObj = await getCookConfigFromFs(vfs)
  if (!cookConfigObj) {
    return
  }
  const { content: cookConfig } = cookConfigObj

  const outputFiles = {
    js: '',
    css: ''
  }
  const files = await vfs.listFiles()
  console.log(files)

  {
    // bundle
    const bundleRes = await esbuild.build({
      entryPoints: ['/src/index.ts'],
      bundle: true,
      target: ['es2015'],
      format: 'cjs',
      write: false,
      external: generateExternal(pkgJson),
      outdir: '/',
      sourcemap: cookConfig.sourcemap ? 'inline' : false,
      plugins: [vueSfcPlugin({ vfs, cookConfig }), virtualFsPlugin({ vfs, cookConfig })],
      banner: {
        js: CjsWrapperBanner
      },
      footer: {
        js: CjsWrapperFooter
      }
    })

    outputFiles.js = (bundleRes.outputFiles || []).find((e) => e.path.endsWith('.js'))?.text || ''
    outputFiles.css = (bundleRes.outputFiles || []).find((e) => e.path.endsWith('.css'))?.text || ''
  }
  {
    // transform
    const bundle = await swc.transform(outputFiles.js, {
      sourceMaps: cookConfig.sourcemap ? 'inline' : false
    })
    outputFiles.js = bundle.code
  }

  {
    // minify
    if (cookConfig.minify) {
      await Promise.all([
        (async () => {
          const minifyRes = await esbuild.transform(outputFiles.js, {
            loader: 'js',
            minify: true,
            sourcemap: cookConfig.sourcemap ? 'inline' : false
          })
          outputFiles.js = minifyRes.code
        })(),
        (async () => {
          const minifyRes = await esbuild.transform(outputFiles.css, {
            loader: 'css',
            minify: true,
            sourcemap: cookConfig.sourcemap ? 'inline' : false
          })
          outputFiles.css = minifyRes.code
        })()
      ])
    }
  }

  return outputFiles
}
