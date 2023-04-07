import { defineState, Number, Array } from '@vue-cook/core'

export default defineState({
  name: 'refNumber',
  type: 'Ref',
  typeDefine: Number(),
  init: ctx => {
    return 30
  }
})
