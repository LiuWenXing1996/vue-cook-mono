import { type MaybePromise } from '@/utils'
import { fetchDeps, type IDep, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'

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
  pluginName: string
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
  const deps = await fetchDeps({ entry: finallConfig.depsEntry })
  const pluginLib = deps?.get(finallConfig.packageName)
  const libMeta = pluginLib?.meta.cookMeta?.remotePlugins?.find(
    (e) => e.name === finallConfig.pluginName
  )
  const plugin = (pluginLib?.value?.[libMeta?.varName || ''] as IRemotePlugin) || undefined
  await plugin?.run({
    deps: deps || new Map(),
    config: finallConfig
  })
}

export const getMaterialList = async (params: { depsEntry: IDepsEntry }) => {
  const { depsEntry } = params
  const iframeEl = document.createElement('iframe')
  document.body.append(iframeEl)
  const contentWindow = iframeEl.contentWindow as Window
  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = window[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    // @ts-ignore
    window[uid] = oldValue
    const deps = await fetchDeps({ entry: depsEntry })
    const materialLibList = Array.from(deps?.values() || []).filter((dep) => {
      return dep.meta.cookMeta
    })
  }
  contentWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
  (function () {
    window["${uid}"]()
  })();
</head>
<body>
</body>
</html>
  `)
}
