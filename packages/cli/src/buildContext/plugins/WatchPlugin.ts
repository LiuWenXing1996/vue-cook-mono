import { type Plugin } from 'esbuild'
import { name } from '../../../package.json'
import { getCustomComsole } from '../../utils/customComsole'

const { log } = getCustomComsole(name)

export const WatchPlugin = () => {
  const plugin: Plugin = {
    name: 'watch',
    setup (build) {
      build.onStart(() => {
        log('build started')
        log('building ...')
      })
      build.onEnd(() => {
        log('build ended')
      })
    }
  }
  return plugin
}
