import sandbox, { globalModulesMapName } from './sandbox'
import { extname } from '../utils/path'
import { loadStyle, loadStyleByContent } from './loadStyle'
import { loadScript } from './loadScript'
import { v4 as uuidv4 } from 'uuid'
import { createCoreLibOnceGetterId } from '@/utils'
import { listenEditorWindowSchemaChange, type ISchemaChanegeData } from './schemaChange'

export type IDeps = Record<string, any>
export const ElementDataLowcodeContextIdKey = 'cookContextId'
export const ElementDataCoreLibOnceGetterIdIdKey = 'coreLibOnceGetterId'

const internalContextMap = new Map<string, IInternalLowcodeContext>()
const contextMap = new Map<string, ILowcodeContext>()

export const getLowcodeContext = (id: string) => {
  return contextMap.get(id)
}

export const exportDeps = (deps: IDeps) => {
  const script = document.currentScript
  const uid = script?.dataset?.cookContextId || ''
  if (uid) {
    const context = internalContextMap.get(uid)
    if (context) {
      context.setDeps(deps)
    }
  }
}

export interface ISchemaData {
  timestamp: number
  schema: {
    js: string
    css: string
  }
}

export interface ILowcodeContextConfig<T = any> {
  depsEntryList: string[]
  schemaEntryList: string[]
  onDataChange?: (data: T | undefined) => void
  externalLibs?: Record<string, any>
  dev?: boolean
}

export type ILowcodeContext<T = any> = Awaited<ReturnType<typeof exportLowcodeContext<T>>>
export const exportLowcodeContext = <T>(internalContext: IInternalLowcodeContext<T>) => {
  const context = {
    id: internalContext.id,
    refresh: internalContext.refresh,
    getSchemaData: internalContext.getSchemaData,
    getExternalLibs: internalContext.getExternalLibs
  }

  return context
}

type IInternalLowcodeContext<T = any> = Awaited<ReturnType<typeof createInternalLowcodeContext<T>>>
const createInternalLowcodeContext = async <T = any>(config: ILowcodeContextConfig<T>) => {
  const { depsEntryList, schemaEntryList, onDataChange, externalLibs, dev } = config
  const id = uuidv4()
  let currentDeps: IDeps = {}
  let currentData: T | undefined = undefined
  let currentSchemaData: ISchemaData | undefined = undefined
  let currentStyleEl: HTMLStyleElement | undefined = undefined
  let currentExternalLibs = externalLibs || {}

  const initDeps = async () => {
    await Promise.all(
      depsEntryList.map(async (depEntry) => {
        const ext = extname(depEntry)
        if (ext === '.css') {
          try {
            await loadStyle(depEntry, {
              [ElementDataLowcodeContextIdKey]: id
            })
          } catch (error) {}
        }
        if (ext === '.js') {
          const coreLibOnceGetterId = createCoreLibOnceGetterId()
          await loadScript(depEntry, {
            [ElementDataLowcodeContextIdKey]: id,
            [ElementDataCoreLibOnceGetterIdIdKey]: coreLibOnceGetterId
          })
        }
      })
    )
  }

  const initSchemaData = async () => {
    let cssContent = ''
    let jsContent = ''
    await Promise.all(
      schemaEntryList.map(async (schemaEntry) => {
        const ext = extname(schemaEntry)
        const content = await fetch(schemaEntry).then((res) => {
          return res.text()
        })
        if (ext === '.css') {
          cssContent = content
        }
        if (ext === '.js') {
          jsContent = content
        }
      })
    )

    currentSchemaData = {
      timestamp: Date.now(),
      schema: {
        css: cssContent,
        js: jsContent
      }
    }
    await refresh()
  }

  const refresh = async () => {
    if (!currentSchemaData) {
      return
    }
    const { js = '', css = '' } = currentSchemaData.schema
    await Promise.all([
      (async () => {
        currentStyleEl?.remove()
        currentStyleEl = await loadStyleByContent(css, { [ElementDataLowcodeContextIdKey]: id })
      })(),
      (async () => {
        console.log('....')
        currentData = await sandbox(js, {
          [globalModulesMapName]: currentDeps
        })
      })()
    ])
    onDataChange?.(currentData)
  }

  if (dev) {
    listenEditorWindowSchemaChange((data) => {
      if (currentSchemaData) {
        if (currentSchemaData.timestamp > data.timestamp) {
          return
        }
      }
      currentSchemaData = data
      refresh()
    })
  }
  const context = {
    id,
    setDeps: (deps: IDeps) => {
      currentDeps = deps
    },
    refresh,
    initDeps,
    initSchemaData,
    getSchemaData: () => {
      return currentData
    },
    getExternalLibs: () => {
      return currentExternalLibs || {}
    }
  }

  internalContextMap.set(context.id, context)

  return context
}

export const createLowcodeContext = async <T = any>(config: ILowcodeContextConfig<T>) => {
  const internalContext = await createInternalLowcodeContext(config)

  const context = exportLowcodeContext(internalContext)
  contextMap.set(context.id, context)
  await internalContext.initDeps()
  // if (config.dev) {
  //   await internalContext.initSchemaData()
  // }
  await internalContext.initSchemaData()
  return context
}
