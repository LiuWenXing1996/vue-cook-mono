import type * as ESBuild from 'esbuild'
import { VirtualPlugin } from './plugins/VirtualPlugin'
import { FsPlugin } from './plugins/FsPlugin'
import { ICookConfig, IPkgJson } from '../utils'

export const sandboxGlobalInjectMethodName = 'ss'

export interface IBuildOptions {
  config: ICookConfig
  pkgJson: IPkgJson
  modules: Record<string, string>
}

export const creatBuildContext = async (
  esbuild: typeof ESBuild,
  options: IBuildOptions
) => {
  const { config, pkgJson, modules } = options
  if (!config) {
    return
  }
  if (!pkgJson) {
    return
  }
  const { dependencies = {} } = pkgJson
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
    ] = `const { getLib } = ${sandboxGlobalInjectMethodName}();
const ${varName} = getLib("${moduleName}")
module.exports = ${varName};
`
  })
  let ctx = await esbuild.context({
    entryPoints: [config.entry],
    bundle: true,
    target: ['es2015'],
    format: 'cjs',
    // sourcemap: 'inline',
    // sourcemap: true,
    plugins: [VirtualPlugin(virtualModules), FsPlugin({ modules })]
  })

  return ctx
}

export const cunstomBuild = async (
  esbuild: typeof ESBuild,
  options: IBuildOptions
) => {
  const { config, pkgJson, modules } = options
  if (!config) {
    return
  }
  if (!pkgJson) {
    return
  }
  const { dependencies = {} } = pkgJson
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
    ] = `const { getLib } = ${sandboxGlobalInjectMethodName}();
const ${varName} = getLib("${moduleName}")
module.exports = ${varName};
`
  })
  let res = await esbuild.build({
    entryPoints: [config.entry],
    bundle: true,
    target: ['es2015'],
    format: 'cjs',
    // minify: true,
    write: false,
    outdir: './sss/',
    // sourcemap: 'inline',
    // sourcemap: true,
    plugins: [VirtualPlugin(virtualModules), FsPlugin({ modules })]
  })

  return res
}
