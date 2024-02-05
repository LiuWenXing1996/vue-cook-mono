import type { IActionDataSchema, IBooleanDataSchema, IDataSchema, IStateDataSchema } from './data'
import {
  parser as posthtmlParser,
  type Node as IPosthtmlNode,
  type NodeTag as IPosthtmlNodeTag,
  type Content as IPosthtmlNodeContent
} from 'posthtml-parser'
import { render as posthtmlRender } from 'posthtml-render'
import { isArray } from 'lodash'
import {
  attrbuteSchemaToCode,
  type IActionAttributeSchema,
  type IAttributeSchema,
  type IBooleanAttributeSchema,
  type IStateAttributeSchema
} from './attribute'

export interface ITemplateSchema {
  tag: string
  attributes?: {
    class?: {
      [className: string]: IBooleanAttributeSchema | IStateAttributeSchema
    }
    events?: {
      [eventName: string]: IActionAttributeSchema
    }
    props?: {
      [propName: string]: IAttributeSchema
    }
  }
  children?: ITemplateSchema[]
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
  // const transferTemplateSchema = (params: {
  //   schema: ITemplateSchema
  //   index: number
  //   parent: ITemplateTreeSlotNode | undefined
  //   root: ITemplateTreeTemplateNode[]
  // }) => {
  //   const { schema, parent, root, index } = params
  //   const tag = schema.tag
  //   const slots = schema.slots || []
  //   const node: ITemplateTreeTemplateNode = {
  //     id: `${parent?.id || '#root'}__${index}__${tag}`,
  //     parent,
  //     root,
  //     isLeaf: !(slots.length > 0),
  //     content: schema,
  //     children: []
  //   }
  //   node.children = slots.map((s) =>
  //     transferSlotSchema({
  //       schema: s,
  //       parent: node,
  //       root: root
  //     })
  //   )
  //   return node
  // }

  // const transferSlotSchema = (params: {
  //   schema: ISlotSchema
  //   parent: ITemplateTreeTemplateNode
  //   root: ITemplateTreeTemplateNode[]
  // }) => {
  //   const { schema, parent, root } = params
  //   const content = schema.content || []
  //   const node: ITemplateTreeSlotNode = {
  //     id: `${parent.id}__${schema.name}`,
  //     parent,
  //     root,
  //     isLeaf: !(content.length > 0),
  //     content: schema,
  //     children: []
  //   }
  //   node.children = content.map((e, i) =>
  //     transferTemplateSchema({
  //       schema: e,
  //       index: i,
  //       parent: node,
  //       root: tree
  //     })
  //   )
  //   return node
  // }

  const tree: ITemplateTreeTemplateNode[] = []

  // templateList.map((l, i) => {
  //   const node = transferTemplateSchema({
  //     schema: l,
  //     index: i,
  //     parent: undefined,
  //     root: tree
  //   })
  //   tree.push(node)
  // })

  return tree
}

const isNodeTag = (node: IPosthtmlNode): node is IPosthtmlNodeTag => {
  // @ts-ignore
  if (node.tag) {
    return true
  }
  return false
}
export const posthtmlNodeToTemplateSchema = (node: IPosthtmlNode): ITemplateSchema | undefined => {
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
  let children: ITemplateSchema[] = []
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
      children = nodeTagList
        .map((e) => posthtmlNodeToTemplateSchema(e))
        .filter((e) => e) as ITemplateSchema[]
    }
  }
  return {
    tag,
    attributes,
    children
  }
}

export const templateSchemaParser = async (template: string): Promise<ITemplateSchema[]> => {
  const posthtmlNodeList = posthtmlParser(template)
  console.log(posthtmlNodeList)
  const result = posthtmlNodeList
    .map((node) => {
      return posthtmlNodeToTemplateSchema(node)
    })
    .filter((e) => e) as ITemplateSchema[]
  return result
}

export const templateSchemaToPosthtmlNode = (schema: ITemplateSchema): IPosthtmlNode => {
  if (schema.tag === 'text') {
    const value = schema.attributes?.props?.content
    if (value) {
      let content = `{{`
      content += `${attrbuteSchemaToCode(value)}`
      content += `}}`
      return content
    }
    return ''
  }

  const attrs: IPosthtmlNodeTag['attrs'] = {}
  const classAttrObject: Record<string, string> = {}
  Object.entries(schema.attributes?.class || {}).map(([key, value]) => {
    let content = ``
    content += `${attrbuteSchemaToCode(value)}`
    content += ``
    classAttrObject[key] = content
  })
  if (Object.keys(classAttrObject).length > 0) {
    attrs[':class'] = `{
${Object.entries(classAttrObject)
  .map(([key, value]) => {
    return `"${key}":${value}`
  })
  .join(',\n')}
}`
  }

  Object.entries(schema.attributes?.props || {}).map(([key, value]) => {
    let content = ``
    content += `${attrbuteSchemaToCode(value)}`
    content += ``
    attrs[`:${key}`] = content
  })

  Object.entries(schema.attributes?.events || {}).map(([key, value]) => {
    let content = ``
    content += `${attrbuteSchemaToCode(value)}`
    content += ``
    attrs[`@${key}`] = content
  })

  const node: IPosthtmlNode = {
    tag: schema.tag,
    attrs: attrs,
    content: schema.children?.map((e) => templateSchemaToPosthtmlNode(e))
  }

  return node
}

export const templateSchemaToTsxTemplate = async (schema: ITemplateSchema[]) => {
  const posthtmlNodeList = schema.map((e) => templateSchemaToPosthtmlNode(e))
  const html = posthtmlRender(posthtmlNodeList, {
    // quoteAllAttributes: false
  })
  return html
}

export const templateSchemaToCode = async (schema: ITemplateSchema[]): Promise<string> => {
  const posthtmlNodeList = schema.map((e) => templateSchemaToPosthtmlNode(e))
  const html = posthtmlRender(posthtmlNodeList, {
    // quoteAllAttributes: false
  })
  return html
}
