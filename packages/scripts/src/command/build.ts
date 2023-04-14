import concurrently from 'concurrently'
import { clean } from './clean'
import { rollupLibCmd, emitDtsCmd, rollupDtsCmd } from '../utils/constValues'
import { getPkgName } from '../utils/getPkgName'

export const build = async () => {
  await clean()
  const libName = await getPkgName()
  const { result } = concurrently([
    {
      command: rollupLibCmd,
      name: `${libName}:build:lib`
    },
    {
      command: `${emitDtsCmd} && ${rollupDtsCmd}`,
      name: `${libName}:build:dts`
    }
  ])
  result.then(
    () => {},
    e => {
      console.log(e)
    }
  )
}
