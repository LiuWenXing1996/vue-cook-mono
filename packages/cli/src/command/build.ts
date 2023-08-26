import path, { resolve } from 'node:path'
import genVueScriptContent from '../utils/genVueScriptContent'
import { name } from '../../package.json'
import {
  creatBuildContext,
  IBuildOptions
} from '../buildContext/createBuildContext'
 // @ts-ignore
import { getCustomComsole } from '@vue-cook/shared'
import { findAllComponentPaths } from '../utils/findAllComponentPaths'
import { exit } from 'node:process'
import { readFile } from 'node:fs/promises'

const { log } = getCustomComsole(name)

export interface ICookConfig {
  version: string
  ignorePaths: string[]
  entry: string
  components: string
  rootPath: string
}

export const resolveConfig = async (cookConfigPath: string) => {
  const absolutePath = resolve(cookConfigPath)
  let content: ICookConfig | undefined = undefined
  try {
    const contentString = await readFile(absolutePath, 'utf-8')
    content = JSON.parse(contentString) as ICookConfig
  } catch (e) {}
  return content
}


const build = async (options: IBuildOptions) => {
  const { configPath } = options
  const config = await resolveConfig(configPath)
  if (!config) {
    return
  }
  const realtivePath = path.resolve(configPath, '../')
  const entryDirPath = path.join(realtivePath, config.entry)
  log('gen index vue script ...')
  const allComponentPaths = await findAllComponentPaths(entryDirPath)
  await Promise.all(
    allComponentPaths.map(async e => {
      return await genVueScriptContent(e)
    })
  )
  log('gen index vue script ended')
  log('create build context ...')
  const ctx = await creatBuildContext(options)
  await ctx?.rebuild()
  exit(0)
}

export default build
