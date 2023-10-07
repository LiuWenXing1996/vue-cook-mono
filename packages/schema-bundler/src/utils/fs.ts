import { Volume, createFsFromVolume, type IFs } from 'memfs'
import { createFsUtils, type IFsUtils } from '@vue-cook/core'

export interface IVirtulFileSystem extends IFsUtils {
  getFs: () => IFs
}

export const createVfs = (): IVirtulFileSystem => {
  const vol = new Volume()
  const fs = createFsFromVolume(vol)

  // @ts-ignore
  const fsUtils = createFsUtils(fs.promises)

  const vfs: IVirtulFileSystem = {
    ...(fsUtils as IFsUtils),
    getFs: () => {
      return fs
    }
  }

  return vfs
}
