import { markRaw, reactive, ref } from 'vue'
import type { IStudioServices, IStudioState } from '../types'
import { path, type IVirtulFileSystem, getCookConfigFromFs } from '@vue-cook/core'
import { createVfs, build } from '@vue-cook/schema-bundler'
import { initEsbuild } from './esbuild'
import { initSwc } from './swc'

// TODO:收敛不暴露出去
export const createStudioState = async (config: {
  services: IStudioServices
  projectName: string
}): Promise<IStudioState> => {
  const { services, projectName } = config
  const vfs = createVfs()

  const esbuildWasmUrl = await services.getEsbuildWasmUrl()
  const swcWasmUrl = await services.getSwcWasmUrl()
  const esbuild = await initEsbuild(esbuildWasmUrl)
  const swc = await initSwc(swcWasmUrl)
  const files = await services.getFiles()
  await Promise.all(
    files.map(async (file) => {
      await vfs.outputFile(file.path, file.content)
    })
  )

  const fs = vfs.getFs()
  const buildRes = await build({
    vfs,
    esbuild,
    swc
  })
  console.log('buildRes', buildRes)
  const lowcodeBundleData = {
    js: buildRes?.js || '',
    css: buildRes?.css || ''
  }

  fs.watch('/', {}, async () => {
    const buildRes = await build({
      vfs,
      esbuild,
      swc
    })
    console.log('buildRes', buildRes)
    state.lowcodeBundleData = {
      js: buildRes?.js || '',
      css: buildRes?.css || ''
    }
  })

  const cookConfig = await getCookConfigFromFs(vfs)

  const state: IStudioState = {
    vfs: markRaw(vfs),
    splitPanelConfig: { list: [] },
    services: markRaw(services),
    tabsLayout: { list: [] },
    projectName,
    path: markRaw({ ...path }),
    panelList: [],
    cookConfig: cookConfig?.content,
    lowcodeBundleData,
    currentPanelId: '',
    currentEditFiles: {
      files: []
    }
  }
  const stateRef = reactive(state) as IStudioState
  return stateRef
}
