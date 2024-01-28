import type { IAction, IActionSchema } from './action'
import type { IStateSchema } from './state'
import type { IAttributeSchema } from './attribute'
import type { ITemplateSchema } from './template'
import type { IAliasComponentSchema } from './component'

export interface IViewSchemaBase {
  tag: string
  type: string
  templateFile: string
  actionsFile?: string
  styleFile?: string
  states?: IStateSchema[]
  components?: IAliasComponentSchema[]
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
  content: {
    view: IViewSchema
    actions: Record<string, IAction>
    template: ITemplateSchema[]
  }
}
