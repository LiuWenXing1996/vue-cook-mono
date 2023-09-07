import stringifyObject from 'stringify-object'
import { trimExtname } from '../../bundler/utils/path'

export interface IStyleConfigJson {
  lang?: 'css' | 'less'
  scoped?: boolean
}

export interface IStateConfigJson {
  type:
    | 'raw'
    | 'ref'
    | 'shallowRef'
    | 'reactive'
    | 'shallowReactive'
    | 'computed'
    | 'writableComputed'
  value?: any
  getter?: string
  setter?: string
}

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

export interface IComponentConfig {
  name: string
  export?: boolean
  exportName?: string
  template?: string
  functions?: string
  styles?: Record<string, IStyleConfigJson>
  states?: Record<string, IStateConfigJson>
  watchers?: IWatcherConfig[]
}

export const StateTypeMethodMap: Record<IStateConfigJson['type'], string> = {
  raw: '',
  ref: 'ref',
  shallowRef: 'shallowRef',
  reactive: 'reactive',
  shallowReactive: 'shallowReactive',
  computed: 'computed',
  writableComputed: 'computed'
}

export const transformComponent = (options: {
  config: IComponentConfig
  templateContent: string
  stylesContent: Record<string, string>
}) => {
  const { templateContent, config, stylesContent } = options
  let { styles = {}, states = {}, watchers = [], functions } = config
  if (functions) {
    functions = trimExtname(functions, ['.ts', '.js'])
  }
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
    ${templateContent}
</template>

<script setup lang="ts">
import { ${vueApis.join(', ')}} from "vue"
${functions ? `import * as functions from "${functions}"` : ''}
const states = shallowRef({
    ${Object.keys(states)
      .map(stateName => {
        const stateConfig = states[stateName]
        const method = StateTypeMethodMap[stateConfig.type] || ''
        let varContent = `${stringifyObject(stateConfig.value, {
          indent: '  ',
          singleQuotes: false
        })}`
        if (method) {
          varContent = `${method}(${varContent})`
        }
        return `  ${stateName}:${varContent}`
      })
      .join(',\n')} 
})
${watchers
  .map(watchConfig => {
    let content = ''
    if (watchConfig.type === 'watch') {
      let options = JSON.stringify(watchConfig.options)
      content = `watch(${watchConfig.source},${watchConfig.callback}`
      if (options) {
        content += `,${options}`
      }
      content += `)`
    }
    if (watchConfig.type === 'watchEffect') {
      let options = JSON.stringify(watchConfig.options)
      content = `watchEffect(${watchConfig.effect}`
      if (options) {
        content += `,${options}`
      }
      content += `)`
    }
    return content
  })
  .filter(e => e)
  .join(',\n')}
</script>

${Object.keys(styles)
  .map(stylePath => {
    const config = styles[stylePath]
    return `<style ${config.scoped ? 'scoped ' : ''}${
      config.lang ? config.lang + ' ' : ''
    }>
${stylesContent?.[stylePath]}
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
