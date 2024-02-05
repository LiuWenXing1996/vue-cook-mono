import { path, templateSchemaParser } from '@vue-cook/core'
import { defineEsbuildPlugin } from '@/utils/define-esbuild-plugin'
import { type CompilerOptions } from '@vue/compiler-sfc'
import * as vueCompiler from '@vue/compiler-sfc'
import hash from 'hash-sum'
const { isAbsolute, join, rootName, extname, dirname, relative, trimExtname, basename } = path

const removeQuery = (p: string) => p.replace(/\?.+$/, '')
const genId = (filepath: string) => hash(filepath)
const compiler = vueCompiler

export const vueSfcPlugin = defineEsbuildPlugin((params) => {
  const { vfs, cookConfig } = params
  const namespace = 'vue-sfc'
  const viewSchemaFileFilter = new RegExp(`${cookConfig.viewEntryFile}$`)
  const templateSchemaFilter = new RegExp(`.html\\?type=template$`)
  const viewSchemaFilter = new RegExp(`${cookConfig.viewEntryFile}\\?type=view$`)
  const formatPath = (p: string, resolveDir: string) => {
    let filepath = p
    if (!isAbsolute(p)) {
      const realtivePath = relative(rootName(), resolveDir)
      filepath = join(realtivePath, filepath)
    }
    return filepath
  }
  return {
    name: namespace,
    setup(build) {
      const useSourceMap = !!build.initialOptions.sourcemap
      build.initialOptions.define = build.initialOptions.define || {}
      const formatPath = (p: string, resolveDir: string) => {
        let filepath = p
        if (!isAbsolute(p)) {
          const realtivePath = relative(rootName(), resolveDir)
          filepath = join(realtivePath, filepath)
        }
        return filepath
      }

      build.onResolve({ filter: /\.vue$/ }, (args) => {
        const newPath = formatPath(args.path, args.resolveDir)
        return {
          path: newPath,
          namespace
        }
      })

      build.onResolve({ filter: /\?vue&type=template/ }, (args) => {
        const newPath = formatPath(args.path, args.resolveDir)
        return {
          path: newPath,
          namespace
        }
      })

      build.onResolve({ filter: /\?vue&type=script/ }, (args) => {
        const newPath = formatPath(args.path, args.resolveDir)
        return {
          path: newPath,
          namespace
        }
      })

      build.onResolve({ filter: /\?vue&type=style/ }, (args) => {
        const newPath = formatPath(args.path, args.resolveDir)
        return {
          path: newPath,
          namespace
        }
      })

      build.onLoad({ filter: /\.vue$/, namespace }, async (args) => {
        const filepath = args.path
        const content = ((await vfs.readFile(filepath, 'utf-8')) || '') as string
        const sfc = compiler.parse(content)

        let contents = ``

        const inlineTemplate = !!sfc.descriptor.scriptSetup && !sfc.descriptor.template?.src
        const isTS =
          sfc.descriptor.scriptSetup?.lang === 'ts' || sfc.descriptor.script?.lang === 'ts'
        const hasScoped = sfc.descriptor.styles.some((s) => s.scoped)
        const expressionPlugins: CompilerOptions['expressionPlugins'] = isTS
          ? ['typescript']
          : undefined

        if (sfc.descriptor.script || sfc.descriptor.scriptSetup) {
          const scriptResult = compiler.compileScript(sfc.descriptor, {
            id: genId(filepath),
            inlineTemplate,
            sourceMap: useSourceMap
          })
          contents += compiler.rewriteDefault(scriptResult.content, '__sfc_main', expressionPlugins)
        } else {
          contents += `let __sfc_main = {}`
        }

        if (sfc.descriptor.styles.length > 0) {
          contents += `
              import "${basename(filepath)}?vue&type=style"
              `
        }

        if (sfc.descriptor.template && !inlineTemplate) {
          contents += `
              import { render } from "${basename(filepath)}?vue&type=template"
    
              __sfc_main.render = render
              `
        }

        if (hasScoped) {
          contents += `__sfc_main.__scopeId = "data-v-${genId(filepath)}"\n`
        }

        contents += `\nexport default __sfc_main`
        return {
          contents,
          resolveDir: dirname(filepath),
          loader: isTS ? 'ts' : 'js'
        }
      })

      build.onLoad({ filter: /\?vue&type=template/, namespace }, async (args) => {
        const filepath = removeQuery(args.path)
        const source = ((await vfs.readFile(filepath, 'utf-8')) || '') as string
        const { descriptor } = compiler.parse(source)
        if (descriptor.template) {
          const hasScoped = descriptor.styles.some((s) => s.scoped)
          const id = genId(filepath)
          // if using TS, support TS syntax in template expressions
          const expressionPlugins: CompilerOptions['expressionPlugins'] = []
          const lang = descriptor.scriptSetup?.lang || descriptor.script?.lang
          if (lang && /tsx?$/.test(lang) && !expressionPlugins.includes('typescript')) {
            expressionPlugins.push('typescript')
          }

          const compiled = compiler.compileTemplate({
            source: descriptor.template.content,
            filename: filepath,
            id,
            scoped: hasScoped,
            isProd: false,
            slotted: descriptor.slotted,
            preprocessLang: descriptor.template.lang,
            compilerOptions: {
              scopeId: hasScoped ? `data-v-${id}` : undefined,
              sourceMap: useSourceMap,
              expressionPlugins
            }
          })
          return {
            contents: compiled.code,
            resolveDir: dirname(filepath)
          }
        }
        return undefined
      })

      build.onLoad({ filter: /\?vue&type=script/, namespace }, async (args) => {
        const filepath = removeQuery(args.path)
        const source = ((await vfs.readFile(filepath, 'utf-8')) || '') as string

        const { descriptor } = compiler.parse(source, {
          filename: filepath
        })
        if (descriptor.script) {
          const compiled = compiler.compileScript(descriptor, {
            id: genId(filepath)
          })
          return {
            contents: compiled.content,
            resolveDir: dirname(filepath),
            loader: compiled.lang === 'ts' ? 'ts' : 'js'
          }
        }
        return undefined
      })

      build.onLoad({ filter: /\?vue&type=style/, namespace }, async (args) => {
        const filepath = removeQuery(args.path)
        const source = ((await vfs.readFile(filepath, 'utf-8')) || '') as string
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
            loader: 'css',
            resolveDir: dirname(filepath)
          }
        }
        return undefined
      })
    }
  }
})
