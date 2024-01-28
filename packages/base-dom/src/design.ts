import { defineMaterial } from '@vue-cook/core'
export * from './runtime'
export default [
  defineMaterial({
    name: 'text',
    group: 'base-dom',
    tag: 'text',
    packageName: '@vue-cook/base-dom',
    varName: 'Text',
    editor: {
      attributes: {
        size: {
          type: 'enum',
          packageName: ''
        }
      }
    }
  })
]
