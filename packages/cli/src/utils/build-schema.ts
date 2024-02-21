import { relative, resolve } from 'node:path'
import { emptyDir, outputFile } from 'fs-extra'
import * as esbuild from 'esbuild'
import * as swc from '@swc/core'
import { getFielsContent, resolveConfig, resolvePkgJson } from '../utils'
import { createVfs } from '@vue-cook/core'

export interface IBuildDepsOptions {
  configPath: string
  pkgJsonPath: string
  __dirname: string
}


const buildSchema = async (options: IBuildDepsOptions) => {
  console.log("buildSchema 需要重新实现")
  const { configPath, pkgJsonPath, __dirname } = options
  const config = await resolveConfig(configPath)
  if (!config) {
    return
  }
  const pkgJson = await resolvePkgJson(pkgJsonPath)
  if (!pkgJson) {
    return
  }
  const { ignorePaths } = config
  // 读取项目文件
  const { globby } = await import('globby')
  const files = await globby(['**/*'], {
    cwd: resolve(__dirname, '.'),
    gitignore: true,
    ignore: ignorePaths
  })
  console.log(files)
  const fielsContent = await getFielsContent(files)
  // console.log('fielsContent', fielsContent)
  const modules: Record<string, string> = {}
  fielsContent.map((e) => {
    const _path = relative(resolve(__dirname, '.'), e.path)
    modules[_path] = e.content
  })
  const vfs = createVfs()
  await Promise.all(
    Object.keys(modules).map(async (filePath) => {
      await vfs.outputFile(filePath, modules[filePath])
    })
  )
  // const context = await createLowcodeBuildContext({
  //   env: 'node',
  //   vfs,
  //   esbuild,
  //   // FIXME:这个watch有问题，没有监测到真实的文件更改
  //   watch: true,
  //   onBuildEnd: () => {
  //     console.log('===>')
  //   },
  //   plugins: [
  //     {
  //       name: 'logVfs',
  //       enforce: 'post',
  //       bundleStart: async (options, helper) => {
  //         const vfs = helper.getVirtualFileSystem()
  //         const files = (await vfs.listFiles()) || []
  //         const tempLogFile = resolve(__dirname, './node_modules/.vfs-temp')
  //         await emptyDir(tempLogFile)
  //         await Promise.all(
  //           files.map(async (key) => {
  //             const _path = resolve(tempLogFile, key)
  //             const content = await vfs.readFile(key)
  //             await outputFile(_path, content || '')
  //           })
  //         )
  //         console.log('虚拟文件: ' + tempLogFile)
  //       }
  //     }
  //   ],
  //   swc
  // })

  // const res = await context.rebuild()

  // // TODO:使用copyFs是不是逻辑更清晰？
  // await Promise.all(
  //   Object.keys(res || {}).map(async (key) => {
  //     await outputFile(key, res?.[key]?.content || '')
  //   })
  // )

  // return res
}

export default buildSchema
