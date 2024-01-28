import type { Plugin, Loader } from 'esbuild'
import { path } from '@vue-cook/core'
import { defineEsbuildPlugin } from '@/utils/define-esbuild-plugin'
const { isAbsolute, join, rootName, extname, dirname, relative } = path

// https://esbuild.github.io/api/#resolve-extensions
const RESOLVE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json']

export function inferLoader(p: string): Loader {
  const ext = extname(p)
  if (RESOLVE_EXTENSIONS.includes(ext)) {
    return ext.slice(1) as Loader
  }
  if (ext === '.mjs' || ext === '.cjs') {
    return 'js'
  }
  return 'text'
}

export const virtualFsPlugin = defineEsbuildPlugin((params) => {
  const { vfs } = params
  const namespace = 'virtualFs'
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        const oldPath = args.path
        const external = build.initialOptions.external?.some((e) => {
          if (oldPath === e) {
            return true
          }
          if (oldPath.startsWith(e)) {
            return true
          }
          return false
        })
        if (external) {
          return {
            path: oldPath,
            external: true
          }
        }
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

        return {
          contents,
          resolveDir: dirname(realPath),
          loader: inferLoader(realPath)
        }
      })
    }
  }
})
