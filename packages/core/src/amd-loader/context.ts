import { Module } from './module'
import { DefineOptions } from './define'
import { v4 as uuidv4 } from 'uuid'

const getDirname = (path: string) => {
  const newPath = path.substring(0, path.lastIndexOf('/')) || undefined
  return newPath ? mustEndWithSlash(newPath) : './'
}

const isHttpUrl = (url: string) => {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return true
  }
  return false
}

const mustEndWithSlash = (value: string) => {
  if (value.endsWith('/')) {
    return value
  }
  return value + '/'
}

const contextMap = new Map<string, Context>()
export const getContext = (id: string) => {
  return contextMap.get(id)
}

export type ICallback = Function | Object
const innerUrlPrefix = 'innerUrl:'
export class Context {
  private id: string
  private config: Omit<IContextConfig, 'injectModules'>
  requireCounter: number
  moduleMap: Map<string, Module> = new Map()
  private defineOptionsMap: Map<string, DefineOptions> = new Map()
  constructor (config: Partial<IContextConfig>) {
    this.id = uuidv4()
    contextMap.set(this.id, this)

    this.config = {
      waitSeconds: config.waitSeconds == null ? 7 : config.waitSeconds,
      paths: config.paths || {},
      baseUrl: config.baseUrl ? mustEndWithSlash(config.baseUrl) : undefined
    }
    const injectModules = config.injectModules || {}
    Object.keys(injectModules).map(name => {
      this.moduleMap.set(name, injectModules[name])
    })

    this.requireCounter = 0
  }

  setDefineOptions (url: string, options: DefineOptions) {
    this.defineOptionsMap.set(url, options)
  }

  getDefineOptions (url: string) {
    return this.defineOptionsMap.get(url)
  }

  getId () {
    return this.id
  }

  nameToUrl (name: string, parentUrl?: string) {
    if (this.moduleMap.has(name)) {
      return innerUrlPrefix + name
    }
    let url = this.config.paths[name] || undefined
    const inPaths = this.config.paths[name] ? false : true
    let baseUrl = this.config.baseUrl
    if (!inPaths) {
      if (parentUrl) {
        baseUrl = getDirname(parentUrl)
      }
    }
    if (!url) {
      url = name
    }
    // TODO:补充js后缀
    if (!isHttpUrl(url)) {
      url = baseUrl + url
    }
    return url
  }

  getModule (url: string) {
    let module = this.moduleMap.get(url)
    if (!module) {
      module = new Module(this, url)
      this.moduleMap.set(url, module)
    }
    return module
  }

  getDepValues (depUrls: string[], callback: Function) {
    const depValues: any[] = []
    let depsCount = depUrls.length
    const check = () => {
      if (depsCount <= 0) {
        callback(...depValues)
      }
    }
    depUrls.forEach((depUrl, i) => {
      const module = this.getModule(depUrl)
      module.getExports((e: any) => {
        depsCount = depsCount - 1
        depValues[i] = e
        check()
      })
    })
  }
}

export type IContext = Context

export interface IContextConfig {
  waitSeconds: number
  baseUrl?: string
  paths: Record<string, string>
  injectModules: Record<string, any>
}
