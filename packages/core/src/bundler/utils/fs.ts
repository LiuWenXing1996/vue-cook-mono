import { parse } from 'yaml'
import { Volume, createFsFromVolume, type IFs } from 'memfs'
import type { vol } from 'memfs'
import { dirname, join } from './path'
import type { IWriteFileOptions } from 'memfs/lib/node/types/options'

export type FsPromisesApi = IFs['promises']

const YAML = {
  parse
}

export class VirtulFileSystem {
  #files: Map<string, string>
  constructor(files: Record<string, string>) {
    this.#files = new Map(Object.entries(files || {}))
  }
  async readFile(path: string) {
    return this.#files.get(path)
  }
  async readAllFiles() {
    return Object.fromEntries(this.#files.entries())
  }

  async readJson<T>(path: string) {
    let jsonObj: T | undefined = undefined
    const content = this.#files.get(path)
    jsonObj = JSON.parse(content || '') as T
    return jsonObj
  }
  async readYaml<T>(path: string) {
    let obj: T | undefined = undefined
    const content = this.#files.get(path)
    obj = YAML.parse(content || '') as T
    return obj
  }
  async outputFile(path: string, content: string) {
    this.#files.set(path, content)
  }
  async remove(path: string) {
    this.#files.delete(path)
  }
  async isFile(path: string) {
    return this.#files.has(path)
  }
}

export interface IVirtulFileSystem extends FsPromisesApi {
  readYaml: <T>(path: string) => Promise<T>
  readJson: <T>(path: string) => Promise<T>
  listFiles: (dir?: string) => Promise<string[]>
  exists: (path: string) => Promise<boolean>
  outputFile: (
    file: string,
    data: string | NodeJS.ArrayBufferView,
    options?: IWriteFileOptions
  ) => Promise<void>
  isFile: (path: string) => Promise<boolean>
  isDirectory: (path: string) => Promise<boolean>
  getFs: () => IFs
  getVoulme: () => typeof vol
}

export const createVfs = (): IVirtulFileSystem => {
  const vol = new Volume()
  const fs = createFsFromVolume(vol)
  const { readFile } = fs.promises

  const readYaml = async <T>(path: string): Promise<T> => {
    let obj: T | undefined = undefined
    const content = (await readFile(path, 'utf-8')) as string
    obj = YAML.parse(content || '') as T
    return obj
  }

  const readJson = async <T>(path: string): Promise<T> => {
    let jsonObj: T | undefined = undefined
    const content = (await readFile(path, 'utf-8')) as string
    jsonObj = JSON.parse(content || '') as T
    return jsonObj
  }

  const listFiles = async (dir?: string) => {
    const files: string[] = []
    dir = dir || '/'
    const getFiles = async (currentDir: string) => {
      const fileList = (await vfs.readdir(currentDir)) as string[]
      for (const file of fileList) {
        const name = join(currentDir, file)
        if ((await vfs.stat(name)).isDirectory()) {
          await getFiles(name)
        } else {
          files.push(name)
        }
      }
    }
    await getFiles(dir)
    return files
  }

  const exists = async (path: string) => {
    try {
      await fs.promises.stat(path)
      return true
    } catch {
      return false
    }
  }

  const isFile = async (path: string) => {
    try {
      const stat = await fs.promises.stat(path)
      return stat.isFile()
    } catch {
      return false
    }
  }

  const isDirectory = async (path: string) => {
    try {
      const stat = await fs.promises.stat(path)
      return stat.isDirectory()
    } catch {
      return false
    }
  }

  const outputFile = async (
    file: string,
    data: string | NodeJS.ArrayBufferView,
    options?: IWriteFileOptions
  ) => {
    const dir = dirname(file)
    const fileExist = await exists(dir)
    if (!fileExist) {
      await fs.promises.mkdir(dir, { recursive: true })
    }
    fs.promises.writeFile(file, data, options)
  }

  const vfs: IVirtulFileSystem = {
    ...fs.promises,
    readYaml,
    readJson,
    listFiles,
    exists,
    outputFile,
    isFile,
    isDirectory,
    getFs: () => {
      return fs
    },
    getVoulme: () => {
      return vol
    }
  }

  return vfs
}
