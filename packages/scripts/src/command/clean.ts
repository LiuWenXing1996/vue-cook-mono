import fsExtra from 'fs-extra'
import path from 'path'
import { dtsTempPath, distPath } from '../utils/constValues'
import { getPkgName } from '../utils/getPkgName'
const { remove } = fsExtra

const logWithLibName = (libName: string, msg: string) => {
  console.log(`[${libName}:clean] ${msg}`)
}

export const clean = async () => {
  const libName = await getPkgName()
  const dtsTempResolvePath = path.resolve(dtsTempPath)
  const distResolvePath = path.resolve(distPath)
  const pathsWillRemove = [dtsTempResolvePath, distResolvePath]
  for (let i = 0; i < pathsWillRemove.length; i++) {
    const pathWillRemove = pathsWillRemove[i]
    logWithLibName(libName, `will remove: ${pathWillRemove}`)
    await remove(pathWillRemove)
    logWithLibName(libName, `remove success: ${pathWillRemove}`)
  }
}
