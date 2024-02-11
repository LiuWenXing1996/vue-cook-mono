import { path, type IDepMeta } from '@vue-cook/core'
import { outputFile, remove } from 'fs-extra'
import { resolve, relative, dirname } from 'node:path'

const { trimExtname } = path
const pkgNameNormalize = (name: string) => {
  return name.replaceAll('/', '+')
}

export const genDepsEntryJs = async (params: {
  mode: 'design' | 'runtime'
  tempDir: string
  depMetaList: IDepMeta[]
}) => {
  let { mode, tempDir, depMetaList } = params
  tempDir = resolve(tempDir, mode)
  const depEntryList = depMetaList.map((depMeta) => {
    const cookMeta = depMeta.cookMeta
    let importString = ''
    if (mode === 'design') {
      importString = cookMeta?.designerEntry?.import || ''
    }
    if (mode === 'runtime') {
      importString = cookMeta?.runtimeEntry?.import || ''
    }
    return {
      name: depMeta.name,
      version: depMeta.version,
      path: resolve(tempDir, './libs', `./${pkgNameNormalize(depMeta.name)}.ts`),
      content:
        importString ||
        `
import * as Lib from "${depMeta.name}";
export * from "${depMeta.name}";
const defaultValue = Lib.default||{}
export default defaultValue
  `,
      metaPath: resolve(tempDir, './libs', `./${pkgNameNormalize(depMeta.name)}.meta.json`),
      metaContent: JSON.stringify(depMeta, null, 2)
    }
  })

  const depsEntryCss = {
    path: resolve(tempDir, `./index.css`),
    content: `/* deps css content */`
  }
  const depsEntryJs = {
    path: '',
    content: ''
  }
  depsEntryJs.path = resolve(tempDir, `./deps-entry.ts`)
  depsEntryJs.content = `
  import { exportDeps } from "@vue-cook/core"
  import "./index.css"

  ${depEntryList
    .map((dep, index) => {
      let realtivePath = './' + relative(dirname(depsEntryJs.path), dep.path)
      let realtiveMetaPath = './' + relative(dirname(depsEntryJs.path), dep.metaPath)
      realtivePath = trimExtname(realtivePath, ['.ts', '.js'])
      return `
import * as Lib${index} from "${realtivePath}"
import Lib${index}Meta from "${realtiveMetaPath}"
      `
    })
    .join('\n')}

  const deps = {
    ${depEntryList
      .map((dep, index) => {
        return `"${dep.name}":{
          value:Lib${index},
          meta:Lib${index}Meta
      }`
      })
      .join(',\n')}
  };

  exportDeps({deps,targetWindow:window})
  `
  await remove(tempDir)
  await Promise.all(
    depEntryList.map(async (depEntry) => {
      await outputFile(depEntry.path, depEntry.content)
      await outputFile(depEntry.metaPath, depEntry.metaContent)
    })
  )
  await outputFile(depsEntryCss.path, depsEntryCss.content)
  await outputFile(depsEntryJs.path, depsEntryJs.content)
  return depsEntryJs
}
