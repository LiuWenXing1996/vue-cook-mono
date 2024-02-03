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
      key: string
      list: S['content'][]
    }
  : never

export type IListStateItemSchema = IStateSchemaToIListStateItemSchema<IStateSchema>

export const stateSchemaToCodeMap: Record<
  IStateSchema['type'],
  ((schema: IStateSchema) => string) | undefined
> = {
  string: (schema) => {
    let content = ''
    if (schema.type === 'string') {
      return `"${schema.content}"`
    }
    return content
  },
  number: (schema) => {
    let content = ''
    if (schema.type === 'number') {
      return `${schema.content}`
    }
    return content
  },
  boolean: (schema) => {
    let content = ''
    if (schema.type === 'boolean') {
      return `${schema.content}`
    }
    return content
  },
  object: (schema) => {
    let content = ''
    if (schema.type === 'object') {
      content = `{
${Object.keys(schema.content)
  .map((key) => {
    const _schema = schema.content[key]
    return `${key}:${stateSchemaToCodeMap[_schema.type]?.(_schema)}`
  })
  .join(',\n')}
}`
    }
    content = ''
    return content
  },
  list: (schema) => {
    let content = ''
    if (schema.type === 'list') {
      let transposeListContent: IObjectStateSchema[] = []
      schema.content.map((listStateItemSchema) => {
        listStateItemSchema.list.map((item, itemIndex) => {
          const itemSchema = {
            type: listStateItemSchema.type,
            content: item
          } as IStateSchema
          transposeListContent[itemIndex] = {
            type: 'object',
            content: {
              ...transposeListContent[itemIndex].content,
              [listStateItemSchema.key]: itemSchema
            }
          }
        })
      })
      content = `[
        ${transposeListContent.map((objectSchema) => {
          return stateSchemaToCodeMap.object?.(objectSchema)
        })}
]`
      return `${schema.content}`
    }
    return content
  }
}

export const stateSchemaToCode = (schema: IStateSchema) => {
  const toCode = stateSchemaToCodeMap[schema.type]
  const content = toCode?.(schema) || ''
  return content
}

const test: IStateSchema = {
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
          key: 'STR',
          list: ['1', '2', 'false']
        }
      ]
    }
  }
}
