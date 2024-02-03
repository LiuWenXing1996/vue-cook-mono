import { createVfs, type IVirtulFileSystem } from '../utils/fs'
import {
  contextSchemaToCode,
  getCookConfigFromFs,
  getPkgJsonFromFs,
  getViewFilesFromFs,
  getViewSchemaFilePathListFromFs,
  path,
  templateSchemaParser,
  templateSchemaToTsxTemplate,
  viewSchemaParser
} from '@vue-cook/core'
export const transform = async (params: { vfs: IVirtulFileSystem }) => {
  const { vfs: orginVfs } = params
  const vfs = createVfs()
  await vfs.copyFromFs('/', orginVfs)
  const viewSchemaFilePathList = await getViewSchemaFilePathListFromFs(vfs)
  await Promise.all(
    viewSchemaFilePathList.map(async (filePath) => {
      const viewSchemaString = await vfs.readFile(filePath, 'utf-8')
      const viewSchema = await viewSchemaParser(viewSchemaString)
      const contextFile = {
        content: await contextSchemaToCode(viewSchema.context),
        path: './context.ts'
      }

      await vfs.outputFile(contextFile.path, contextFile.content)

      const viewVueFile = {
        content: ``,
        path: path.replaceExtname(viewFile.path, 'vue')
      }
      const { styleFile, actionsFile, templateFile, states } = viewFile.content
      const templateHtmlPath = path.resolve(path.dirname(viewFile.path), templateFile)
      const templateHtmlContent = await vfs.readFile(templateHtmlPath, 'utf-8')
      const templateSchema = await templateSchemaParser(templateHtmlContent)
      console.log(templateSchema)
      const tsxTpl = await templateSchemaToTsxTemplate(templateSchema)
      console.log(tsxTpl)
      viewVueFile.content = `
<template>
${tsxTpl}
</template>
<script setup lang="ts">
import { useViewContext } from "@vue-cook/render";
${
  actionsFile
    ? `import * as actions from "${path.trimExtname(actionsFile, ['.ts', '.js'])}";\n`
    : ''
}
${styleFile ? `import "${styleFile}";\n` : ''} 

const viewContext = useViewContext({
  states: {
    ${states?.map((state) => {
      let content = state.content
      if (state.type === 'String') {
        content = `"${content}"`
      }
      return `${state.name}:${content}`
    })}
  },
  actions: {}
})
const { states } = viewContext

</script>
`
      // 出码后的美化可以使用premitter,这样会好一点
      // TODO: 已经可以出码一些内容了，是不是可以和构建的逻辑联通下，然后把设计态和预览态都做出来
      // 如果设计态和预览态都用统一套资源会不会出事呢？最好试试，不会出事最好了
      await vfs.outputFile(viewVueFile.path, viewVueFile.content)
    })
  )

  return vfs
}
