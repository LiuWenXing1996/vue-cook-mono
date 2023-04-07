function withedYourCode (code: string) {
  code = `
let module={
    exports:undefined
}
with(globalObj) {
    ${code}
}
return module.exports.default
`
  return new Function('globalObj', code)
}

export default function sandbox (code: string = '', ctx: Object = {}) {
  return withedYourCode(code).call(window, ctx)
}
