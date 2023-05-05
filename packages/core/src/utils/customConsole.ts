const prefix = '[VueCook]'

let __enableConsole__ = false

const wrapperMsg = (msg: string) => {
  return `${prefix}:${msg}`
}

const warpperWitnSwitch = (func: (msg: string) => void) => {
  return (msg: string) => {
    if (__enableConsole__) {
      func(msg)
    }
  }
}

export const error = warpperWitnSwitch((msg: string) => {
  console.error(wrapperMsg(msg))
})

export const log = warpperWitnSwitch((msg: string) => {
  console.log(wrapperMsg(msg))
})

export const warn = warpperWitnSwitch((msg: string) => {
  console.warn(wrapperMsg(msg))
})

export const enableConsole = () => {
  __enableConsole__ = true
}

export const disableConsole = () => {
  __enableConsole__ = false
}
