import { resolveDepVar, type IDepsEntry, genAbsoulteUrl } from '@/utils/fetchDeps'
import {
  LowcodeContext,
  type ILowcodeContext,
  type ILowcodeBundleData,
  type ILowcodeBundleDataEntry,
  fetchBundleData
} from './lowcode-context'
import type { MaybePromise } from '@/utils'
import type { ITemplateSchema } from '@/schema/template'
import { ReactiveStore, createReactiveStore } from '@/utils/reactive'
import type { IAttributeSchema } from '@/schema/attribute'
import type { IDataMapSchema, IDataSchema } from '@/schema/data'
import { Emitter } from '@/utils/emitter'
import type { IStateSchema } from '@/schema/state'
import type { IComponentViewSchema, IViewFileSchema } from '@/schema/view'
import type { IAliasComponentSchema, IDepAliasComponentSchema } from '@/schema/component'
import { dirname, resolve } from '@/utils/path'
import type { IAction, IActionSchema } from '@/schema/action'
import { ViewContext, type IViewContext } from './view-context'
import { ViewData, type IViewDataMapValue, ViewDataMap } from './view-data'
import type { AbstractRendererApp, IRendererApp } from './abstract-renderer-app'

export abstract class AbstractRenderer<View = any> {
  #lowcodeContext: ILowcodeContext
  constructor(params: { lowcodeContext: ILowcodeContext }) {
    const { lowcodeContext } = params
    this.#lowcodeContext = lowcodeContext
  }
  get getLowcodeContext() {
    return () => {
      return this.#lowcodeContext
    }
  }
  get createViewContext() {
    return () => {
      return new ViewContext({ lowcodeContext: this.getLowcodeContext() })
    }
  }
  abstract createApp(): MaybePromise<IRendererApp<View, IRenderer<View>>>
  createViewData = <T>(viewContext: IViewContext<View>) => {
    const viewData = new ViewData<T>()
    let currentWatcher: (() => void) | undefined = undefined
    const refreshValue = () => {
      const schema = viewData.getSchema()
      const value = this.transferData(schema, viewContext)
      viewData.setValue(value)
    }
    viewData.onSchemaChange((schema) => {
      refreshValue()
      const watcher = this.getViewDataDepWatcher(schema, viewContext)
      currentWatcher?.()
      currentWatcher = watcher(() => {
        refreshValue()
      })
    })
    return viewData
  }
  getViewDataDepWatcher(schema: IDataSchema | undefined, viewContext: IViewContext<View>) {
    const emitter = new Emitter()
    const eventName = 'aaa'
    if (schema?.type === 'object') {
    }
    if (schema?.type === 'state') {
      viewContext.onStateChange(schema.content, () => {
        emitter.emit(eventName)
      })
    }
    return (listener: () => void) => {
      return emitter.listen(eventName, listener)
    }
  }
  transferData(schema: IDataSchema | undefined, viewContext: IViewContext<View>) {
    const transferMap: Record<IDataSchema['type'], (data: IDataSchema) => any> = {
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
        if (data.type === 'action') {
          return viewContext.getAction(data.content)
        }
      },
      state: (data) => {
        if (data.type === 'state') {
          return viewContext.getState(data.content)
        }
      },
      i18n: (data) => {
        if (data.type === 'i18n') {
          return ''
        }
      },
      json: (data) => {
        if (data.type === 'json') {
          return data.content
        }
      }
    }

    return schema?.type ? transferMap[schema.type]?.(schema) : undefined
  }
  createViewDataMap = <T extends IViewDataMapValue>(viewContext: IViewContext<View>) => {
    const viewDataMap = new ViewDataMap<T>()
    let currentWatcher: (() => void) | undefined = undefined
    const refreshValue = () => {
      const schema = viewDataMap.getSchema()
      const value = this.transferDataMap(schema, viewContext) as T
      viewDataMap.setValue(value)
    }
    viewDataMap.onSchemaChange((schema) => {
      refreshValue()
      const watcher = this.getDataMapDepWatcher(schema, viewContext)
      currentWatcher?.()
      currentWatcher = watcher(() => {
        refreshValue()
      })
    })
    return viewDataMap
  }
  getDataMapDepWatcher = (
    dataMapSchema: IDataMapSchema | undefined,
    viewContext: IViewContext<View>
  ) => {
    const watcherList: ((listener: () => void) => () => void)[] = []
    Object.keys(dataMapSchema || {}).map((dataName) => {
      const dataSchema = dataMapSchema?.[dataName]
      const watcher = this.getViewDataDepWatcher(dataSchema, viewContext)
      watcherList.push(watcher)
    })
    return (listener: () => void) => {
      const cancelMethods = watcherList.map((watcher) => watcher(listener))
      return () => {
        cancelMethods.map((e) => e())
      }
    }
  }
  transferDataMap = (schemaMap: IDataMapSchema | undefined, viewContext: IViewContext<View>) => {
    const dataMap: IViewDataMapValue = {}
    Object.keys(schemaMap || {}).map((dataName) => {
      const dataSchema = schemaMap?.[dataName]
      dataMap[dataName] = this.transferData(dataSchema, viewContext)
    })
    return dataMap
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
          const lowcodeContext = this.getLowcodeContext()
          const schema = lowcodeContext
            .getRunResult()
            ?.schemaList.find((e) => e.path === componentFileAbsolutePath)
          if (schema) {
            return this.transferView(schema)
          }
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
    const lowcodeContext = this.getLowcodeContext()
    const deps = lowcodeContext.getDeps()
    const lib = deps?.[schema.packageName]
    const cmpt = resolveDepVar<View>({ dep: lib, varName: schema.varName })
    return cmpt
  }
  abstract transferView(schema: IViewFileSchema): View
  transferAction(action: IAction, viewContext: IViewContext) {
    const func = async (...payload: any[]) => {
      return await action(viewContext, payload)
    }
    return func
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
}
export type IRendererClass<View = any> = new (
  ...params: ConstructorParameters<typeof AbstractRenderer<View>>
) => AbstractRenderer<View>
export type IRenderer<View = any> = InstanceType<IRendererClass<View>>

export const createRenderer = async (params: {
  depsEntry: IDepsEntry
  bundleData: ILowcodeBundleData
}) => {
  const { depsEntry, bundleData } = params
  const lowcodeContext = new LowcodeContext()
  await lowcodeContext.setDepsByEntry({ entry: depsEntry })
  await lowcodeContext.setRunResultByBundleData({ bundleData })
  const runResult = lowcodeContext.getRunResult()
  const { cookConfig } = runResult || {}
  if (!cookConfig) {
    throw new Error('undefind cookConfig')
  }
  const deps = lowcodeContext.getDeps()
  const renderLib = deps?.[cookConfig.renderer.design.packageName]
  const RendererClass = resolveDepVar<IRendererClass>({
    dep: renderLib,
    varName: cookConfig.renderer.design.varName
  })
  if (!RendererClass) {
    throw new Error('undefind RendererClass')
  }
  const renderer = new RendererClass({ lowcodeContext })
  return renderer
}

export interface IAutoCreateRendererConfig {
  mountElementId: string
  onCreated?: (renderer: IRenderer) => MaybePromise<void>
  bundleDataEntry: ILowcodeBundleDataEntry
  depsEntry: IDepsEntry
}

export const autoCreateRenderer = async (config: IAutoCreateRendererConfig) => {
  let finallConfig: IAutoCreateRendererConfig = {
    ...config
  }
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as IAutoCreateRendererConfig
    finallConfig = {
      ...finallConfig,
      ..._config
    }
  }
  finallConfig = {
    ...finallConfig,
    depsEntry: {
      ...finallConfig.depsEntry,
      js: genAbsoulteUrl(finallConfig.depsEntry.js),
      css: genAbsoulteUrl(finallConfig.depsEntry.css)
    },
    bundleDataEntry: {
      ...finallConfig.bundleDataEntry,
      jsUrl: genAbsoulteUrl(finallConfig.bundleDataEntry.jsUrl),
      cssUrl: genAbsoulteUrl(finallConfig.bundleDataEntry.cssUrl)
    }
  }

  const { bundleDataEntry, depsEntry, onCreated } = finallConfig
  const bundleData = await fetchBundleData(bundleDataEntry)

  const conext = await createRenderer({
    bundleData,
    depsEntry
  })
  await onCreated?.(conext)
  return conext
}
