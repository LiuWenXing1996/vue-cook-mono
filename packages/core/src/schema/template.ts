import type {
  IActionAttributeSchema,
  IAttributeSchema,
  IStateAttributeSchema,
  IStringAttributeSchema
} from './attribute'

export interface ISlotSchema {
  name: string
  content: ITemplateSchema[]
}

export interface IEventSchema {
  name: string
  content: IActionAttributeSchema[]
}

export interface ITemplateSchemaBase {
  type: string
}

export interface ITemplateTextSchema extends ITemplateSchemaBase {
  type: 'Text'
  content: IStringAttributeSchema | IStateAttributeSchema
}

export interface ITemplateTagSchema extends ITemplateSchemaBase {
  type: 'Tag'
  tag: string
  attributes?: IAttributeSchema[]
  slots?: ISlotSchema[]
  events?: IEventSchema[]
}

export type ITemplateSchema = ITemplateTextSchema | ITemplateTagSchema

export interface ITemplateTreeSchemaNode {
  id: string
  parent: ITemplateTreeSlotNode | undefined
  root: ITemplateTreeSchemaNode[]
  isLeaf: boolean
  content: ITemplateSchema
  children?: ITemplateTreeSlotNode[]
}

export interface ITemplateTreeSlotNode {
  id: string
  parent: ITemplateTreeSchemaNode
  root: ITemplateTreeSchemaNode[]
  isLeaf: boolean
  content: ISlotSchema
  children?: ITemplateTreeSchemaNode[]
}

export const templateSchemaToTree = (
  templateList: ITemplateSchema[]
): ITemplateTreeSchemaNode[] => {
  const transferTemplateSchema = (params: {
    schema: ITemplateSchema
    index: number
    parent: ITemplateTreeSlotNode | undefined
    root: ITemplateTreeSchemaNode[]
  }) => {
    const { schema, parent, root, index } = params
    const tag = (schema.type === 'Text' ? '#text' : schema.tag) || 'unknown-tag'
    let slots: ISlotSchema[] = []
    if (schema.type === 'Tag') {
      slots = schema.slots || []
    }
    const node: ITemplateTreeSchemaNode = {
      id: `${parent?.id || '#root'}__${index}__${tag}`,
      parent,
      root,
      isLeaf: !(slots.length > 1),
      content: schema,
      children: []
    }
    node.children = slots.map((s) =>
      transferSlotSchema({
        schema: s,
        parent: node,
        root: root
      })
    )
    return node
  }

  const transferSlotSchema = (params: {
    schema: ISlotSchema
    parent: ITemplateTreeSchemaNode
    root: ITemplateTreeSchemaNode[]
  }) => {
    const { schema, parent, root } = params
    const content = schema.content
    const node: ITemplateTreeSlotNode = {
      id: `${parent.id}__${schema.name}`,
      parent,
      root,
      isLeaf: !(content.length > 0),
      content: schema,
      children: []
    }
    node.children = content.map((e, i) =>
      transferTemplateSchema({
        schema: e,
        index: i,
        parent: node,
        root: tree
      })
    )
    return node
  }

  const tree: ITemplateTreeSchemaNode[] = []

  templateList.map((l, i) => {
    const node = transferTemplateSchema({
      schema: l,
      index: i,
      parent: undefined,
      root: tree
    })
    tree.push(node)
  })

  return tree
}
