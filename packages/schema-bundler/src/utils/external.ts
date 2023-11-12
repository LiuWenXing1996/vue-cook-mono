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
