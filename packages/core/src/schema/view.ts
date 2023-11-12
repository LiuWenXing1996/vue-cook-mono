import type { IAction } from './action'
import type { IState } from './state'
import type { IAliasComponent } from './component'
import type { IAttributeSchema } from './attribute'
import type { ITemplateSchema } from './template'

export interface IViewSchema {
  name: string
  type: 'Component' | 'Page' | 'Layout'
  template?: ITemplateSchema[]
  style?: string
  states?: IState[]
  props?: Record<string, unknown>
  actions?: IAction[]
  components?: IAliasComponent[]
  i18ns?: {
    name: string
    content: {
      [langKey: string]: string
    }
  }[]
}
