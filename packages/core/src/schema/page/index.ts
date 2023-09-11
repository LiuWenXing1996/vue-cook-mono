import { IComponentConfig, transformComponent } from '../component'

export interface IPageConfig extends IComponentConfig {
  path: string
}

export const check = (config: IPageConfig) => {
  return true
}

export const transformPage = (config: IPageConfig) => {
  return transformComponent(config)
}

export const transformPageEntryTs = (options: {
  config: IPageConfig
  indexVuePath: string
}) => {
  const { config, indexVuePath } = options
  let content = `
import Component from "${indexVuePath}"
Component.name = "${config.name}"
Component.path = "${config.path}"
export default Component
`
  return content
}
