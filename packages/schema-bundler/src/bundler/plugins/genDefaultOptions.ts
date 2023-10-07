import type { IPlugin } from '@/bundler/build'
import type { ProjectManifest } from '@pnpm/types'

export const getPackageDependencies = (pkgJson: ProjectManifest) => {
  const {
    dependencies = {},
    peerDependencies = {},
    devDependencies = {}
  } = pkgJson as ProjectManifest

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies),
    devDependencies: Object.keys(devDependencies)
  }
}

export const generateExternal = (pkgJson: ProjectManifest) => {
  const { dependencies, peerDependencies, devDependencies } = getPackageDependencies(pkgJson)
  const nodeBuildinLibs = [
    'node:util',
    'node:buffer',
    'node:stream',
    'node:net',
    'node:url',
    'node:fs',
    'node:path',
    'perf_hooks'
  ]
  const packages: string[] = [
    ...nodeBuildinLibs,
    ...peerDependencies,
    ...devDependencies,
    ...dependencies
  ]
  return [...new Set(packages)]
}

export const genDefaultOptions = (): IPlugin => {
  return {
    name: 'genDefaultOptions',
    bundleStart: async (options, helper) => {
      const vfs = helper.getVirtualFileSystem()
      const pkgJson = await vfs.readJson<ProjectManifest>('package.json')
      if (!pkgJson) {
        throw new Error('没有找到 package.json')
      }
      const buildConfig = helper.getBuildConfig()
      return {
        entryPoints: [buildConfig.entry],
        bundle: true,
        target: ['es2015'],
        format: 'cjs',
        write: false,
        external: generateExternal(pkgJson),
        outdir: buildConfig.outdir,
        sourcemap: buildConfig.sourcemap ? 'external' : false
      }
    },
    transformStart: (options, helper) => {
      const buildConfig = helper.getBuildConfig()
      return {
        sourceMaps: buildConfig.sourcemap ? 'inline' : false
      }
    },
    minifyStart: (options, helper) => {
      const buildConfig = helper.getBuildConfig()
      return {
        css: {
          loader: 'css',
          minify: buildConfig.minify,
          sourcemap: buildConfig.sourcemap ? 'external' : false
        },
        js: {
          loader: 'js',
          minify: buildConfig.minify,
          sourcemap: buildConfig.sourcemap ? 'external' : false
        }
      }
    }
  }
}
