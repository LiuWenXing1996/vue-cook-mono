import { defineMaterial } from '@vue-cook/core'
export * from './runtime'
export default [
  defineMaterial({
    name: 'el-button',
    group: 'element-plus',
    tag: 'el-button',
    packageName: '@vue-cook/element-plus-materials',
    varName: 'ElButton'
  })
]
