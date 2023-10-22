import { markRaw, reactive, ref } from 'vue'
import type { IStudioServices, IStudioState } from '../types'
import { path, createVfs, type IVirtulFileSystem } from '@vue-cook/core'
import { initEsbuild } from './esbuild'
import { initSwc } from './swc'
import { template } from 'lodash'

export const getExtName = (name: string) => {
  const allPathPoints = name.split('.')
  const extName = allPathPoints[allPathPoints.length - 1]
  return extName
}
export const getLanguage = (extName: string) => {
  const map: Record<string, string> = {
    ts: 'typescript',
    js: 'javascript',
    map: 'json',
    vue: 'html'
  }

  return map[extName] || extName
}

export const createStudioState = async (config: {
  vfs: IVirtulFileSystem
  services: IStudioServices
  projectName: string
}): Promise<IStudioState> => {
  const { vfs, services, projectName } = config

  const state: IStudioState = {
    vfs: markRaw(vfs),
    services: markRaw(services),
    schemaData: undefined,
    projectName,
    path: markRaw({ ...path }),
    panelList: [],
    currentPanelId: '',
    currentEditFiles: {
      files: []
    }
  }
  const stateRef = reactive(state) as IStudioState
  return stateRef
}

export const getRemotePluginPageHtmlString = (options: {
  pluginName: string
  projectName: string
  packageName: string
  entry: {
    js: string
    css: string
  }
}) => {
  const compiled = template(
    `
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>remote-plugin:{{pluginName}}</title>
  <script>
  var autoRunConfig = {
      mountedEl:"#app",
      packageName:"{{packageName}}",
      projectName:"{{projectName}}",
      pluginName:"{{pluginName}}"
  }
  console.log(window.sss)
  // console.log(sss)
  </script>
  <script src="{{entry.js}}" data-config-var-name="autoRunConfig"></script>
  <link href="{{entry.css}}"></link>
</head>

<body>
  <div id="app"></div>
</body>

</html>
  `,
    {
      interpolate: /{{([\s\S]+?)}}/g
    }
  )

  return compiled(options)
}
