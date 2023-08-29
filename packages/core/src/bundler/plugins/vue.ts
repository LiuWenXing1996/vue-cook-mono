import type { Plugin } from 'esbuild'
import hash from 'hash-sum'
import type { CompilerOptions } from '@vue/compiler-sfc'
import type * as Compiler from '@vue/compiler-sfc'
import { isAbsolute, resolve, dirname, extname, join } from 'path-browserify'

const removeQuery = (p: string) => p.replace(/\?.+$/, '')

const genId = (filepath: string) => hash(filepath)

export const Vue = (options: {
  modules: Record<string, string>
  compiler: typeof Compiler
}) => {
  const { compiler } = options
  const namespace = 'vue'

  const plugin: Plugin = {
    name: namespace,

    setup (build) {
      // const absPath = path.resolve(
      //   process.cwd(),
      //   build.initialOptions.absWorkingDir || ''
      // )
      const useSourceMap = !!build.initialOptions.sourcemap

      build.initialOptions.define = build.initialOptions.define || {}
      // Object.assign(build.initialOptions.define, {
      //   __VUE_OPTIONS_API__:
      //     build.initialOptions.define?.__VUE_OPTIONS_API__ ?? true,
      //   __VUE_PROD_DEVTOOLS__:
      //     build.initialOptions.define?.__VUE_PROD_DEVTOOLS__ ?? false
      // })

      const formatPath = (p: string, importer: string) => {
        let filepath = p
        if (!isAbsolute(p)) {
          filepath = join(dirname(importer), filepath)
        }
        return filepath
      }

      build.onResolve({ filter: /\.vue$/ }, args => {
        return {
          path: args.path,
          namespace,
          pluginData: { importer: args.importer }
        }
      })

      build.onResolve({ filter: /\?vue&type=template/ }, args => {
        return {
          path: args.path,
          namespace,
          pluginData: { importer: args.pluginData.importer }
        }
      })

      build.onResolve({ filter: /\?vue&type=script/ }, args => {
        return {
          path: args.path,
          namespace,
          pluginData: { importer: args.pluginData.importer }
        }
      })

      build.onResolve({ filter: /\?vue&type=style/ }, args => {
        return {
          path: args.path,
          namespace,
          pluginData: { importer: args.pluginData.importer }
        }
      })

      build.onLoad({ filter: /\.vue$/, namespace }, async args => {
        const { importer } = args.pluginData
        const filepath = formatPath(args.path, importer)
        const content = options.modules[filepath]
        const sfc = compiler.parse(content)

        let contents = ``

        const inlineTemplate =
          !!sfc.descriptor.scriptSetup && !sfc.descriptor.template?.src
        const isTS =
          sfc.descriptor.scriptSetup?.lang === 'ts' ||
          sfc.descriptor.script?.lang === 'ts'
        const hasScoped = sfc.descriptor.styles.some(s => s.scoped)
        const expressionPlugins: CompilerOptions['expressionPlugins'] = isTS
          ? ['typescript']
          : undefined

        if (sfc.descriptor.script || sfc.descriptor.scriptSetup) {
          const scriptResult = compiler.compileScript(sfc.descriptor, {
            id: genId(filepath),
            inlineTemplate,
            sourceMap: useSourceMap
          })
          contents += compiler.rewriteDefault(
            scriptResult.content,
            '__sfc_main',
            expressionPlugins
          )
        } else {
          contents += `let __sfc_main = {}`
        }

        if (sfc.descriptor.styles.length > 0) {
          contents += `
          import "${args.path}?vue&type=style"
          `
        }

        if (sfc.descriptor.template && !inlineTemplate) {
          contents += `
          import { render } from "${args.path}?vue&type=template"

          __sfc_main.render = render
          `
        }

        if (hasScoped) {
          contents += `__sfc_main.__scopeId = "data-v-${genId(filepath)}"\n`
        }

        contents += `\nexport default __sfc_main`
        return {
          contents,
          pluginData: { importer },
          loader: isTS ? 'ts' : 'js'
        }
      })

      build.onLoad({ filter: /\?vue&type=template/, namespace }, async args => {
        const { importer } = args.pluginData
        const relativePath = removeQuery(args.path)
        const filepath = formatPath(relativePath, importer)
        const source = options.modules[filepath]
        const { descriptor } = compiler.parse(source)
        if (descriptor.template) {
          const hasScoped = descriptor.styles.some(s => s.scoped)
          const id = genId(filepath)
          // if using TS, support TS syntax in template expressions
          const expressionPlugins: CompilerOptions['expressionPlugins'] = []
          const lang = descriptor.scriptSetup?.lang || descriptor.script?.lang
          if (
            lang &&
            /tsx?$/.test(lang) &&
            !expressionPlugins.includes('typescript')
          ) {
            expressionPlugins.push('typescript')
          }

          const compiled = compiler.compileTemplate({
            source: descriptor.template.content,
            filename: filepath,
            id,
            scoped: hasScoped,
            isProd: process.env.NODE_ENV === 'production',
            slotted: descriptor.slotted,
            preprocessLang: descriptor.template.lang,
            compilerOptions: {
              scopeId: hasScoped ? `data-v-${id}` : undefined,
              sourceMap: useSourceMap,
              expressionPlugins
            }
          })
          return {
            contents: compiled.code
          }
        }
        return undefined
      })

      build.onLoad({ filter: /\?vue&type=script/, namespace }, async args => {
        const { importer } = args.pluginData
        const relativePath = removeQuery(args.path)
        const filepath = formatPath(relativePath, importer)
        const source = options.modules[filepath]

        const { descriptor } = compiler.parse(source, { filename: filepath })
        if (descriptor.script) {
          const compiled = compiler.compileScript(descriptor, {
            id: genId(filepath)
          })
          return {
            contents: compiled.content,
            loader: compiled.lang === 'ts' ? 'ts' : 'js'
          }
        }
        return undefined
      })

      build.onLoad({ filter: /\?vue&type=style/, namespace }, async args => {
        const { importer } = args.pluginData
        const relativePath = removeQuery(args.path)
        const filepath = formatPath(relativePath, importer)
        const source = options.modules[filepath]
        const { descriptor } = compiler.parse(source)
        if (descriptor.styles.length > 0) {
          const id = genId(filepath)
          let content = ''
          for (const style of descriptor.styles) {
            const compiled = await compiler.compileStyleAsync({
              source: style.content,
              filename: filepath,
              id,
              scoped: style.scoped,
              preprocessLang: style.lang as any,
              modules: !!style.module
            })

            if (compiled.errors.length > 0) {
              throw compiled.errors[0]
            }

            content += compiled.code
          }
          return {
            contents: content,
            loader: 'css'
          }
        }
        return undefined
      })
    }
  }

  return plugin
}
