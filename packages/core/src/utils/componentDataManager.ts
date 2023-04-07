import { ComponentInternalInstance, getCurrentInstance, onMounted } from 'vue'
import { warn } from './customConsole'
import { IState, IStateConfig } from '../schema/state/defineState'
import { initState } from '../schema/state/initState'

export type IDataType = 'state' | 'method'

export interface IParams<C> {
  init: (config: C) => void
  configRecord: Record<string, C>
  dataType: IDataType
  componentInstance: ComponentInternalInstance
}

export type IDataManager<D, C> = ReturnType<typeof createDataManager<D, C>>

export const createDataManager = <D, C>(params: IParams<C>) => {
  const { init, configRecord, dataType } = params
  const dataMap = new Map<string, D | undefined>()

  const manager = {
    initData: (config: C) => {
      return init(config)
    },
    isDataInited: (name: string) => dataMap.has(name),
    hasData: (name: string) => Boolean(configRecord[name]),
    getData: (name: string) => {
      const { hasData, isDataInited, initData, getDataConfig } = manager
      if (!hasData(name)) {
        warn(`没有找到名为 ${name} 的 ${dataType}`)
        return
      }
      if (!isDataInited(name)) {
        const stateConfig = getDataConfig(name)
        if (stateConfig) {
          initData(stateConfig)
        }
      }
      return dataMap.get(name)
    },
    getDataConfig: (name: string) => configRecord[name] || undefined,
    getDataMap: () => dataMap,
    getConfigRecord: () => configRecord,
    getDataObj: () => {
      const obj: Record<string, D | undefined> = {}
      const keys = Object.keys(configRecord)
      keys.forEach(e => {
        obj[e] = manager.getData(e)
      })
      return obj
    }
  }

  return manager
}
