import { defineState, Number } from '@vue-cook/core'

export default defineState({
  type: 'Ref',
  typeDefine: Number(),
  init: ctx => {
    return 3
  }
})
