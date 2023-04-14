import path from 'node:path'
import genVueScriptContent from '../utils/genVueScriptContent'
import { name } from '../../package.json'
import {
  creatBuildContext,
  IBuildOptions
} from '../buildContext/createBuildContext'
import { getCustomComsole, resoveConfig } from '@vue-cook/shared'
import { findAllComponentPaths } from '../utils/findAllComponentPaths'
import { exit } from 'node:process'

const { log } = getCustomComsole(name)

const build = async (options: IBuildOptions) => {
  const { configPath } = options
  const config = await resoveConfig(configPath)
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
