export const globalModulesMapName = '__vue__cook__global__modules__map__name__'

function withedYourCode(code: string) {
  code = `
var module={
    exports:undefined
}

with(globalObj) {
  var require = function(moduleName){
    return ${globalModulesMapName}[moduleName]
  }
  ${code}
}
return module.exports
`
  return new Function('globalObj', code)
}

export default function sandbox(params: { code: string; ctx: Object; targetWindow: Window }) {
  const { code, ctx, targetWindow } = params
  return withedYourCode(code).call(targetWindow, ctx)
}
