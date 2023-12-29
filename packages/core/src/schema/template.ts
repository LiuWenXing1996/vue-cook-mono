import type { IActionDataSchema, IBooleanDataSchema, IDataSchema, IStateDataSchema } from './data'
import posthtml, { type Node as IPostHtmlNode } from 'posthtml'
import {
  parser as posthtmlParser,
  type Node as IPosthtmlNode,
  type NodeTag as IPosthtmlNodeTag,
  type Content as IPosthtmlNodeContent
} from 'posthtml-parser'
import { isArray } from 'lodash'

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

const isNodeTag = (node: IPosthtmlNode): node is IPosthtmlNodeTag => {
  // @ts-ignore
  if (node.tag) {
    return true
  }
  return false
}

export const templateParser = async (template: string): Promise<ITemplateSchema[]> => {
  const result: ITemplateSchema[] = []
  const posthtmlNodeList = posthtmlParser(template)
  console.log(posthtmlNodeList)
  const posthtmlNodeToTemplateSchema = (node: IPosthtmlNode): ITemplateSchema | undefined => {
    if (!isNodeTag(node)) {
      return
    }
    const { tag, attrs = {}, content } = node
    if (!tag) {
      return
    }
    if (typeof tag !== 'string') {
      return
    }
    const attributes: NonNullable<ITemplateSchema['attributes']> = {}
    Object.keys(attrs).map((key) => {
      if (!key.startsWith('data')) {
        return
      }
      const [dataLabel, dataType, ...dataNames] = key.split('-')
      const dataName = dataNames.join('-')
      if (dataType === 'class') {
        attributes.class = {
          ...attributes.class,
          [dataName]: JSON.parse(attrs[key] as string)
        }
      }
      if (dataType === 'event') {
        attributes.events = {
          ...attributes.events,
          [dataName]: JSON.parse(attrs[key] as string)
        }
      }
      if (dataType === 'prop') {
        attributes.props = {
          ...attributes.props,
          [dataName]: JSON.parse(attrs[key] as string)
        }
      }
    })
    const slots: ISlotSchema[] = []
    if (content) {
      if (isArray(content)) {
        const nodeTagList = content.filter((e) => {
          if (isArray(e)) {
            return false
          }
          if (isNodeTag(e)) {
            return true
          }
          return false
        }) as IPosthtmlNodeTag[]
        for (const nodeTag of nodeTagList) {
          if (!nodeTag.tag) {
            return
          }
          if (nodeTag.tag === 'template') {
          }
        }
      }
    }
    return {
      tag,
      attributes,
      slots
    }
  }
  const nodeContentToSlotSchemaList = (content: IPosthtmlNodeContent): ISlotSchema[] => {
    const slotsObj:{
      [slotName:string]:ISlotSchema["content"]
    } ={}
    if (content) {
      if (isArray(content)) {
        const nodeTagList = content.filter((e) => {
          if (isArray(e)) {
            return false
          }
          if (isNodeTag(e)) {
            return true
          }
          return false
        }) as IPosthtmlNodeTag[]
        for (const tagNode of nodeTagList) {
          const { tag, attrs = {}, content } = tagNode
          if (tag === 'template') {
            const slotName = attrs['data-slot-name']
            if (slotName && typeof slotName === 'string') {
              
              slotsObj[slotName]=[...(slotsObj[slotName]||[]),]
            }
          }
        }
      }
    }
    const slots:ISlotSchema[] = Object.keys(slotsObj).map(name=>{
      return {
        name,
        content:slotsObj[name]
      }
    })

    return slots
  }
  posthtmlNodeList.map((node) => {})
  debugger
  return result
}
