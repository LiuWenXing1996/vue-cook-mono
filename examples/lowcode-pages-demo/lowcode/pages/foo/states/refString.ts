import { defineState, Number } from '@vue-cook/core'

export default defineState({
  typeDefine: Number(),
  type: 'Ref',
  init: ctx => {
    return 1
  }
})
