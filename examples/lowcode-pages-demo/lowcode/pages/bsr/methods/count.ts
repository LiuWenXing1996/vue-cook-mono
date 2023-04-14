import refNumber from '../states/refNumber'

export default defineMethod({
  name: 'count',
  init: context => {
    const num = useState(context, refNumber)
    return () => {
      if (num) {
        num.value = num.value + 1
      }
    }
  }
})
