import type { IContextSchema, IImportSchema } from './context'
import { templateSchemaParser, type ITemplateSchema } from './template'
import { parse as YamlParser } from 'yaml'

export interface IViewSchemaBase {
  tag: string
  type: string
  template: ITemplateSchema[]
  styles: string
  context: IContextSchema
  components?: IImportSchema[]
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
