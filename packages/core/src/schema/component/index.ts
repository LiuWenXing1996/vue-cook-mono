import { trimExtname } from '../../bundler/utils/path'

export interface IStyleConfig {
  content: string
  lang?: string
  module?: boolean
  scoped?: boolean
}

// export type IMultiLineString = string[]

const trimEmptyLine = (str: string | undefined) => {
  if (!str) {
    return ''
  }
  const strList = str.split('\n')
  const li: string[] = []
  strList?.forEach(e => {
    if (e.trim?.()) {
      li.push(e)
    }
  })
  if (li.length > 0) {
    li[li.length - 1] = li[li.length - 1].trimEnd()
  }
  return li.join('\n')
}

// const MultiLineString = {
//   parse: (str: string) => {
//     return str.split('\n')
//   },
//   toString: (strList: IMultiLineString | undefined) => {
//     const li: string[] = [];
//     strList?.forEach(e => {
//       if (e.trim?.()) {
//         li.push(e)
//       }
//     })
//     if (li.length > 0) {
//       li[li.length - 1] = li[li.length - 1].trimEnd()
//     }
//     return li.join('\n')
//   }
// }

const BaseStateTypes = [
  'raw',
  'ref',
  'shallowRef',
  'reactive',
  'shallowReactive'
]
export interface IBaseStateConfig {
  name: string
  type: 'raw' | 'ref' | 'shallowRef' | 'reactive' | 'shallowReactive'
  value: string
}

export interface IComputedStateConfig {
  name: string
  type: 'computed'
  getter: string
}

export interface IWritableComputedStateConfig {
  name: string
  type: 'writableComputed'
  getter: string
  setter: string
}

export type IStateConfig =
  | IBaseStateConfig
  | IComputedStateConfig
  | IWritableComputedStateConfig

export type IWatcherConfig = IWatchConfig | IWatchEffectConfig
export type IWatcherFlushConfig = 'pre' | 'post' | 'sync'
export interface IWatchConfig {
  name: string
  type: 'watch'
  source: string
  callback: string
  options?: {
    deep?: boolean
    flush?: IWatcherFlushConfig
    immediate?: boolean
    onTrack?: string
    onTrigger?: string
  }
}
export interface IWatchEffectConfig {
  name: string
  type: 'watchEffect'
  effect: string
  options?: {
    flush?: IWatcherFlushConfig
    onTrack?: string
    onTrigger?: string
  }
}

export interface IScriptConfig {
  path: string
  alias: string
}

export interface IMethodConfig {
  name: string
  content: string
}

export interface IUseComponentConfig {
  path: string
  alias: string
  destructuringName?: string
}

export interface IComponentConfig {
  name: string
  export?: boolean
  components?: IUseComponentConfig[]
  exportName?: string
  template?: string
  methods?: IMethodConfig[]
  scripts?: IScriptConfig[]
  styles?: IStyleConfig[]
  states?: IStateConfig[]
  watchers?: IWatcherConfig[]
}

export const StateTypeMethodMap: Record<IStateConfig['type'], string> = {
  raw: 'markRaw',
  ref: 'ref',
  shallowRef: 'shallowRef',
  reactive: 'reactive',
  shallowReactive: 'shallowReactive',
  computed: 'computed',
  writableComputed: 'computed'
}

// TODO:s实现component的转换与校验
export const check = (config: IComponentConfig) => {
  // TODO:使用zod来做校验实现
  return true
}

export const transformComponent = (config: IComponentConfig) => {
  let {
    styles = [],
    states = [],
    watchers = [],
    scripts = [],
    methods = [],
    components = [],
    template
  } = config
  const vueApis: string[] = []
  states.map(stateConfig => {
    const method = StateTypeMethodMap[stateConfig.type] || ''
    if (method) {
      if (!vueApis.includes(method)) {
        vueApis.push(method)
      }
    }
  })
  watchers.map(watchConfig => {
    const method = watchConfig.type
    if (method) {
      if (!vueApis.includes(method)) {
        vueApis.push(method)
      }
    }
  })
  if (!vueApis.includes('reactive')) {
    vueApis.push('reactive')
  }
  let content = `
  <template>
      ${trimEmptyLine(template)}
  </template>

  <script setup lang="ts">
  import { ${vueApis.join(', ')}} from "vue"
  ${components
    .map(useComponentConfig => {
      const { destructuringName, alias, path } = useComponentConfig
      const _path = trimExtname(path, ['.ts', '.js'])
      let importantContent = `import `
      if (destructuringName) {
        importantContent += `{ ${destructuringName}`
        if (alias !== destructuringName) {
          importantContent += ` as ${alias}`
        }
        importantContent += ` }`
      } else {
        importantContent += `${alias}`
      }
      return `${importantContent} from "${_path}"`
    })
    .join('\n')}
  ${scripts
    .map(s => {
      const path = trimExtname(s.path, ['.ts', '.js'])
      return `import * as ${s.alias} from "${path}"`
    })
    .join('\n')}
  const states = reactive({
      ${states
        .map(stateConfig => {
          const method = StateTypeMethodMap[stateConfig.type] || ''
          let varContent = ''
          if (BaseStateTypes.includes(stateConfig.type)) {
            varContent = `${trimEmptyLine(
              (stateConfig as IBaseStateConfig).value
            )}`
          }
          if (stateConfig.type === 'computed') {
            varContent = `${trimEmptyLine(stateConfig.getter)}`
          }
          if (stateConfig.type === 'writableComputed') {
            varContent = `{
    get:${trimEmptyLine(stateConfig.getter)},
    set:${trimEmptyLine(stateConfig.setter)}
  }`
          }
          if (method) {
            varContent = `${method}(${varContent})`
          }
          return `  ${stateConfig.name}:${varContent}`
        })
        .join(',\n')}
  })
  const methods = {
    ${methods
      .map(methodConfig => {
        return `  ${methodConfig.name}:${trimEmptyLine(methodConfig.content)}`
      })
      .join(',\n')}
  }
  const watchers = {
  ${watchers
    .map(watchConfig => {
      let watchContent = ''
      if (watchConfig.type === 'watch') {
        let options = ``
        if (watchConfig.options) {
          options = `{`
          if (watchConfig.options.deep) {
            options += `
              deep:true`
          }
          if (watchConfig.options.flush) {
            options += `
              flush:${watchConfig.options.flush}`
          }
          if (watchConfig.options.immediate) {
            options += `
              immediate:true`
          }
          if (watchConfig.options.onTrack) {
            options += `
              onTrack:${trimEmptyLine(watchConfig.options.onTrack)}`
          }
          if (watchConfig.options.onTrigger) {
            options += `
              onTrigger:${trimEmptyLine(watchConfig.options.onTrigger)}`
          }
          options += `
          }`
        }
        watchContent = `watch(${watchConfig.source},${trimEmptyLine(
          watchConfig.callback
        )}`
        if (options) {
          watchContent += `,${options}`
        }
        watchContent += `)`
      }
      if (watchConfig.type === 'watchEffect') {
        let options = ``
        if (watchConfig.options) {
          options = `{`
          if (watchConfig.options.flush) {
            options += `
              flush:${watchConfig.options.flush}`
          }
          if (watchConfig.options.onTrack) {
            options += `
              onTrack:${trimEmptyLine(watchConfig.options.onTrack)}`
          }
          if (watchConfig.options.onTrigger) {
            options += `
              onTrigger:${trimEmptyLine(watchConfig.options.onTrigger)}`
          }
          options += `
          }`
        }
        watchContent = `watchEffect(${trimEmptyLine(watchConfig.effect)}`
        if (options) {
          watchContent += `,${options}`
        }
        watchContent += `)`
      }
      return `${watchConfig.name}:${watchContent}`
    })
    .filter(e => e)
    .join(',\n')}
    }
  </script>

  ${styles
    .map(style => {
      return `<style ${style.scoped ? 'scoped ' : ''}${
        style.module ? 'module ' : ''
      }${style.lang ? `lang=${style.lang}` : ''}>
      ${trimEmptyLine(style.content)}
  </style>`
    })
    .join('\n')}

  `
  return content
}

export const transformComponentEntryTs = (options: {
  config: IComponentConfig
  indexVuePath: string
}) => {
  const { config, indexVuePath } = options
  let content = `
import Component from "${indexVuePath}"
Component.name = "${config.name}"
export default Component
`
  return content
}
