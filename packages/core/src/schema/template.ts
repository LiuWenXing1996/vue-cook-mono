import type { IActionDataSchema, IBooleanDataSchema, IDataSchema, IStateDataSchema } from './data'

export interface ITemplateSchema {
  tag: string
  attributes?: {
    class?: {
      [className: string]: IBooleanDataSchema | IStateDataSchema
    }
    events?: {
      [eventName: string]: IActionDataSchema
    }
    props?: {
      [propName: string]: IDataSchema
    }
  }
  slots?: ISlotSchema[]
}

export interface ISlotSchema {
  name: string
  content: ITemplateSchema[] | undefined
}

export interface ITemplateTreeTemplateNode {
  id: string
  parent: ITemplateTreeSlotNode | undefined
  root: ITemplateTreeTemplateNode[]
  isLeaf: boolean
  content: ITemplateSchema
  children?: ITemplateTreeSlotNode[]
}

export interface ITemplateTreeSlotNode {
  id: string
  parent: ITemplateTreeTemplateNode
  root: ITemplateTreeTemplateNode[]
  isLeaf: boolean
  content: ISlotSchema
  children?: ITemplateTreeTemplateNode[]
}
// TODO:实现新的templateSchemaToTree

export const templateSchemaToTree = (
  templateList: ITemplateSchema[]
): ITemplateTreeTemplateNode[] => {
  const transferTemplateSchema = (params: {
    schema: ITemplateSchema
    index: number
    parent: ITemplateTreeSlotNode | undefined
    root: ITemplateTreeTemplateNode[]
  }) => {
    const { schema, parent, root, index } = params
    const tag = schema.tag
    const slots = schema.slots || []
    const node: ITemplateTreeTemplateNode = {
      id: `${parent?.id || '#root'}__${index}__${tag}`,
      parent,
      root,
      isLeaf: !(slots.length > 0),
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
    parent: ITemplateTreeTemplateNode
    root: ITemplateTreeTemplateNode[]
  }) => {
    const { schema, parent, root } = params
    const content = schema.content || []
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

  const tree: ITemplateTreeTemplateNode[] = []

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
