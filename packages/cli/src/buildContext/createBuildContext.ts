import { context } from 'esbuild'
// @ts-ignore
import Vue from 'unplugin-vue/esbuild'
import path from 'node:path'

import { WatchPlugin } from './plugins/WatchPlugin'
import { VirtualPlugin } from './plugins/VirtualPlugin'

export interface IBuildOptions {
  configPath: string
  pkgJsonPath: string
}

export const creatBuildContext = async (options: IBuildOptions) => {
  const { configPath, pkgJsonPath } = options
  // @ts-ignore
  const config = await resoveConfig(configPath)
  if (!config) {
    return
  }
  // @ts-ignore
  const pkg = await resolvePkgJson(pkgJsonPath)
  if (!pkg) {
    return
  }
  const { dependencies = {} } = pkg
  const moduleList = Object.keys(dependencies).map((key, index) => {
    return {
      varName: `Lib${index}`,
      moduleName: key
    }
  })
  const virtualModules: Record<string, string> = {}
  moduleList.map(e => {
    const { varName, moduleName } = e
    virtualModules[
      moduleName
      // @ts-ignore
    ] = `const { getLib } = ${sandboxGlobalInjectMethodName}();
const ${varName} = getLib("${moduleName}")
module.exports = ${varName};
`
  })
  const configDirPath = path.resolve(configPath, '../')
  let ctx = await context({
    entryPoints: [path.join(configDirPath, config.entry, './index.ts')],
    bundle: true,
    outfile: path.join(
      configDirPath,
      config.public,
      config.output,
      './index.js'
    ),
    target: ['es2015'],
    format: 'cjs',
    // sourcemap: 'inline',
    // sourcemap: true,
    plugins: [WatchPlugin(), Vue(), VirtualPlugin(virtualModules)]
  })
  return ctx
}
