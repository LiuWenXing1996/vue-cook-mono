import type { IDep } from '@/utils/fetchDeps'
import type { IDeps } from '..'

export interface ITemplateConfig {
  type?: {
    tag?: string
    packageName?: string
  }
  text?: string
  props?: Record<string, string>
  slots?: Record<string, ITemplateConfig[]>
  events?: Record<string, string[]>
}

export interface IComponentConfig {
  name: string
  template: ITemplateConfig[]
  style: string
  data: Record<string, string>
}

export interface IView<T = any> {
  tag: string
  packageName: string
  designMode: T
  runtimeMode: T
}

export interface IViewWithDep<T = any> {
  view: IView<T>
  dep: IDep
}

export const defineView = <T = any>(view: IView<T>) => view

export const getViewList = async <T = any>(options: { deps: IDeps }) => {
  const { deps } = options
  const list: IViewWithDep<T>[] = []
  await Promise.all(
    Array.from(deps?.values() || []).map(async (dep) => {
      const viewsVarName = dep.meta.cookMeta?.viewsVarName
      if (!viewsVarName) {
        return
      }
      const viewsVar = dep.value?.[viewsVarName] as IView<T>[] | undefined
      if (!viewsVar) {
        return
      }
      viewsVar.forEach((view) => {
        list.push({
          view,
          dep
        })
      })
    })
  )

  return list
}
