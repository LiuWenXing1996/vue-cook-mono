
export default defineMethod({
  name: 'hello',
  init: () => {
    return (msg: string) => {
      console.log(`bar component hello ${msg}`)
    }
  }
})
