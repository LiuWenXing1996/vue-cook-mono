// import { loadScript } from './loadScript'
import sandbox from './sandbox'
import { require } from '../amd-loader'
import { IContextConfig } from '../amd-loader/context'
// import { v4 as uuidv4 } from 'uuid'

export interface LowcodeConfig {
  schema: string
  libs: Record<string, any>
}

const runContainerConfigMap: Record<string, IRunContainerConfig> = {}
const runContainerResultMap: Record<string, any> = {}

export const run = async (config: LowcodeConfig) => {
  const { schema, libs } = config
  const script = document.currentScript
  const uid = script?.dataset?.vueCookId || ''
  const runContainerConfig = runContainerConfigMap[uid]
  if (!runContainerConfig) {
    return
  }
  const res = sandbox(schema, {
    // [sandboxGlobalInjectMethodName]: () => {
    //   return {
    //     getLib: (name: string) => {
    //       return libs[name]
    //     }
    //   }
    // }
  })
  runContainerResultMap[uid] = res
  return res
}

export interface IRunContainerConfig {
  assets: string
  contextConfig?: Partial<IContextConfig>
}

export const runContainer = async (config: IRunContainerConfig) => {
  const { assets, contextConfig } = config
  // //@ts-ignore
  // if (!window.System) {
  //   console.log('....')
  //   //@ts-ignore
  //   await import('systemjs')
  //   //@ts-ignore
  //   await import('systemjs/dist/extras/amd')
  // }

  const res = (await require([assets], contextConfig || {})) as any
  // const res = assets
  return res[0]
}
