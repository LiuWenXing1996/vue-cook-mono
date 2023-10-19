import type { MaybePromise } from '@/utils'
import { fetchDeps, type IDep, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'

export interface IRemotePlugin {
  name: string
  run: (data: { deps: IDeps; config: IRunRemotePluginConfig }) => MaybePromise<void>
}

export const defineRemotePlugin = (plugin: IRemotePlugin) => {
  return plugin
}

export interface IRunRemotePluginConfig {
  mountedEl: string
  depsEntry: IDepsEntry
  packageName: string
  projectName: string
}

export const tryGetPluginLib = (dep?: IDep) => {
  if (!dep) {
    return
  }
  const cookMeta = dep.meta.cookMeta || {}
  if (!cookMeta.isRemotePlugin) {
    return
  }
  const remotePluginVarName = cookMeta.remotePluginVarName || 'default'
  const plugin = dep.value?.[remotePluginVarName]
  if (plugin) {
    return plugin as IRemotePlugin
  }
}

export const runRemotePlugin = async (config: Partial<IRunRemotePluginConfig>) => {
  console.log('===>runRemotePlugin')
  const script = document.currentScript
  const configVarName = script?.dataset?.configVarName || ''
  let finallConfig = config as IRunRemotePluginConfig
  if (configVarName) {
    // @ts-ignore
    const _config = window[configVarName] as Partial<IRunRemotePluginConfig>
    finallConfig = {
      ...config,
      ..._config
    } as IRunRemotePluginConfig
  }
  const deps = (await fetchDeps({ entry: finallConfig.depsEntry })) || {}
  const pluginLib = deps[finallConfig.packageName]
  const plugin = tryGetPluginLib(pluginLib)
  await plugin?.run({
    deps: deps,
    config: finallConfig
  })
}
