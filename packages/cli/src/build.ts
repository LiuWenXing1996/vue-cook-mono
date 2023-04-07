import { context, type Plugin } from 'esbuild'
import dayjs from 'dayjs'
import Vue from 'unplugin-vue/esbuild'
import path from 'node:path'
import fs from 'node:fs'
import chokidar from 'chokidar'
import genVueScriptContent from './utils/genVueScriptContent'

const log = (msg: string) => {
  console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]:${msg}`)
}

let WatchPlugin: Plugin = {
  name: 'watch',
  setup (build) {
    build.onStart(() => {
      log('build started')
      log('building ...')
    })
    build.onEnd(() => {
      log('build ended')
    })
  }
}

const VirtualPlugin = (options: Record<string, string> = {}) => {
  const namespace = 'virtual'
  const filter = new RegExp(
    Object.keys(options)
      .map(name => `^${name}$`)
      .join('|')
  )
  const plugin: Plugin = {
    name: namespace,
    setup (build) {
      build.onResolve({ filter }, args => ({ path: args.path, namespace }))
      build.onLoad({ filter: /.*/, namespace }, args => ({
        contents: options[args.path],
        loader: 'js'
      }))
    }
  }
  return plugin
}

export interface IBuildOptions {
  configPath: string
}

export interface IBuildConfig {
  entry: string
  output: string
}

const resoveConfig = (configPath: string) => {
  const absolutePath = path.resolve(configPath)
  let config: IBuildConfig | undefined = undefined
  try {
    config = JSON.parse(fs.readFileSync(absolutePath, 'utf-8')) as IBuildConfig
  } catch (e) {}
  return config
}

const build = async (options: IBuildOptions) => {
  const { configPath } = options
  const config = resoveConfig(configPath)
  if (!config) {
    return
  }
  const realtivePath = path.resolve(configPath, '../')

  await genVueScriptContent(
    path.join(realtivePath, config.entry, './pages/foo')
  )

  // let ctx = await context({
  //   entryPoints: [path.join(realtivePath, config.entry, './index.ts')],
  //   bundle: true,
  //   outfile: path.join(realtivePath, config.output, './index.js'),
  //   target: ['es2015'],
  //   format: 'cjs',
  //   // sourcemap: 'inline',
  //   sourcemap: true,
  //   plugins: [
  //     WatchPlugin,
  //     Vue(),
  //     VirtualPlugin({
  //       vue: `
  //     const vue = useLib("vue");
  //     module.exports = vue;
  //         `
  //     })
  //   ]
  // })

  // chokidar.watch(realtivePath).on('change', async () => {
  //   await ctx.rebuild()
  // })

  // log('watching...')
}

export default build
