import type { Plugin as EsbuildPlugin } from 'esbuild'
import type { IPlugin } from '..'

export const virtualFs = (): IPlugin => {
  const namespace = 'virtualFs'
  return {
    name: namespace,
    bundleStart: (options, helper) => {
      const { isAbsolute, join, rootName, extname, dirname, relative } = helper.getPathUtils()
      const vfs = helper.getVirtualFileSystem()
      const vfsPlugin: EsbuildPlugin = {
        name: namespace,
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
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
          build.onLoad({ filter: /.*/, namespace }, async (args) => {
            let realPath = args.path
            let contents = undefined
            try {
              contents = await vfs.readFile(realPath)
            } catch (error) {}
            if (!contents) {
              let _extname = extname(realPath)
              if (!_extname) {
                const tryExtname = ['.ts', '.js', '/index.ts', '/index.js']
                for (let i = 0; i < tryExtname.length; i++) {
                  _extname = tryExtname[i]
                  let _realPath = realPath + _extname
                  try {
                    contents = await vfs.readFile(_realPath)
                  } catch (error) {}
                  if (contents) {
                    realPath = _realPath
                    break
                  }
                }
              }
            }

            // TODO：此处loader处理过于粗暴，需要优化
            const loader = extname(realPath).slice('.'.length) as any
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
