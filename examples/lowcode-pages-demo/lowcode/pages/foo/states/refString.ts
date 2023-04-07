import { defineState } from "@vue-cook/core"

export default defineState({
  name: 'refString',
  type: 'Ref',
  init: ctx => {
    return 1
  }
})
