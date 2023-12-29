import type { ITemplateSchema } from '@/schema/template'
import type { MaybePromise } from '@/utils'
import type { IRenderer } from '..'

export abstract class AbstractRendererApp<V = any, R extends IRenderer<V> = IRenderer<V>> {
  #renderer: R
  constructor(params: { renderer: R }) {
    const { renderer } = params
    this.#renderer = renderer
  }
  get renderer() {
    return this.#renderer
  }
  abstract getViewOverlayFromElement(element: Element): IViewOverlay | undefined
  abstract mount(mountElementId: string): MaybePromise<void>
  abstract preview(mountElementId: string, viewFilePath: string): MaybePromise<void>
}

export type IRendererAppClass<V = any, R extends IRenderer<V> = IRenderer<V>> = new (
  ...params: ConstructorParameters<typeof AbstractRendererApp<V, R>>
) => AbstractRendererApp<V, R>
export type IRendererApp<V = any, R extends IRenderer<V> = IRenderer<V>> = InstanceType<
  IRendererAppClass<V, R>
>

export interface IViewOverlay {
  templateSchema: ITemplateSchema
  rect: IViewRect
}

export interface IViewRect {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}
