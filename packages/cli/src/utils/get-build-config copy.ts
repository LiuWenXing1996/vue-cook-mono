import {
  type IDeepRequiredCookConfig,
  CjsWrapperBanner,
  CjsWrapperFooter,
  ElementDataCoreLibOnceGetterIdIdKey,
  ElementDataLowcodeContextIdKey
} from '@vue-cook/core'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import type { InlineConfig } from 'vite'

export const getBuildConfig = (params: {
  cookConfig: IDeepRequiredCookConfig
  externals: IDeepRequiredCookConfig['embed'][0]['externals']
  outDir: string
  entry: string
}) => {
  let { externals, cookConfig, outDir, entry } = params
  externals = externals
    .filter((e) => e.packageName !== '@vue-cook/core')
    .concat({
      packageName: '@vue-cook/core',
      injectName: 'VueCookCore'
    })
  const buildConfig: InlineConfig = {
    publicDir: false,
    plugins: [nodeResolve(), commonjs(), nodePolyfills()],
    build: {
      minify: cookConfig.minify,
      outDir: outDir,
      sourcemap: cookConfig.sourcemap,
      lib: {
        entry,
        name: 'deps',
        formats: ['iife'],
        fileName: () => {
          return 'index.js'
        }
      },
      rollupOptions: {
        external: (id: string) => {
          return externals
            .map((e) => e.packageName)
            .some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
        },
        output: {
          banner: `(function(){
              ${externals
                .map((e) => {
                  return `var ${e.injectName}`
                })
                .join(';\n')}
(function(){
  var script = document.currentScript
  var coreLibGetterUid = script.dataset.${ElementDataCoreLibOnceGetterIdIdKey}
  VueCookCore = window[coreLibGetterUid]()
  var lowcodeContext = VueCookCore.getLowcodeContextFromScript(script)
  // var externalLibs = lowcodeContext.getExternalLibs()
  ${externals
    .filter((e) => e.packageName !== '@vue-cook/core')
    .map((e) => {
      return `  ${e.injectName} = externalLibs["${e.packageName}"]`
    })
    .join(';\n')}
}());

`,
          footer: `
    }())`,
          globals: (id) => {
            const pkg = externals.find((e) => {
              return id === e.packageName || id.startsWith(`${e.packageName}/`)
            })
            return pkg?.injectName || ''
          }
        }
      }
    }
  }

  return buildConfig
}
