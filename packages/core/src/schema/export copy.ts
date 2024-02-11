import { groupBy } from 'lodash'
import { z } from 'zod'
import { trimExtname } from '../utils/path'
import { pascalCase } from 'pascal-case'

export interface IExportItemConfig {
  path: string
  category: string
  name: string
}

const pascalCaseRule = {
  check: (val: string) => {
    const normalizeName = pascalCase(val)
    if (normalizeName !== val) {
      return false
    }
    return true
  },
  message: (val: string) => {
    const normalizeName = pascalCase(val)
    return {
      message: ` ${val}的格式不正确，应为${normalizeName}`
    }
  }
}

const exportItemConfigSchema = z.object({
  path: z.string(),
  category: z.string().refine(pascalCaseRule.check, pascalCaseRule.message),
  name: z.string().refine(pascalCaseRule.check, pascalCaseRule.message)
})

export type IExportConfig = IExportItemConfig[]

const exportConfigSchema = exportItemConfigSchema.array()

export const checkItem = (item: Partial<IExportItemConfig>) => {
  if (item.name) {
    throw new Error('')
  }
}

export const check = (config: IExportConfig) => {
  exportConfigSchema.parse(config)
}

export const transfer = (config: IExportConfig, targetPath: string) => {
  config = config || []
  const categorys = groupBy(config, (e) => e.category)
  let content = `${Object.keys(categorys)
    .map((categoryName) => {
      const items = categorys[categoryName]
      return items
        .map((item) => {
          const realtivePath = trimExtname(item.path, ['.ts', '.js'])
          return `import ${categoryName}${item.name} from '${realtivePath}';`
        })
        .join('\n')
    })
    .join('\n')}
    ${Object.keys(categorys)
      .map((categoryName) => {
        const items = categorys[categoryName]
        return `const ${categoryName}s = {
${items
  .map((item) => {
    return `  ${item.name}:${categoryName}${item.name}`
  })
  .join(',\n')}
}`
      })
      .join('\n')}
export {
  ${Object.keys(categorys)
    .map((categoryName) => {
      return `  ${categoryName}s`
    })
    .join(',\n')}
}
      `

  return content
}
