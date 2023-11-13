import { type IAliasComponent } from '@/schema/component'
import { fetchDeps, resolveDepVar, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { type IDeepRequiredCookConfig } from '../utils/cookConfig'
import { v4 as uuidv4 } from 'uuid'
import {
  createLowcodeContext,
  type ILowcodeBundleData,
  type ILowcodeRunResult
} from './lowcode-context'
import type { IViewSchema } from '..'
import { type IState } from '@/schema/state'
import { type IAction } from '@/schema/action'
import { Emitter } from '@/utils/emitter'
import { dirname, resolve } from '@/utils/path'
import type { IAttributeSchema } from '@/schema/attribute'

export abstract class AbstractViewRenderer<View = any> {
  #emitter = new Emitter()
  #locale: string = 'zh'
  #deps: IDeps = {}
  #schema?: ILowcodeRunResult['schemaList'][0]
  #jsFunctions: ILowcodeRunResult['jsFunctions'] = []
  #allRenderers: Record<string, AbstractViewRenderer<View> | undefined> = {}
  #states: Record<string, any> = {}
  #actions: Record<string, Function> = {}
  #components: Record<string, View> = {}
  get components() {
    return {
      ...this.#components
    }
  }
  set components(value: Record<string, any>) {
    this.#components = { ...value }
    this.#emitter.emit('onComponentsChange', this.components)
  }
  onComponentsChange(listener: (value: AbstractViewRenderer['components']) => void) {
    return this.#emitter.listen('onComponentsChange', listener)
  }
  constructor() {
    this.onSchemaChange(() => {
      this.states = this.transferStates()
      this.actions = this.transferActions()
    })
    this.onJsFunctionsChange(() => {
      this.actions = this.transferActions()
    })
    this.onDepsChange(() => {
      this.actions = this.transferActions()
    })
  }
  get schema() {
    return this.#schema ? { ...this.#schema } : undefined
  }
  set schema(value: ILowcodeRunResult['schemaList'][0] | undefined) {
    this.#schema = value
    this.#emitter.emit('onSchemaChange', this.schema)
  }
  onSchemaChange(listener: (value: AbstractViewRenderer['schema']) => void) {
    return this.#emitter.listen('onSchemaChange', listener)
  }
  get deps() {
    return { ...this.#deps }
  }
  set deps(value: IDeps) {
    this.#deps = value
    this.#emitter.emit('onDepsChange')
  }
  onDepsChange(listener: (value: AbstractViewRenderer['deps']) => void) {
    return this.#emitter.listen('onDepsChange', listener)
  }
  get states() {
    return {
      ...this.#states
    }
  }
  set states(value: Record<string, any>) {
    this.#states = { ...value }
    this.#emitter.emit('onStatesChange', value)
  }
  onStatesChange(listener: (value: AbstractViewRenderer['states']) => void) {
    return this.#emitter.listen('onStatesChange', listener)
  }
  get actions() {
    return { ...this.#actions }
  }
  set actions(value: Record<string, any>) {
    this.#actions = { ...value }
    this.#emitter.emit('onActionsChange', value)
  }
  onActionsChange(listener: (value: AbstractViewRenderer['actions']) => void) {
    return this.#emitter.listen('onActionsChange', listener)
  }
  get jsFunctions() {
    return [...this.#jsFunctions]
  }
  set jsFunctions(value: ILowcodeRunResult['jsFunctions']) {
    this.#jsFunctions = [...value]
    this.#emitter.emit('onJsFunctionsChange', value)
  }
  onJsFunctionsChange(listener: (value: AbstractViewRenderer['jsFunctions']) => void) {
    return this.#emitter.listen('onJsFunctionsChange', listener)
  }

  get allRenderers() {
    return { ...this.#allRenderers }
  }
  set allRenderers(value: Record<string, AbstractViewRenderer<View> | undefined>) {
    this.#allRenderers = { ...value }
    this.#emitter.emit('onAllRenderersChange', value)
  }
  onAllRenderersChange(listener: (value: AbstractViewRenderer['allRenderers']) => void) {
    return this.#emitter.listen('onAllRenderersChange', listener)
  }

  transferActions() {
    const actionsObj: Record<string, Function | undefined> = {}
    const { actions = [] } = this.schema?.content || {}
    const transferMap: Record<
      IAction['type'],
      undefined | ((data: IAction) => Function | undefined)
    > = {
      JsFunction: (data) => {
        if (data.type === 'JsFunction') {
          return this.jsFunctions.find((e) => {
            return e.name === data.name && e.schemaPath === this.#schema?.path
          })?.content
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
    actions.map((action) => {
      actionsObj[action.name] = transferMap[action.type]?.(action)
    })
    return actionsObj
  }

  transferStates() {
    const statesObj: Record<string, any> = {}
    const { states = [] } = this.schema?.content || {}
    const transferMap: Record<IState['type'], undefined | ((data: IState) => unknown)> = {
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
    states.map((e) => {
      statesObj[e.name] = transferMap[e.type]?.(e)
    })
    return statesObj
  }

  transferComponents() {
    const { deps, schema } = this
    const componentsObj: Record<string, View | undefined> = {}
    if (schema) {
      const { components = [] } = schema.content
      const transferMap: Record<
        IAliasComponent['type'],
        undefined | ((data: IAliasComponent) => View | undefined)
      > = {
        Inner: (data) => {
          if (data.type === 'Inner') {
            const componentFileAbsolutePath = resolve(dirname(schema.path), data.componentFilePath)
            return this.allRenderers[componentFileAbsolutePath]?.getView()
          }
        },
        Dep: (data) => {
          if (data.type === 'Dep') {
            const lib = deps[data.packageName]
            const cmpt = resolveDepVar<View>({ dep: lib, varName: data.varName })
            return cmpt
          }
        }
      }
      components.map((e) => {
        componentsObj[e.tag] = transferMap[e.type]?.(e)
      })
    }
    return componentsObj
  }

  transferAttributeData(data: IAttributeSchema) {
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
          return this.#states[data.content]
        }
      },
      i18n: (data) => {
        if (data.type === 'i18n') {
          const { i18ns = [] } = this.schema?.content || {}
          const i18n = i18ns.find((e) => e.name === data.content)
          return i18n?.content[this.#locale]
        }
      },
      json: (data) => {
        if (data.type === 'json') {
          return data.content
        }
      }
    }

    return transferMap[data.type]?.(data)
  }
  abstract getView(): View
}

export const createViewRendererContext = async <Component>(params: {
  cookConfig: IDeepRequiredCookConfig
  depsEntry: IDepsEntry
  externalLibs?: Record<string, any>
  mainViewFilePath: string
  lowcodeBundleData?: ILowcodeBundleData
}) => {
  const { depsEntry, cookConfig, lowcodeBundleData, externalLibs, mainViewFilePath } = params
  const renderers: Record<string, AbstractViewRenderer<Component> | undefined> = {}
  const lowcodeContext = await createLowcodeContext({
    depsEntry,
    targetWindow: window,
    externalLibs
  })
  lowcodeContext.setBundleData(lowcodeBundleData)

  const deps = lowcodeContext.getDeps()
  const renderLib = deps[cookConfig.renderer.runtime.packageName]
  const RendererClass = resolveDepVar<new () => AbstractViewRenderer<Component>>({
    dep: renderLib,
    varName: cookConfig.renderer.runtime.varName
  })
  if (!RendererClass) {
    return
  }

  const refreshRenderers = () => {
    const schemaList = lowcodeContext.getSchemaList()
    const jsFunctions = lowcodeContext.getJsFunctions()
    schemaList.map((schema) => {
      let renderer = renderers[schema.path]
      if (renderer) {
        renderer.schema = schema
        renderer.jsFunctions = jsFunctions
      } else {
        renderer = renderers[schema.path] = new RendererClass()
        renderer.deps = deps
        renderer.schema = schema
        renderer.jsFunctions = jsFunctions
      }
    })
    const allSchemaFiles = schemaList.map((e) => e.path)
    Object.keys(renderers).map((key) => {
      if (!allSchemaFiles.includes(key)) {
        renderers[key] = undefined
      }
    })

    Object.keys(renderers).map((key) => {
      const renderer = renderers[key]
      if (renderer) {
        renderer.allRenderers = renderers
      }
    })
  }

  lowcodeContext.onChangeRunResult(() => {
    refreshRenderers()
  })

  return {
    getMainRenderer: () => {
      return renderers[mainViewFilePath]
    },
    setBundleData: lowcodeContext.setBundleData
  }
}
