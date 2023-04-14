import { existsSync, lstatSync } from 'fs-extra'

export default (path: string) => {
  if (!existsSync(path)) {
    return false
  }
  const isFile = lstatSync(path).isFile()
  if (!isFile) {
    return true
  }
  return false
}
