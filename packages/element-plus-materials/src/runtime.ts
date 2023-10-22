import { defineView } from '@vue-cook/render'
import { ElButton } from 'element-plus'
import { name } from '../package.json'

export default [
  defineView({
    tag: 'el-button',
    packageName: name,
    designMode: ElButton,
    runtimeMode: ElButton
  })
]
