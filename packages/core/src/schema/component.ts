export interface IAliasComponentSchemaBase {
  tag: string
  type: string
}

export interface IDepAliasComponentSchema extends IAliasComponentSchemaBase {
  type: 'Dep'
  packageName: string
  varName: string
}

export interface IInnerAliasComponentSchema extends IAliasComponentSchemaBase {
  type: 'Inner'
  componentFilePath: string
}

export type IAliasComponentSchema = IDepAliasComponentSchema | IInnerAliasComponentSchema
