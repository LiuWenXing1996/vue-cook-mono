import { getInnerContext } from '../context/contextMap'
import type { IContext } from '../context/createContext'
import type { IMethod, IMethodConfig } from './defineMethod'

export const initMethod = <T extends IMethod>(
  config: IMethodConfig<T>,
  context: IContext
) => {
  const innerContext = getInnerContext(context.uid)
  if (!innerContext) {
    return
  }
  const { name, init } = config
  if (!innerContext.hasMethod(name)) {
    return
  }
  if (innerContext.isMethodInited(name)) {
    return
  }
  const method = init()
  const methodMap = innerContext.getMethodMap()
  methodMap.set(name, method)

  return method as T
}
