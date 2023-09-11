import { parse } from 'yaml'

export class VirtulFileSystem {
  #files: Map<string, string>
  constructor (files: Record<string, string>) {
    this.#files = new Map(Object.entries(files || {}))
  }
  async readFile (path: string) {
    return this.#files.get(path)
  }
  async readAllFiles () {
    return Object.fromEntries(this.#files.entries())
  }

  async readJson<T> (path: string) {
    let jsonObj: T | undefined = undefined
    const content = this.#files.get(path)
    jsonObj = JSON.parse(content || '') as T
    return jsonObj
  }
  async outputFile (path: string, content: string) {
    this.#files.set(path, content)
  }
  async remove (path: string) {
    this.#files.delete(path)
  }
  async isFile (path: string) {
    return this.#files.has(path)
  }
}

export type IVirtulFileSystem = VirtulFileSystem
