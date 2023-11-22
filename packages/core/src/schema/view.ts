import type { IActionSchema } from './action'
import type { IStateSchema } from './state'
import type { IAttributeSchema } from './attribute'
import type { ITemplateSchema } from './template'
import type { IAliasComponentSchema } from './component'

export interface IViewSchemaBase {
  name: string
  type: string
  template?: ITemplateSchema[]
  style?: string
  states?: IStateSchema[]
  props?: Record<string, unknown>
  actions?: IActionSchema[]
  components?: IAliasComponentSchema[]
  i18ns?: {
    name: string
    content: {
      [langKey: string]: string
    }
  }[]
}

export interface IComponentViewSchema extends IViewSchemaBase {
  type: 'Component'
}

export interface ILayoutViewSchema extends IViewSchemaBase {
  type: 'Layout'
}

export interface IPageViewSchema extends IViewSchemaBase {
  type: 'Page'
  router: {
    path: string
  }
}

export type IViewSchema = IComponentViewSchema | ILayoutViewSchema | IPageViewSchema

export interface IViewFileSchema {
  path: string
  content: IViewSchema
}
