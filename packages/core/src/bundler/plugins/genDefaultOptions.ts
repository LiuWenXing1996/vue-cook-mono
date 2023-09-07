import { IPlugin, defineMethodName } from '..'

export const genDefaultOptions = (): IPlugin => {
  return {
    name: 'genDefaultOptions',
    bundleStart: (options, helper) => {
      const config = helper.getCookConfig()
      const pkgJson = helper.getPackageJson()
      const { join } = helper.getPathUtils()
      let { root } = config
      const { dependencies = {} } = pkgJson
      const entryTsPath = join(root, config.entryTsName || 'index.ts')
      return {
        entryPoints: [entryTsPath],
        bundle: true,
        target: ['es2015'],
        format: 'esm',
        write: false,
        external: Object.keys(dependencies),
        outdir: join(config.outdir, './schema'),
        sourcemap: true
      }
    },
    transformStart: () => {
      return {
        module: {
          type: 'amd'
        },
        sourceMaps: 'inline'
      }
    },
    minifyStart: (options, helper) => {
      const config = helper.getCookConfig()
      return {
        css: {
          loader: 'css',
          minify: config.minify == undefined ? true : config.minify,
          sourcemap: true
        },
        js: {
          loader: 'js',
          minify: config.minify == undefined ? true : config.minify,
          sourcemap: true,
          banner: `(function () {
var define = window['${defineMethodName}']`,
          footer: '})();'
        }
      }
    }
  }
}
