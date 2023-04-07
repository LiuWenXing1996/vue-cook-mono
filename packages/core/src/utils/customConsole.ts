const prefix = '[VueCook]'

const wrapperMsg = (msg: string) => {
  return `${prefix}:${msg}`
}

export const error = (msg: string) => {
  console.error(wrapperMsg(msg))
}

export const log = (msg: string) => {
  console.log(wrapperMsg(msg))
}

export const warn = (msg: string) => {
  console.warn(wrapperMsg(msg))
}
