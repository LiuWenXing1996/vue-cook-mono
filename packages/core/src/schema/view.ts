import type { ITemplateSchema } from './template'

export interface IImportSchema {
  path: string
  aliasName?: string
  exportName?: string
  importAll?: boolean
  destructuring?: boolean
}

export interface IActionSchema {
  name: string
  content: string
}

export type IStateSchema =
  | {
      type: 'string'
      content: string
    }
  | {
      type: 'number'
      content: number
    }
  | {
      type: 'boolean'
      content: boolean
    }
  | {
      type: 'json-array'
      content: string
    }
  | {
      type: 'json-object'
      content: string
    }

export interface IViewSchemaBase {
  tag: string
  type: string
  template: ITemplateSchema[]
  context: {
    imports?: IImportSchema[]
    styles?: {
      content: string
      module?: boolean
    }
    states?: IStateSchema[]
    actions?: IActionSchema[]
  }
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

export interface IViewSchemaFile {
  path: string
  content: IViewSchema
}
