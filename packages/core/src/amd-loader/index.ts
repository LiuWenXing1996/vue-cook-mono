// TODO:实现amd module loader
/**
 * 1.支持amd加载,基于requirejs
 * 2.支持scope，不同的模块加载不同的依赖
 * 3.支持全局注入：比如全局注入vue,@vue-cook/core之类的
 */

import { defineMethodName } from '../bundler'
import { Context, IContextConfig } from './context'
import { define } from './define'

export const require = async (deps: string[], config: IContextConfig) => {
  const context = new Context({ ...config })
  const depUrls = deps.map(depName => {
    return context.nameToUrl(depName)
  })
  return new Promise(resolve => {
    context.getDepValues(depUrls, (...depsValue: any[]) => {
      resolve(depsValue)
    })
  })
}

export const registerDefineMethod = () => {
  if (global) {
    // @ts-ignore
    global[defineMethodName] = define
  }
}
