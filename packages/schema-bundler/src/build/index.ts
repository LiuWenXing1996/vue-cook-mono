import { createVfs, type IVirtulFileSystem } from '../utils/fs'
import type * as esbuild from 'esbuild'
import type { Plugin as IEsbuildPlugin, Loader } from 'esbuild'
import type * as swc from '@swc/core'
import {
  getCookConfigFromFs,
  getPkgJsonFromFs,
  getViewFilesFromFs,
  getViewSchemaFilePathListFromFs,
  path,
  templateSchemaParser,
  viewSchemaParser
} from '@vue-cook/core'
import { virtualFsPlugin } from './plugins/virtual-fs-plugin'
import { generateExternal } from '../utils/external'
import { vueSfcPlugin } from './plugins/vue-sfc-plugin'
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
  const { esbuild, vfs: orginVfs, swc } = params
  // console.log(await orginVfs.listFiles())
  const vfs = createVfs()
  await vfs.copyFromFs('/', orginVfs)
  // console.log(await vfs.listFiles())
  const pkgJsonObj = await getPkgJsonFromFs(vfs)
  if (!pkgJsonObj) {
    return
  }
  const { content: pkgJson, path: pkgJsonPath } = pkgJsonObj

  const cookConfigObj = await getCookConfigFromFs(vfs)
  if (!cookConfigObj) {
    return
  }
  const { content: cookConfig, path: cookConfigPath } = cookConfigObj
  const viewSchemaFilePathList = await getViewSchemaFilePathListFromFs(vfs)
  const viewSchemaFiles = await Promise.all(
    viewSchemaFilePathList.map(async (filePath) => {
      const viewSchemaString = await vfs.readFile(filePath, 'utf-8')
      const viewSchema = await viewSchemaParser(viewSchemaString)
      return {
        path: filePath,
        schema: viewSchema
      }
    })
  )

  const viewFiles = await getViewFilesFromFs(vfs)
  const actionFiles: {
    viewFilePath: string
    viewFileIndex: number
    action: IJsFunctionActionSchema
    actionIndex: number
  }[] = []

  const entryCss = {
    path: `/index.css`,
    content: `/* schema css content */`
  }
  const entryTs = {
    content: '',
    path: '/index.ts'
  }

  entryTs.content = `
import "./index.css"



${viewSchemaFiles
  .map((viewSchemaFile, index) => {
    let realtivePath = './' + relative(dirname(entryTs.path), viewSchemaFile.path)
    realtivePath = trimExtname(realtivePath, ['.ts', '.js'])
    const { schema } = viewSchemaFile
    return `import Schema${index} from "${realtivePath}"`
  })
  .join('\n')}

${actionFiles
  .map((actionFile) => {
    let absolutePath = resolve(dirname(actionFile.viewFilePath), actionFile.action.jsPath)
    let realtivePath = './' + relative(dirname(entryTs.path), absolutePath)
    realtivePath = trimExtname(realtivePath, ['.ts', '.js'])
    return `import { ${actionFile.action.varName} as View${actionFile.viewFileIndex}Action${actionFile.actionIndex}} from "${realtivePath}"`
  })
  .join('\n')}

export const schemaList = [
  ${viewFiles
    .map((viewFile, index) => {
      return `{
        path:"${viewFile.path}",
        content:Schema${index}
      }`
    })
    .join(',\n')}
]

export const jsFunctions = [
  ${actionFiles
    .map((actionFile) => {
      return `{
        name:"${actionFile.action.name}",
        schemaPath:"${actionFile.viewFilePath}",
        content: View${actionFile.viewFileIndex}Action${actionFile.actionIndex}
      }`
    })
    .join(',\n')}
]
`
  await vfs.outputFile(entryCss.path, entryCss.content)
  await vfs.outputFile(entryTs.path, entryTs.content)
  console.log(entryTs.content)
  const outputFiles = {
    js: '',
    css: ''
  }

  {
    // bundle
    const bundleRes = await esbuild.build({
      entryPoints: [entryTs.path],
      bundle: true,
      target: ['es2015'],
      format: 'cjs',
      write: false,
      external: generateExternal(pkgJson),
      outdir: '/',
      sourcemap: cookConfig.sourcemap ? 'inline' : false,
      plugins: [vueSfcPlugin({ vfs, cookConfig }), virtualFsPlugin({ vfs, cookConfig })]
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
