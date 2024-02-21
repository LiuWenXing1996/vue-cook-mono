import { contextSchemaToCode, type IContextSchema } from './context'
import { importSchemaListToCode, type IImportSchema } from './import'
import { templateSchemaParser, type ITemplateSchema, templateSchemaToCode } from './template'
import { parse as YamlParser } from 'yaml'
import type { ICodeFile } from '@/utils'
import {
  aliasComponentSchemasToImportSchemas,
  type IAliasComponentSchema
} from './alias-component'

export interface IViewSchemaBase {
  tag: string
  type: string
  export: {
    isExport: boolean
    exportName: string
  }
  template: ITemplateSchema[]
  styles: string
  context: IContextSchema
  components?: IAliasComponentSchema[]
}

export interface IComponentViewSchema extends IViewSchemaBase {
  type: 'component'
}

export interface ILayoutViewSchema extends IViewSchemaBase {
  type: 'layout'
}

export interface IPageViewSchema extends IViewSchemaBase {
  type: 'page'
  layout: IImportSchema
  router: {
    path: string
  }
}

export type IViewSchema = IComponentViewSchema | ILayoutViewSchema | IPageViewSchema

export type IViewSchemaToIViewSchemaYaml<V extends IViewSchema> = V extends IViewSchema
  ? {
      [key in Exclude<keyof V, 'template'>]: V[key]
    } & {
      template: string
    }
  : never

export type IViewSchemaYaml = IViewSchemaToIViewSchemaYaml<IViewSchema>
export interface IViewSchemaFile {
  path: string
  content: IViewSchema
}

export const viewSchemaParser = async (content: string): Promise<IViewSchema> => {
  const viewSchemaYaml: IViewSchemaYaml = YamlParser(content)
  const viewSchema: IViewSchema = {
    ...viewSchemaYaml,
    template: await templateSchemaParser(viewSchemaYaml.template)
  }
  return viewSchema
}

export const viewSchemaToCode = async (viewSchema: IViewSchema): Promise<ICodeFile[]> => {
  const contextFile: ICodeFile = {
    content: await contextSchemaToCode(viewSchema.context),
    path: './context.ts'
  }
  const stylesFile: ICodeFile = {
    content: viewSchema.styles,
    path: './style.css'
  }
  const indexVueFile: ICodeFile = {
    content: '',
    path: './index.vue'
  }
  const aliasComponentImports = aliasComponentSchemasToImportSchemas(viewSchema.components || [])
  const indexVueImports: IImportSchema[] = [
    ...aliasComponentImports,
    {
      path: './context',
      type: 'default',
      name: 'context'
    },
    {
      path: '@vue-cook/render',
      type: 'destructuring',
      names: [
        {
          exportName: 'useViewContext'
        }
      ]
    },
    {
      path: './style.css',
      type: 'sideEffect'
    }
  ]

  indexVueFile.content = `
<script setup lang="ts">  
${importSchemaListToCode(indexVueImports)}

const { states, actions } = useViewContext(context);
</script>
<template>
  ${await templateSchemaToCode(viewSchema.template)}
</template>
  `

  const indexTsFile: ICodeFile = {
    content: '',
    path: './index.ts'
  }

  const indexTsImports: IImportSchema[] = [
    {
      path: './index.vue',
      type: 'default',
      name: 'View'
    }
  ]

  indexTsFile.content = `
${importSchemaListToCode(indexTsImports)}
${
  viewSchema.type === 'page'
    ? `
View.router = {
  path:"${viewSchema.router.path}"
}
`
    : ''
}
export default View
`

  return [contextFile, stylesFile, indexVueFile, indexTsFile]
}
