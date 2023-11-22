import {
  type IAliasComponentSchema,
  type IDepAliasComponentSchema,
  type IInnerAliasComponentSchema
} from '@/schema/component'
import { fetchDeps, resolveDepVar, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { type IDeepRequiredCookConfig } from '../utils/cookConfig'
import { v4 as uuidv4 } from 'uuid'
import {
  createLowcodeContext,
  type ILowcodeBundleData,
  type ILowcodeRunResult
} from './lowcode-context'
import type { IViewSchema } from '..'
import { type IStateSchema } from '@/schema/state'
import { type IActionSchema } from '@/schema/action'
import { Emitter } from '@/utils/emitter'
import { dirname, resolve } from '@/utils/path'
import type { IAttributeSchema } from '@/schema/attribute'
import { createReactiveStore } from '@/utils/reactive'
import type { MaybePromise } from '@/utils'
import type { IComponentViewSchema, IViewFileSchema } from '@/schema/view'
import type { IEventSchema } from '@/schema/template'

// TODO:使用viewContext?那么何时初始化这个呢？
export interface IViewContext {
  getState: (name: string) => any
  setState: (name: string, data: any) => void
  getAction: (name: string) => Function | undefined
}

// 是否可以对象话，而不用类的方式
export abstract class AbstractViewRenderer<View = any> {
  #store = createReactiveStore<{
    innerAliasComponents?: {
      [aliasComponentFilePath: string]: View | undefined
    }
    locale?: string
    deps?: IDeps
    lowcodeRunResult?: ILowcodeRunResult
  }>({})
  constructor() {
    this.#store.watch(['lowcodeRunResult'], () => this.refreshInnerAliasComponents())
  }
  setLocale(data: string) {
    this.#store.set('locale', data)
  }
  getLocale() {
    return this.#store.get('locale')
  }
  onLocaleChange(listener: (data: string | undefined) => void) {
    return this.#store.on('locale', listener)
  }
  setLowcodeRunResult(data: ILowcodeRunResult | undefined) {
    this.#store.set('lowcodeRunResult', data)
  }
  onLowcodeRunResultChange(listener: (data: ILowcodeRunResult | undefined) => void) {
    return this.#store.on('lowcodeRunResult', listener)
  }
  setDeps(deps?: IDeps) {
    this.#store.set('deps', deps)
  }
  getDeps() {
    return { ...(this.#store.get('deps') || {}) } as IDeps
  }
  refreshInnerAliasComponents() {
    console.log('refreshInnerAliasComponents')
    const { jsFunctions, schemaList = [], cookConfig } = this.#store.get('lowcodeRunResult') || {}
    const innerAliasComponents: {
      [viewSchemaFilePath: string]: View | undefined
    } = {}
    schemaList.map((schema) => {
      if (schema.content.type === 'Component') {
        innerAliasComponents[schema.path] = this.transferComponent(schema.content)
      }
    })
    this.#store.set('innerAliasComponents', innerAliasComponents)
  }
  getLowcodeRunResult() {
    const res = this.#store.get('lowcodeRunResult')
    return res ? ({ ...res } as ILowcodeRunResult) : undefined
  }
  transferActions(actions: IActionSchema[], viewFileSchema: IViewFileSchema) {
    const actionsObj: Record<string, Function | undefined> = {}
    actions.map((action) => {
      actionsObj[action.name] = this.transferAction(action, viewFileSchema).content
    })
    return actionsObj
  }
  transferAction(actionAchema: IActionSchema, viewFileSchema: IViewFileSchema) {
    const transferMap: Record<
      IActionSchema['type'],
      undefined | ((data: IActionSchema) => Function | undefined)
    > = {
      JsFunction: (data) => {
        if (data.type === 'JsFunction') {
          const runResult = this.#store.get('lowcodeRunResult')
          const method = runResult?.jsFunctions.find((e) => {
            return e.name === data.name && e.schemaPath === viewFileSchema.path
          })?.content
          const func = (...payload: any[]) => {
            method?.(...payload)
          }
          return func
        }
      },
      LogicComposer: (data) => {
        if (data.type === 'LogicComposer') {
          return () => {
            // TODO:LogicComposer 还未实现
            console.error('LogicComposer 还未实现')
          }
        }
      }
    }
    return {
      name: actionAchema.name,
      content: transferMap[actionAchema.type]?.(actionAchema)
    }
  }
  transferStates(states: IStateSchema[]) {
    const statesObj: Record<string, any> = {}
    states.map((e) => {
      statesObj[e.name] = this.transferState(e).content
    })
    return statesObj
  }
  transferState(schema: IStateSchema) {
    const transferMap: Record<IStateSchema['type'], undefined | ((data: IStateSchema) => unknown)> =
      {
        String: (data) => {
          if (data.type === 'String') {
            return String(data.content)
          }
        },
        Number: (data) => {
          if (data.type === 'Number') {
            return Number(data.content)
          }
        },
        Boolean: (data) => {
          if (data.type === 'Boolean') {
            return Boolean(data.content)
          }
        },
        Json: (data) => {
          if (data.type === 'Json') {
            return data.content
          }
        }
      }
    return {
      name: schema.name,
      content: transferMap[schema.type]?.(schema)
    }
  }
  transferAttribute(
    schema: IAttributeSchema,
    data: {
      states: { [name: string]: any }
      i18ns: {
        name: string
        content: {
          [langKey: string]: string
        }
      }[]
    }
  ) {
    const { states, i18ns } = data
    const transferMap: Record<IAttributeSchema['type'], (data: IAttributeSchema) => any> = {
      string: (data) => {
        if (data.type === 'string') {
          return String(data.content)
        }
      },
      number: (data) => {
        if (data.type === 'number') {
          return Number(data.content)
        }
      },
      boolean: (data) => {
        if (data.type === 'boolean') {
          return Boolean(data.content)
        }
      },
      object: (data) => {
        if (data.type === 'object') {
          let res: Record<string, any> = {}
          const { content = {} } = data
          try {
            Object.keys(content).map((key) => {
              const itemData = content[key]
              res[key] = transferMap[itemData.type](itemData)
            })
          } catch (error) {}

          return res
        }
      },
      action: (data) => {
        if (data.type === 'object') {
          let res: Record<string, any> = {}
          const { content = {} } = data
          Object.keys(content).map((key) => {
            const itemData = content[key]
            res[key] = transferMap[itemData.type](itemData)
          })
          return res
        }
      },
      state: (data) => {
        if (data.type === 'state') {
          return states[data.content]
        }
      },
      i18n: (data) => {
        if (data.type === 'i18n') {
          const i18n = i18ns.find((e) => e.name === data.content)
          const locale = this.#store.get('locale')
          if (locale) {
            return i18n?.content[locale]
          }
        }
      },
      json: (data) => {
        if (data.type === 'json') {
          return data.content
        }
      }
    }

    return transferMap[schema.type]?.(schema)
  }
  transferAliasComponents(
    aliasComponents: IAliasComponentSchema[],
    viewFileSchema: IViewFileSchema
  ) {
    const components: {
      [tag: string]: View | undefined
    } = {}
    aliasComponents.map((e) => {
      components[e.tag] = this.transferAliasComponent(e, viewFileSchema)
    })
    return components
  }
  transferAliasComponent(schema: IAliasComponentSchema, viewFileSchema: IViewFileSchema) {
    const transferMap: Record<
      IAliasComponentSchema['type'],
      undefined | ((data: IAliasComponentSchema) => View | undefined)
    > = {
      Inner: (data) => {
        if (data.type === 'Inner') {
          const componentFileAbsolutePath = resolve(
            dirname(viewFileSchema.path),
            data.componentFilePath
          )
          return this.#store.get('innerAliasComponents')?.[componentFileAbsolutePath]
        }
      },
      Dep: (data) => {
        if (data.type === 'Dep') {
          return this.transferDepAliasComponent(data)
        }
      }
    }
    return transferMap[schema.type]?.(schema)
  }
  transferDepAliasComponent(schema: IDepAliasComponentSchema) {
    const deps = this.#store.get('deps')
    const lib = deps?.[schema.packageName]
    const cmpt = resolveDepVar<View>({ dep: lib, varName: schema.varName })
    return cmpt
  }
  transferEvent(schema: IEventSchema) {
    const action = this.transferAttribute(schema.content)
  }
  abstract transferComponent(schema: IComponentViewSchema): View
}

export type IViewRendererContext<View, Renderer extends AbstractViewRenderer<View>> = Awaited<
  ReturnType<typeof createViewRendererContext<View, Renderer>>
>

export const createViewRendererContext = async <
  View,
  Renderer extends AbstractViewRenderer<View>
>(config: {
  depsEntry: IDepsEntry
  externalLibs?: Record<string, any>
  lowcodeBundleData?: ILowcodeBundleData
}) => {
  type IRendererClass = new () => Renderer
  const { depsEntry, lowcodeBundleData, externalLibs } = config
  const store = createReactiveStore<{
    RendererClass?: IRendererClass
    mainRenderer?: Renderer
  }>({})
  const lowcodeContext = await createLowcodeContext({
    depsEntry,
    externalLibs
  })
  lowcodeContext.setBundleData(lowcodeBundleData)

  const refreshMainRenderer = () => {
    const RendererClass = store.get('RendererClass')
    if (!RendererClass) {
      store.set('mainRenderer', undefined)
      return
    }
    const renderer = new RendererClass()
    const runResult = lowcodeContext.getRunResult()
    renderer.setLowcodeRunResult(runResult)
    renderer.setDeps(lowcodeContext.getDeps())
    store.set('mainRenderer', renderer)
  }
  refreshMainRenderer()
  store.watch(['RendererClass'], () => refreshMainRenderer())
  lowcodeContext.onRunResultChange((data) => {
    console.log('====>onRunResultChange')
    const mainRenderer = store.get('mainRenderer')
    if (mainRenderer) {
      mainRenderer.setLowcodeRunResult(data)
    }
  })

  return {
    getDeps: lowcodeContext.getDeps,
    setRendererClass: store.getHandler('RendererClass').set,
    getMainRenderer: () => store.get('mainRenderer'),
    onMainRendererChange: store.getHandler('mainRenderer').on,
    setLowcodeBundleData: lowcodeContext.setBundleData,
    onLowcodeRunResultChange: lowcodeContext.onRunResultChange,
    getLowcodeRunResult: lowcodeContext.getRunResult
  }
}
