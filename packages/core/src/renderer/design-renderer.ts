import { type IAliasComponent } from '@/schema/component'
import { fetchDeps, resolveDepVar, type IDeps, type IDepsEntry } from '@/utils/fetchDeps'
import { type IDeepRequiredCookConfig } from '../utils/cookConfig'
import { v4 as uuidv4 } from 'uuid'
import {
  createLowcodeContext,
  type ILowcodeBundleData,
  type ILowcodeContext,
  type ILowcodeRunResult
} from './lowcode-context'
import type { IViewSchema } from '..'
import { type IState } from '@/schema/state'
import { type IAction } from '@/schema/action'
import { Emitter } from '@/utils/emitter'
import { dirname, resolve } from '@/utils/path'
import type { IAttributeSchema } from '@/schema/attribute'
import {
  AbstractViewRenderer,
  createViewRendererContext,
  type IViewRendererContext
} from './view-renderer'
import type { ITemplateSchema } from '@/schema/template'
import type { MaybePromise } from '@/utils'

export abstract class AbstractDesignRenderer<View = any> extends AbstractViewRenderer<View> {
  abstract getComponetnOverlayFromElement(element: Element): IDesignComponentOverlay | undefined
  abstract mount(mountElementId: string): Promise<void> | void
}

export interface IDesignComponentOverlay {
  templateSchema: ITemplateSchema
  rect: IDesignComponentRect
}

export interface IDesignComponentRect {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

export interface IDesignComponentPageSize {
  width: number
  height: number
  scale: number
}
export type IDesignRendererContext<View> = Awaited<
  ReturnType<typeof createDesignRendererContext<View>>
>

export const createDesignRendererContext = async <View = any>(config: {
  depsEntry: IDepsEntry
  iframeEl: HTMLIFrameElement
  externalLibs?: Record<string, any>
  mainViewFilePath: string
  resolveViewRendererClass: (data: {
    deps: IDeps
  }) => MaybePromise<(new () => AbstractDesignRenderer<View>) | void>
}) => {
  // TODO:使用auto方式，而不是这种跨iframe的方式，
  // setLowcodeBundleData 应该使用iframe post message的方式
  const { depsEntry, iframeEl, externalLibs, mainViewFilePath, resolveViewRendererClass } = config
  const contentWindow = iframeEl.contentWindow as Window
  let viewRendererContext: IViewRendererContext<View, AbstractDesignRenderer<View>> | undefined =
    undefined

  const prefix = '__vue__cook__inject__method__'
  const uid = `${prefix}_${uuidv4()}`
  // @ts-ignore
  const oldValue = contentWindow[uid]
  // @ts-ignore
  contentWindow[uid] = async () => {
    // @ts-ignore
    contentWindow[uid] = oldValue
    viewRendererContext = await createViewRendererContext<View, AbstractDesignRenderer<View>>({
      depsEntry,
      targetWindow: contentWindow,
      externalLibs,
      resolveViewRendererClass
    })
    if (!viewRendererContext) {
      return
    }

    let isMounted = false
    let cancelListen: Function | undefined = undefined
    const tryMountApp = async () => {
      if (!isMounted) {
        const mainRenderer = viewRendererContext?.getRenderers()[mainViewFilePath]
        if (!mainRenderer) {
          cancelListen?.()
          cancelListen = viewRendererContext?.onRenderersChange(async () => {
            await tryMountApp()
          })
        } else {
          isMounted = true
          await mainRenderer.mount('#app')
        }
      }
    }
    await tryMountApp()
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

  const context = {
    setLowcodeBundleData: viewRendererContext.setLowcodeBundleData,
    onLowcodeRunResultChange: viewRendererContext.onLowcodeRunResultChange
  }

  return context
}
