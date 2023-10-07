import { createBuildContext, type IBuildContextConfig } from '../bundler/build'
import { vue } from './plugins/vue'
import { exportSchemaParser } from './schema/exportSchema'
import { vueComponentSchemaParser } from './schema/vueComponentSchema'
import { vuePageSchemaParser } from './schema/vuePageSchema'
import { createSchemaToCodePlugin, type ISchemaParser } from './plugins/schemaToCode'
import { fillConfig, type ICookConfig, path, type IPkgJson } from '@vue-cook/core'

export type ILowcodeContextConfig = Pick<
  IBuildContextConfig,
  'env' | 'vfs' | 'esbuild' | 'swc' | 'plugins' | 'disableWrite' | 'watch' | 'onBuildEnd'
> & {}

export type ILowcodeBuildContext = Awaited<ReturnType<typeof createLowcodeBuildContext>>

export const createLowcodeBuildContext = async (config: ILowcodeContextConfig) => {
  let { plugins = [], vfs } = config
  const pkgJson = await vfs.readJson<IPkgJson>('package.json')
  if (!pkgJson) {
    if (!pkgJson) {
      throw new Error('没有找到 package.json')
    }
  }
  const configJsonPath = pkgJson.cookConfigFile || 'cook.config.json'
  // TODO:config json 变成config yaml
  let _cookConfig = await vfs.readJson<ICookConfig>(configJsonPath)
  if (!_cookConfig) {
    throw new Error(`没有找到 ${configJsonPath}`)
  }
  const cookConfig = fillConfig(_cookConfig)
  const schemaToCodePlugin = createSchemaToCodePlugin({ cookConfig })
  const { findSchemaParser } = schemaToCodePlugin
  schemaToCodePlugin.registerSchemaParser(exportSchemaParser)
  schemaToCodePlugin.registerSchemaParser(vueComponentSchemaParser)
  schemaToCodePlugin.registerSchemaParser(vuePageSchemaParser)
  plugins = [...plugins, schemaToCodePlugin.plugin, vue()]

  const buildContextConfig: IBuildContextConfig = {
    ...config,
    entry: path.join(cookConfig.root, 'index.ts'),
    outdir: path.join(cookConfig.outdir, './schema'),
    sourcemap: cookConfig.sourcemap,
    minify: cookConfig.minify,
    plugins
  }

  const context = await createBuildContext(buildContextConfig)

  return {
    ...context,
    findSchemaParser
  }
}
