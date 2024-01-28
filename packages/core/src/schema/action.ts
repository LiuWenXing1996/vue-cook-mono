import type { JsonTypeObject } from '@/utils/jsonType'
import type { ViewContext } from '..'

export type IAction<C extends ViewContext = ViewContext, R = any, P extends any[] = any[]> = (
  ctx: C,
  params: P
) => R
export type IAsyncAction<
  C extends ViewContext = ViewContext,
  R = any,
  P extends any[] = any[]
> = (ctx: C, params: P) => Promise<R>

const actionIsAsyncMap = new WeakMap<Function, boolean>()

// TODO:利用infer来判断返回的action是否是async
export const bindAction = <C extends ViewContext, R, P extends any[]>(
  action: IAction<C, R, P> | IAsyncAction<C, R, P>,
  ctx: C
) => {
  const isAsync = actionIsAsyncMap.get(action)
  if (isAsync) {
    return async (...rest: P) => {
      return await action(ctx, rest)
    }
  }
  return (...rest: P) => {
    return action(ctx, rest)
  }
}

export const defineAction = <
  C extends ViewContext = ViewContext,
  R = any,
  P extends any[] = any[]
>(
  value: IAction<C, R, P>
) => {
  actionIsAsyncMap.set(value, false)
  return value
}

export const defineAsyncAction = <
  C extends ViewContext = ViewContext,
  R = any,
  P extends any[] = any[]
>(
  value: IAsyncAction<C, R, P>
) => {
  actionIsAsyncMap.set(value, true)
  return value
}
