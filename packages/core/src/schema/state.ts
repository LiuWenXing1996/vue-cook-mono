export type IStateSchema =
  | IStringStateSchema
  | INumberStateSchema
  | IBooleanStateSchema
  | IObjectStateSchema
  | IListStateSchema

export interface IStateSchemaBase {
  type: string
}

export interface IStringStateSchema extends IStateSchemaBase {
  type: 'string'
  content: string
}
export interface INumberStateSchema extends IStateSchemaBase {
  type: 'number'
  content: number
}
export interface IBooleanStateSchema extends IStateSchemaBase {
  type: 'boolean'
  content: boolean
}

export interface IObjectStateSchema extends IStateSchemaBase {
  type: 'object'
  content: {
    [key: string]: IStateSchema
  }
}

export interface IListStateSchema extends IStateSchemaBase {
  type: 'list'
  content: IListStateItemSchema[]
}

export type IStateSchemaToIListStateItemSchema<S extends IStateSchema> = S extends IStateSchema
  ? {
      type: S['type']
      list: S['content'][]
    }
  : never

export type IListStateItemSchema = IStateSchemaToIListStateItemSchema<IStateSchema>

const a: IStateSchema = {
  type: 'object',
  content: {
    a: {
      type: 'boolean',
      content: false
    },
    s: {
      type: 'object',
      content: {
        aa: {
          type: 'number',
          content: 1
        }
      }
    },
    ls: {
      type: 'list',
      content: [
        {
          type: 'string',
          list: ['1', '2', 'false']
        }
      ]
    }
  }
}
