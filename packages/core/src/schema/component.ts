import { type IViewSchema } from './view'

export interface IComponentSchema extends IViewSchema {
  type: 'Component'
}

export type IAliasComponent = IDepComponent | IInnerComponent

export interface IAliasComponentBase {
  tag: string
  type: string
}

export interface IDepComponent extends IAliasComponentBase {
  type: 'Dep'
  packageName: string
  varName: string
}

export interface IInnerComponent extends IAliasComponentBase {
  type: 'Inner'
  componentFilePath: string
}
