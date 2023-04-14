import { defineState, Number, Array } from '@vue-cook/core'

export default defineState({
  type: 'Ref',
  typeDefine: Number(),
  init: ctx => {
    return 30
  }
})
