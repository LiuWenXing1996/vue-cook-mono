import { type Plugin } from 'esbuild'

export const VirtualPlugin = (options: Record<string, string> = {}) => {
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
