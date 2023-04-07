import { getInnerContext } from '../context/contextMap'
import type { IContext } from '../context/createContext'
import type { IMethod, IMethodConfig } from './defineMethod'

export const useMethod = <T extends IMethod>(
  context: IContext,
  config: IMethodConfig<T>
) => {
  const { name } = config
  const innerContext = getInnerContext(context.uid)
  if (!innerContext) {
    return
  }
  const { hasMethod } = innerContext
  if (!hasMethod(name)) {
    return
  }
  const method = innerContext.getMethod(name)
  return method as T
}

export type IConfigToMethod<C extends IMethodConfig> = C extends IMethodConfig<
  infer T
>
  ? T
  : unknown

export type IConfigsToMethods<CR extends Record<string, IMethodConfig>> = {
  [key in keyof CR]: IConfigToMethod<CR[key]> | undefined
}

export const useMethods = <CR extends Record<string, IMethodConfig>>(
  context: IContext,
  configs: CR
): IConfigsToMethods<CR> => {
  const methods: Record<string, IMethod | undefined> = {}
  const innerContext = getInnerContext(context.uid)
  if (innerContext) {
    const keys = Object.keys(configs)
    keys.forEach(key => {
      methods[key] = innerContext.getMethod(key)
    })
  }
  return methods as IConfigsToMethods<CR>
}
