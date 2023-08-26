import { type Plugin } from 'esbuild'
import { name } from '../../../package.json'
 // @ts-ignore
import { getCustomComsole } from '@vue-cook/shared'

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
