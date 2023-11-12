import * as esbuild from 'esbuild-wasm'
import type { IEsbuild } from '@vue-cook/schema-bundler'

let _inited = false
export const initEsbuild = async (esbuildWasmUrl: string): Promise<IEsbuild> => {
  if (!_inited) {
    await esbuild.initialize({
      wasmURL: esbuildWasmUrl
    })
  }
  _inited = true
  return esbuild as IEsbuild
}
