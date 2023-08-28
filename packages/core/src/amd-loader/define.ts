import { isArray, isFunction } from 'lodash'
import { getContext } from './context'

const getCurrentScript = () => {
  let script = document.currentScript as HTMLScriptElement | null
  if (!script) {
    const scripts = document.getElementsByTagName('script')
    script = scripts[scripts.length - 1]
  }
  return script
}

type SupportCallback = Function | Object

const pickDefineOptions = (
  name?: string | string[] | SupportCallback,
  deps?: string[] | SupportCallback,
  callback?: SupportCallback
) => {
  let _name: string | undefined
  let _deps: string[] | undefined
  let _callback: Function | undefined

  if (typeof name !== 'string') {
    callback = deps
    deps = name
    name = undefined
  }
  _name = name

  if (!isArray(deps)) {
    callback = deps
    deps = []
  }
  _deps = deps as string[]
  // TODO: auto inject require deps

  if (!isFunction(callback)) {
    _callback = () => {
      return callback
    }
  } else {
    _callback = callback
  }

  return {
    name: _name,
    deps: _deps,
    callback: _callback
  }
}

export type DefineOptions = ReturnType<typeof pickDefineOptions>

const internalDefine = (options: DefineOptions) => {
  const script = getCurrentScript()
  const contextId = script.getAttribute('data-context-id')
  if (!contextId) {
    return
  }
  const context = getContext(contextId)
  if (!context) {
    return
  }
  const moduleUrl = script.getAttribute('data-module-url')
  if (!moduleUrl) {
    return
  }
  context.setDefineOptions(moduleUrl, options)
}

function define(name: string, deps: string[], callback: SupportCallback): void
function define(deps: string[], callback: SupportCallback): void
function define(callback: SupportCallback): void

function define (
  name?: string | string[] | SupportCallback,
  deps?: string[] | SupportCallback,
  callback?: SupportCallback
) {
  const params = pickDefineOptions(name, deps, callback)
  internalDefine(params)
}

define.amd = {}

export { define }
