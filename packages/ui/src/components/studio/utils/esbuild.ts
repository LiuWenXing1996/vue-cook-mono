import * as esbuild from 'esbuild-wasm'
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import type { IEsbuild } from '@vue-cook/core'

let _inited = false
export const initEsbuild = async (): Promise<IEsbuild> => {
  if (!_inited) {
    await esbuild.initialize({
      wasmURL: esbuildWasmUrl
    })
  }
  _inited = true
  return esbuild as IEsbuild
}
