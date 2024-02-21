import { existsSync, lstatSync } from 'fs-extra'
import { flattenDeep, some } from 'lodash'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
// import { minimatch } from 'minimatch'
import {
  createFsUtils,
  fillConfig,
  type ICookConfig,
  type ICookMeta,
  type IDeepRequiredCookConfig,
  type IPkgJson,
  type IDepMeta
} from '@vue-cook/core'
import fsPromises from 'node:fs/promises'

const { outputFile, readJson, tryReadJson, tryReadYaml } = createFsUtils(fsPromises)

export const isDir = (path: string) => {
  if (!existsSync(path)) {
    return false
  }
  const isFile = lstatSync(path).isFile()
  if (!isFile) {
    return true
  }
  return false
}

export const getOutDir = (config: IDeepRequiredCookConfig) => {
  return resolve(process.cwd(), config.outdir)
}

export const getTempDir = (config: IDeepRequiredCookConfig) => {
  return resolve(process.cwd(), config.tempDir)
}

export const resolveConfig = async (
  cookConfigPath: string
): Promise<IDeepRequiredCookConfig | undefined> => {
  const absolutePath = resolve(cookConfigPath)
  let content: IDeepRequiredCookConfig | undefined = undefined
  try {
    const contentString = await readFile(absolutePath, 'utf-8')
    content = JSON.parse(contentString) as IDeepRequiredCookConfig
    content = fillConfig(content)
  } catch (e) {}
  return content
}

export const resolvePkgJson = async (pkgJsonPath: string) => {
  const absolutePath = resolve(pkgJsonPath)
  let content: IPkgJson | undefined = undefined
  try {
    const contentString = await readFile(absolutePath, 'utf-8')
    content = JSON.parse(contentString) as IPkgJson
  } catch (e) {}
  return content
}

export const pkgNameNormalize = (name: string) => {
  return name.replaceAll('/', '+')
}

export const genDepEntryList = (options: {
  tempDir: string
  dependencies: Record<string, string>
  deps: IDeepRequiredCookConfig['deps']
}) => {
  const { tempDir, dependencies, deps } = options
  const depEntryList = Object.keys(dependencies).map((depName) => {
    return {
      name: depName,
      version: dependencies[depName],
      path: resolve(tempDir, './libs', `./${pkgNameNormalize(depName)}.ts`),
      content:
        deps.find((e) => e.name === depName)?.entry ||
        `
export * from "${depName}"; 
`
    }
  })
  return depEntryList
}

// export const isIgnorePath = (path: string, ignorePaths: string[]) => {
//   return some(ignorePaths, (e) => {
//     const realtivePath = relative(resolve(), path)
//     return minimatch(realtivePath, e)
//   })
// }

// export const getFiles = async (path: string, ignorePaths: string[]) => {
//   const res: string[] = []
//   if (isIgnorePath(path, ignorePaths)) {
//     return res
//   }
//   if (!isDir(path)) {
//     return res
//   }
//   const fileList: string[] = []
//   const dirList: string[] = []
//   const childFileList = (await readdir(path)).map((e) => resolve(path, e))
//   childFileList.map((e) => {
//     if (isDir(e)) {
//       dirList.push(e)
//     } else {
//       if (!isIgnorePath(e, ignorePaths)) {
//         fileList.push(e)
//       }
//     }
//   })
//   res.push(...fileList)
//   const childFiles = await Promise.all(
//     dirList.map(async (e) => {
//       return await getFiles(e, ignorePaths)
//     })
//   )
//   const childFilesFlatted = flattenDeep(childFiles)
//   res.push(...childFilesFlatted)

//   return res
// }

export const getFielsContent = async (pathList: string[]) => {
  const fielsContent = await Promise.all(
    pathList.map(async (e) => {
      let content: string | undefined = undefined
      try {
        content = await readFile(e, 'utf-8')
      } catch (e) {
        content = ''
      }
      return {
        path: e,
        content
      }
    })
  )
  return fielsContent
}

export const collectDepMetaList = async (
  cookConfig: ICookConfig,
  packageJson: IPkgJson
): Promise<IDepMeta[]> => {
  let { dependencies = {} } = packageJson
  const metaList = await Promise.all(
    Object.keys(dependencies).map(async (depName) => {
      const modulePath = resolve(process.cwd(), './node_modules', depName)
      const packageJsonPath = resolve(modulePath, './package.json')
      const pkgJson = await readJson<IPkgJson>(packageJsonPath)
      let metaFilePath = resolve(modulePath, pkgJson.cookMetaFile || './cook.meta.yaml')
      const cookMeta = await tryReadYaml<ICookMeta>(metaFilePath)
      const overrideCookMeta = cookConfig.overrideCookMetas.find((e) => e.name === depName)
      return {
        name: pkgJson.name as string,
        version: pkgJson.version,
        packageJson: pkgJson,
        cookMeta: {
          ...cookMeta,
          ...overrideCookMeta
        }
      }
    })
  )
  return metaList
}
