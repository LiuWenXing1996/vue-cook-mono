import sandbox from './sandbox'
import { sandboxGlobalInjectMethodName } from '@vue-cook/shared'

export interface LowcodeConfig {
  entryJs: string
  libs: Record<string, any>
}

export const run = async (config: LowcodeConfig) => {
  const { entryJs, libs } = config
  const lowcodeJS = await fetch(entryJs).then(res => {
    return res.text()
  })
  const res = sandbox(lowcodeJS, {
    [sandboxGlobalInjectMethodName]: () => {
      return {
        getLib: (name: string) => {
          return libs[name]
        }
      }
    }
  })
  return res
}
