import { basename, extname, join } from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { outputFile, ensureFile } from 'fs-extra'
import dayjs from 'dayjs'

const findModules = async (
  path: string,
  pathName: string,
  typeName: string
) => {
  const fileList = await readdir(path)
  const moduleList = fileList.map(e => {
    const extName = extname(e)
    const ingoreExts = ['.ts', '.js']
    const baseName = basename(e, extName)
    const modulePath = ingoreExts.includes(extName)
      ? `./${pathName}/${baseName}`
      : `./${pathName}/${baseName}${extName}`
    return {
      moduleName: `${typeName}${baseName}`,
      name: baseName,
      path: modulePath
    }
  })
  return moduleList
}

export default async (path: string) => {
  const indexVuePath = join(path, './index.vue')
  await ensureFile(indexVuePath)
  let indexVueContent = await readFile(indexVuePath, { encoding: 'utf-8' })
  if (!indexVueContent) {
    indexVueContent = `<template>
</template>

<style>
</style>

<script lang="ts">
</script>
`
  }

  const statesPath = join(path, './states')
  const stateModules = await findModules(statesPath, 'states', 'state')
  const methodsPath = join(path, './methods')
  const methodModules = await findModules(methodsPath, 'methods', 'method')

  const scriptContent = `<script lang="ts">
/**
 * script 内容将由脚本自动生成，请不要修改
 * 生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}
 */
import { createContext, useStates, useMethods } from '@vue-cook/core'
// states
${stateModules
  .map(e => {
    return `import ${e.moduleName} from '${e.path}'`
  })
  .join('\n')}
// methods
${methodModules
  .map(e => {
    return `import ${e.moduleName} from '${e.path}'`
  })
  .join('\n')}

export default {
    components: {},
    setup: () => {
        const statesConfig = {
          ${stateModules
            .map((e, index) => {
              if (index > 0) {
                return `
            ${e.name}: ${e.moduleName}`
              } else {
                return `  ${e.name}: ${e.moduleName}`
              }
            })
            .join(',')}
        }
        const methodsConfig = {
          ${methodModules
            .map((e, index) => {
              if (index > 0) {
                return `
            ${e.name}: ${e.moduleName}`
              } else {
                return `  ${e.name}: ${e.moduleName}`
              }
            })
            .join(',')}
        }
        const cookContext = createContext({
            states: statesConfig,
            methods: methodsConfig
        })
        const states = useStates(cookContext, statesConfig)
        const methods = useMethods(cookContext, methodsConfig)
        return {
            states,
            methods
        }
    }
}
</script>`
  let scriptStartIndex = indexVueContent.lastIndexOf('<script')
  let scriptEndIndex = indexVueContent.lastIndexOf('</script>')
  if (scriptStartIndex < 0) {
    scriptStartIndex = indexVueContent.length + 2
  }
  if (scriptEndIndex < 0) {
    scriptEndIndex = scriptStartIndex
  } else {
    scriptEndIndex = scriptEndIndex + 9
  }
  const scriptPreContent = indexVueContent.slice(0, scriptStartIndex)
  const scriptPostContent = indexVueContent.slice(scriptEndIndex)

  const newIndexVueContent =
    scriptPreContent + scriptContent + scriptPostContent

  await outputFile(indexVuePath, newIndexVueContent)
}
