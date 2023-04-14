import { defineState, Number, Array } from '@vue-cook/core'
// defineState返回的是一个带 type 的uid
// config是没有name的，换句话说，他是没有的具名导出的
// 否则在复用的时候会有很大问题
// 
export default defineState({
  type: 'Ref',
  typeDefine: Number(),
  init: ctx => {
    return 30
  }
})