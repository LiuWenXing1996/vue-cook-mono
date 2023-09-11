import { trimExtname } from '../../bundler/utils/path'

export interface IStyleConfig {
  content: string
  lang?: string
  module?: boolean
  scoped?: boolean
}

const BaseStateTypes = [
  'raw',
  'ref',
  'shallowRef',
  'reactive',
  'shallowReactive'
]
export interface IBaseStateConfig {
  type: 'raw' | 'ref' | 'shallowRef' | 'reactive' | 'shallowReactive'
  value: string[]
}

export interface IComputedStateConfig {
  type: 'computed'
  getter: string[]
}

export interface IWritableComputedStateConfig {
  type: 'writableComputed'
  getter: string[]
  setter: string[]
}

export type IStateConfig =
  | IBaseStateConfig
  | IComputedStateConfig
  | IWritableComputedStateConfig

export type IWatcherConfig = IWatchConfig | IWatchEffectConfig
export type IWatcherFlushConfig = 'pre' | 'post' | 'sync'
export interface IWatchConfig {
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

export interface IComponentConfig {
  name: string
  export?: boolean
  exportName?: string
  template?: string[]
  scripts?: IScriptConfig[]
  styles?: IStyleConfig[]
  states?: Record<string, IStateConfig>
  watchers?: IWatcherConfig[]
}

export const StateTypeMethodMap: Record<IStateConfig['type'], string> = {
  raw: '',
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
    states = {},
    watchers = [],
    scripts = [],
    template
  } = config
  const vueApis: string[] = []
  Object.keys(states).map(stateName => {
    const stateConfig = states[stateName]
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
  if (!vueApis.includes('shallowRef')) {
    vueApis.push('shallowRef')
  }

  let content = `
<template>
    ${template?.join('\n')}
</template>`

  //   let content = `
  // <template>
  //     ${template?.join('\n')}
  // </template>

  // <script setup lang="ts">
  // import { ${vueApis.join(', ')}} from "vue"
  // ${scripts
  //   .map(s => {
  //     const path = trimExtname(s.path, ['.ts', '.js'])
  //     return `import * as ${s.alias} from "${path}"`
  //   })
  //   .join('\n')}
  // const states = shallowRef({
  //     ${Object.keys(states)
  //       .map(stateName => {
  //         const stateConfig = states[stateName]
  //         const method = StateTypeMethodMap[stateConfig.type] || ''
  //         let varContent = ''
  //         if (BaseStateTypes.includes(stateConfig.type)) {
  //           varContent = `${(stateConfig as IBaseStateConfig).value}`
  //         }
  //         if (stateConfig.type === 'computed') {
  //           varContent = `${stateConfig.getter}`
  //         }
  //         if (stateConfig.type === 'writableComputed') {
  //           varContent = `{
  //   get:${stateConfig.getter},
  //   set:${stateConfig.setter}
  // }`
  //         }
  //         if (method) {
  //           varContent = `${method}(${varContent})`
  //         }
  //         return `  ${stateName}:${varContent}`
  //       })
  //       .join(',\n')}
  // })
  // ${watchers
  //   .map(watchConfig => {
  //     let content = ''
  //     if (watchConfig.type === 'watch') {
  //       let options = JSON.stringify(watchConfig.options)
  //       content = `watch(${watchConfig.source},${watchConfig.callback}`
  //       if (options) {
  //         content += `,${options}`
  //       }
  //       content += `)`
  //     }
  //     if (watchConfig.type === 'watchEffect') {
  //       let options = JSON.stringify(watchConfig.options)
  //       content = `watchEffect(${watchConfig.effect}`
  //       if (options) {
  //         content += `,${options}`
  //       }
  //       content += `)`
  //     }
  //     return content
  //   })
  //   .filter(e => e)
  //   .join(',\n')}
  // </script>

  // ${styles
  //   .map(style => {
  //     return `<style ${style.scoped ? 'scoped ' : ''}${
  //       style.module ? 'module ' : ''
  //     }${style.lang ? `lang=${style.lang}` : ''}>
  //     ${style.content}
  // </style>`
  //   })
  //   .join('\n')}

  // `
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
