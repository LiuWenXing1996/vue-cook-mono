import type { IComponentConfig } from '@/schema/component'
import { fetchDeps, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { v4 as uuidv4 } from 'uuid'

export interface IRenderContextConfig {
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  schemaData?: IComponentConfig
  renderConfig: {
    packageName: string
    renderVarName: string
  }
}

export interface IRenderData {
  mountElementId: string
  deps: IDeps
  schemaData?: IComponentConfig
  watchSchemaData: (listener: ISchemaDataChangeListener) => void
}

export type IRender = (data: IRenderData) => Promise<void> | void

export const defineRender = (render: IRender) => render

export type ISchemaDataChangeListener = (data: {
  schemaData?: IComponentConfig
  timestamp: number
}) => void

export type IRenderContext = Awaited<ReturnType<typeof createRenderContext>>

export const createRenderContext = async (config: IRenderContextConfig) => {
  const { depsEntry, renderConfig, schemaData, iframeEl } = config
  const contentWindow = iframeEl.contentWindow as Window
  let listenerList: ISchemaDataChangeListener[] = []
  const setSchemaData = (data?: IComponentConfig) => {
    listenerList.map((l) => {
      l({
        schemaData: data,
        timestamp: Date.now()
      })
    })
  }
  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = contentWindow[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    // @ts-ignore
    contentWindow[uid] = oldValue
    const deps = await fetchDeps({ entry: depsEntry, targetWindow: contentWindow })
    const renderLib = deps?.get(renderConfig.packageName)
    if (!renderLib) {
      return
    }
    const render = renderLib.value[renderConfig.renderVarName] as IRender
    await render({
      mountElementId: '#app',
      deps: deps || new Map(),
      schemaData,
      watchSchemaData: (listener) => {
        listenerList.push(listener)
        const removeListener = () => {
          listenerList = listenerList.filter((e) => e !== listener)
        }
        return removeListener
      }
    })
  }
  contentWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <div id="app"></div>
    <script>
    (function () {
      window["${uid}"]()
    })();
    </script>
</body>
</html>
      `)
  return {
    setSchemaData
  }
}
