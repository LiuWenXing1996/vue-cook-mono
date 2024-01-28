import type { Plugin, Loader } from 'esbuild'
import { path, type IViewEntrySchema, templateParser } from '@vue-cook/core'
import { defineEsbuildPlugin } from '@/utils/define-esbuild-plugin'
import { inferLoader } from './virtual-fs-plugin'
const { isAbsolute, join, rootName, extname, dirname, relative, trimExtname } = path

const removeQuery = (p: string) => p.replace(/\?.+$/, '')


export const viewSchemaPlugin = defineEsbuildPlugin((params) => {
  const { vfs, cookConfig } = params
  const namespace = 'viewSchema'
  const viewSchemaFileFilter = new RegExp(`${cookConfig.viewEntryFile}$`)
  const templateSchemaFilter = new RegExp(`.html\\?type=template$`)
  const viewSchemaFilter = new RegExp(`${cookConfig.viewEntryFile}\\?type=view$`)
  debugger
  const formatPath = (p: string, resolveDir: string) => {
    let filepath = p
    if (!isAbsolute(p)) {
      const realtivePath = relative(rootName(), resolveDir)
      filepath = join(realtivePath, filepath)
    }
    return filepath
  }
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter: viewSchemaFileFilter }, (args) => {
        const newPath = formatPath(args.path, args.resolveDir)
        return {
          path: newPath,
          namespace
        }
      })
      build.onResolve({ filter: templateSchemaFilter }, (args) => {
        const newPath = formatPath(args.path, args.resolveDir)
        return {
          path: newPath,
          namespace
        }
      })
      build.onResolve({ filter: viewSchemaFilter }, (args) => {
        const newPath = formatPath(args.path, args.resolveDir)
        return {
          path: newPath,
          namespace
        }
      })
      build.onLoad({ filter: viewSchemaFileFilter, namespace }, async (args) => {
        let realPath = args.path
        let contents = ''
        try {
          const viewEntrySchema = await vfs.readJson<IViewEntrySchema>(realPath)
          const { styleFile, actionsFile, templateFile } = viewEntrySchema
          const entryJsonPath = './' + relative(dirname(realPath), realPath)
          contents = `
${styleFile ? `import "${styleFile}";\n` : ''} 
${actionsFile ? `import * as actions from "${actionsFile}";\n` : ''}
import view from "${entryJsonPath}?type=view";
import template from "${templateFile}?type=template";
export default {
  ${actionsFile ? `actions,` : ''}
  view,
  template
}
`
        } catch (error) {
          debugger
        }
        console.log(contents)
        debugger

        return {
          contents,
          resolveDir: dirname(realPath),
          loader: 'js'
        }
      })
      build.onLoad({ filter: templateSchemaFilter, namespace }, async (args) => {
        let realPath = removeQuery(args.path)
        let contents = ''
        try {
          const templateContent = await vfs.readFile(realPath, 'utf-8')
          const templateSchemaList = await templateParser(templateContent)
          contents = JSON.stringify(templateSchemaList, null, 2)
        } catch (error) {
          debugger
        }
        debugger

        return {
          contents,
          resolveDir: dirname(realPath),
          loader: 'json'
        }
      })
      build.onLoad({ filter: viewSchemaFilter, namespace }, async (args) => {
        let realPath = removeQuery(args.path)
        let contents = ''
        try {
          contents = await vfs.readFile(realPath, 'utf-8')
        } catch (error) {
          debugger
        }
        debugger

        return {
          contents,
          resolveDir: dirname(realPath),
          loader: 'json'
        }
      })
    }
  }
})
