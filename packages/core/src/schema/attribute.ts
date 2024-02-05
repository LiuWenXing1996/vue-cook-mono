export interface IBaseAttributeSchema {
  type: string
  content: any
}

export type IAttributeSchema =
  | IActionAttributeSchema
  | IStringAttributeSchema
  | IStateAttributeSchema
  | INumberAttributeSchema
  | IBooleanAttributeSchema
  | II18nAttributeSchema
  | IObjectAttributeSchema
  | IListAttributeSchema

export interface IActionAttributeSchema extends IBaseAttributeSchema {
  type: 'action'
  content: string
}

export interface IStateAttributeSchema extends IBaseAttributeSchema {
  type: 'state'
  content: string
}

export interface IStringAttributeSchema extends IBaseAttributeSchema {
  type: 'string'
  content: string
}

export interface INumberAttributeSchema extends IBaseAttributeSchema {
  type: 'number'
  content: number
}

export interface IBooleanAttributeSchema extends IBaseAttributeSchema {
  type: 'boolean'
  content: boolean
}

export interface II18nAttributeSchema extends IBaseAttributeSchema {
  type: 'i18n'
  content: string
}

export interface IObjectAttributeSchema extends IBaseAttributeSchema {
  type: 'object'
  content: {
    [key: string]: IAttributeSchema
  }
}

export interface IListAttributeSchema extends IBaseAttributeSchema {
  type: 'list'
  content: IListAttrbuteItemSchema[]
}

export type IAttrbuteSchemaToIListAttrbuteItemSchema<S extends IAttributeSchema> =
  S extends IAttributeSchema
    ? {
        type: S['type']
        key: string
        list: S['content'][]
      }
    : never

export type IListAttrbuteItemSchema = IAttrbuteSchemaToIListAttrbuteItemSchema<IAttributeSchema>

export const attrbuteSchemaToCodeMap: Record<
  IAttributeSchema['type'],
  ((schema: IAttributeSchema) => string) | undefined
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
    return `${key}:${attrbuteSchemaToCodeMap[_schema.type]?.(_schema)}`
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
      let transposeListContent: IObjectAttributeSchema[] = []
      schema.content.map((listStateItemSchema) => {
        listStateItemSchema.list.map((item, itemIndex) => {
          const itemSchema = {
            type: listStateItemSchema.type,
            content: item
          } as IAttributeSchema
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
          return attrbuteSchemaToCodeMap.object?.(objectSchema)
        })}
]`
      return `${schema.content}`
    }
    return content
  },
  action: (schema) => {
    let content = ''
    if (schema.type === 'action') {
      return `actions.${schema.content}`
    }
    return content
  },
  state: (schema) => {
    let content = ''
    if (schema.type === 'state') {
      return `states.${schema.content}`
    }
    return content
  },
  i18n: (schema) => {
    let content = ''
    if (schema.type === 'i18n') {
      return `i18ns.${schema.content}`
    }
    return content
  }
}

export const attrbuteSchemaToCode = (schema: IAttributeSchema) => {
  const toCode = attrbuteSchemaToCodeMap[schema.type]
  const content = toCode?.(schema) || ''
  return content
}