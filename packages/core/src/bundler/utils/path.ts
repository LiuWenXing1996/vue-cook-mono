import {
  resolve,
  normalize,
  isAbsolute,
  join,
  relative,
  dirname,
  basename,
  extname,
  format,
  parse
} from 'path-browserify'

const fixProcessUndefined = () => {
  try {
    if (!window['process']) {
      // @ts-ignore
      window['process'] = {}
    }

    if (!window['process'].cwd) {
      // @ts-ignore
      window['process'].cwd = () => {
        return '/'
      }
    }
  } catch (error) {}
}
fixProcessUndefined()

const trimExtname = (path: string, extnames?: string[]) => {
  let willTrim = true
  const _extname = extname(path)
  if (extnames) {
    willTrim = extnames.includes(_extname)
  }
  if (willTrim && _extname) {
    return path.slice(0, path.length - _extname.length)
  } else {
    return path
  }
}

const rootName = () => {
  return resolve()
}

export {
  resolve,
  normalize,
  isAbsolute,
  join,
  relative,
  dirname,
  basename,
  extname,
  format,
  parse,
  trimExtname,
  rootName
}
