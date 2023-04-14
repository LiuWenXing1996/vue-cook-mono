import concurrently from 'concurrently'
import { clean } from './clean'
import {
  emitDtsCmd,
  emitDtsCmdWithWatch,
  rollupDtsCmdWitcWatch,
  rollupLibCmdWithWatch
} from '../utils/constValues'
import { getPkgName } from '../utils/getPkgName'

export interface IConfig {
  libName: string
}

export const dev = async () => {
  await clean()
  const libName = await getPkgName()
  const { result } = concurrently([
    {
      command: rollupLibCmdWithWatch,
      name: `${libName}:watch:lib-build`
    },
    {
      command: emitDtsCmdWithWatch,
      name: `${libName}:watch:dts-emit`
    },
    {
      command: `${emitDtsCmd} & ${rollupDtsCmdWitcWatch}`,
      name: `${libName}:watch:dts-build`
    }
  ])

  result.then(
    () => {},
    e => {
      console.log(e)
    }
  )
}
