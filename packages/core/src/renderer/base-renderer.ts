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
import type { IDataSchema } from '@/schema/data'
import { Emitter } from '@/utils/emitter'
import type { IStateSchema } from '@/schema/state'
import type { IComponentViewSchema, IViewFileSchema } from '@/schema/view'
import type { IAliasComponentSchema, IDepAliasComponentSchema } from '@/schema/component'
import { dirname, resolve } from '@/utils/path'
import type { IActionSchema } from '@/schema/action'

export class ViewData<V = any> {
  #store = createReactiveStore<{
    value?: V
    schema?: IDataSchema
  }>(
    {},
    {
      get: (key, value) => {
        if (key === 'schema') {
          return value ? { ...(value as any) } : undefined
        }
        return value
      }
    }
  )
  get getValue() {
    return this.#store.getHandler('value').get
  }
  get setValue() {
    return this.#store.getHandler('value').set
  }
  get onValueChange() {
    return this.#store.getHandler('value').on
  }
  get setSchema() {
    return this.#store.getHandler('schema').set
  }
  get getSchema() {
    return this.#store.getHandler('schema').get
  }
  get onSchemaChange() {
    return this.#store.getHandler('schema').on
  }
}
export type IViewData<V = any> = ViewData<V>

export interface IViewDataMapValue {
  [dataName: string]: any
}

export class ViewDataMap<V extends IViewDataMapValue> {
  #store = createReactiveStore<{
    value?: V
    schema?: IDataSchema[]
  }>(
    {},
    {
      get: (key, value) => {
        if (key === 'schema') {
          return value ? ([...(value as any)] as any) : undefined
        }
        return value
      }
    }
  )
  get getValue() {
    return this.#store.getHandler('value').get
  }
  get setValue() {
    return this.#store.getHandler('value').set
  }
  get onValueChange() {
    return this.#store.getHandler('value').on
  }
  get setSchema() {
    return this.#store.getHandler('schema').set
  }
  get getSchema() {
    return this.#store.getHandler('schema').get
  }
  get onSchemaChange() {
    return this.#store.getHandler('schema').on
  }
}

export class ViewContext<View> {
  #lowcodeContext: ILowcodeContext
  constructor(params: { lowcodeContext: ILowcodeContext }) {
    const { lowcodeContext } = params
    this.#lowcodeContext = lowcodeContext
  }
  get getDeps() {
    return () => {
      return this.#lowcodeContext.getDeps
    }
  }
  #components = new ReactiveStore<{
    [cmptName: string]: View | undefined
  }>({ data: {} })
  get components() {
    return this.#components
  }
  #states = new ReactiveStore<{
    [stateName: string]: any
  }>({ data: {} })
  get states() {
    return this.#states
  }
  get getState() {
    return this.#states.get
  }
  get setState() {
    return this.#states.set
  }
  get resetState() {
    return this.#states.reset
  }
  get onStateChange() {
    return this.#states.on
  }
  get watchState() {
    return this.#states.watch
  }
  #actions = new ReactiveStore<{
    [actionName: string]: any
  }>({ data: {} })
  get actions() {
    return this.#actions
  }
  get getAction() {
    return this.#actions.get
  }
  get setAction() {
    return this.#actions.set
  }
  get onActionChange() {
    return this.#actions.on
  }
  get watchAction() {
    return this.#actions.watch
  }
}

// ViewContext和transfer应该拆开，tranfer应该是单独的一个类目，或者放到BaseRender里面？

export type IViewContext<View = any> = ViewContext<View>

export abstract class BaseRenderer<View = any> {
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
    schemaList: IDataSchema[] | undefined,
    viewContext: IViewContext<View>
  ) => {
    const watcherList: ((listener: () => void) => () => void)[] = []
    ;(schemaList || []).map((schema) => {
      const watcher = this.getViewDataDepWatcher(schema, viewContext)
      watcherList.push(watcher)
    })
    return (listener: () => void) => {
      const cancelMethods = watcherList.map((watcher) => watcher(listener))
      return () => {
        cancelMethods.map((e) => e())
      }
    }
  }
  transferDataMap = (schemaArray: IDataSchema[] | undefined, viewContext: IViewContext<View>) => {
    const dataMap: IViewDataMapValue = {}
    ;(schemaArray || []).map((schema) => {
      dataMap[schema.name] = this.transferData(schema, viewContext)
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
  transferActions(
    actions: IActionSchema[],
    viewFileSchema: IViewFileSchema,
    viewContext: IViewContext
  ) {
    const actionsObj: Record<string, Function | undefined> = {}
    actions.map((action) => {
      actionsObj[action.name] = this.transferAction(action, viewFileSchema, viewContext).content
    })
    return actionsObj
  }
  transferAction(
    actionAchema: IActionSchema,
    viewFileSchema: IViewFileSchema,
    viewContext: IViewContext
  ) {
    const transferMap: Record<
      IActionSchema['type'],
      undefined | ((data: IActionSchema) => Function | undefined)
    > = {
      JsFunction: (data) => {
        if (data.type === 'JsFunction') {
          const lowcodeContext = this.getLowcodeContext()
          const runResult = lowcodeContext.getRunResult()
          const method = runResult?.jsFunctions.find((e) => {
            return e.name === data.name && e.schemaPath === viewFileSchema.path
          })?.content
          const func = async (...payload: any[]) => {
            return await method?.(viewContext, payload)
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
}
