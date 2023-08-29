import { type Plugin } from 'esbuild'
import { isAbsolute, resolve, dirname, extname, join } from 'path-browserify'

// 基本实现了
export const FsPlugin = (options: { modules: Record<string, string> }) => {
  const namespace = 'fs'
  const plugin: Plugin = {
    name: namespace,
    setup (build) {
      build.onResolve({ filter: /.*/ }, args => {
        const oldPath = args.path
        if (build.initialOptions.external?.includes(oldPath)) {
          return {
            path: oldPath,
            external: true
          }
        }
        let newPath = oldPath
        if (!isAbsolute(oldPath)) {
          newPath = join(dirname(args.importer), oldPath)
        }
        return {
          path: newPath,
          namespace
        }
      })
      build.onLoad({ filter: /.*/, namespace }, args => {
        // const realPath = args.path.slice('/'.length)
        const realPath = args.path
        let contents = options.modules[realPath]
        let _extname = extname(realPath)
        if (!contents) {
          if (!_extname) {
            const tryExtname = ['.ts', '.js']
            for (let i = 0; i < tryExtname.length; i++) {
              _extname = tryExtname[i]
              contents = options.modules[realPath + _extname]
              if (contents) {
                break
              }
            }
          }
        }

        // TODO：此处loader处理过于粗暴，需要优化
        const loader = _extname.slice('.'.length) as any
        return {
          contents,
          loader: loader
        }
      })
    }
  }
  return plugin
}
