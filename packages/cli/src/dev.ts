import { context, type Plugin } from 'esbuild'
import dayjs from 'dayjs'
import Vue from 'unplugin-vue/esbuild'
import path from 'node:path'
import chokidar from 'chokidar'
import genVueScriptContent from './utils/genVueScriptContent'
import { resoveConfig } from '@vue-cook/shared'
import { findAllComponentPaths } from './utils/findAllComponentPaths'
import { IBuildOptions } from './build'

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
// const resoveConfig = configPath => {
//   const absolutePath = path.resolve(configPath)
//   let config = undefined
//   try {
//     config = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'))
//   } catch (e) {}
//   return config
// }

const dev = async (options: IBuildOptions) => {
  log('dev starting ...')
  const { configPath } = options
  const config = resoveConfig(configPath) as any
  if (!config) {
    return
  }
  const realtivePath = path.resolve(configPath, '../')
  const entryDirPath = path.join(realtivePath, config.entry)
  log('gen index vue script ...')
  const allComponentPaths = await findAllComponentPaths(entryDirPath)
  // console.log(allComponentPaths)
  await Promise.all(
    allComponentPaths.map(async e => {
      return await genVueScriptContent(e)
    })
  )
  let ctx = await context({
    entryPoints: [path.join(realtivePath, config.entry, './index.ts')],
    bundle: true,
    outfile: path.join(realtivePath, config.output, './index.js'),
    target: ['es2015'],
    format: 'cjs',
    // sourcemap: 'inline',
    // sourcemap: true,
    plugins: [
      WatchPlugin,
      Vue(),
      VirtualPlugin({
        vue: `
      const vue = useLib("vue");
      module.exports = vue;
          `,
        '@vue-cook/core': `
          const ss = useLib("@vue-cook/core");
          module.exports = sss;
              `
      })
    ]
  })
  await ctx.rebuild()
  chokidar.watch(realtivePath).on('change', async () => {
    await ctx.rebuild()
  })
  log('watching...')
}

export default dev
