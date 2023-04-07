import { ElButton } from 'element-plus'
import refNumber from './states/refNumber'

const tpl = {
  tag: ElButton.name,
  props: {
    text: {
      isVar: true,
      type: 'string',
      value: refNumber
    },
    icon: {
      isVar: false,
      value: 'loading'
    },
  },
  events: {},
  classNames: {},
  styles: {},
  children: [
    {
      text: {}
    }
  ]
}

export default {}
