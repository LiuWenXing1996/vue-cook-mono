import { type Plugin as EsbuildPlugin } from 'esbuild'
import { IPlugin } from '..'

export const virtualFs = (): IPlugin => {
  const namespace = 'virtualFs'
  return {
    name: namespace,
    bundleStart: (options, helper) => {
      const { isAbsolute, join, rootName, extname, dirname, relative } =
        helper.getPathUtils()
      const vfs = helper.getVirtualFileSystem()
      const vfsPlugin: EsbuildPlugin = {
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
              const realtivePath = relative(rootName(), args.resolveDir)
              newPath = join(realtivePath, oldPath)
            }
            return {
              path: newPath,
              namespace
            }
          })
          build.onLoad({ filter: /.*/, namespace }, async args => {
            const realPath = args.path
            let contents = await vfs.readFile(realPath)
            let _extname = extname(realPath)
            if (!contents) {
              if (!_extname) {
                const tryExtname = ['.ts', '.js']
                for (let i = 0; i < tryExtname.length; i++) {
                  _extname = tryExtname[i]
                  contents = await vfs.readFile(realPath + _extname)
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
              resolveDir: dirname(realPath),
              loader: loader
            }
          })
        }
      }
      const oldPlugins = options.plugins || []
      return {
        plugins: [...oldPlugins, vfsPlugin]
      }
    }
  }
}
