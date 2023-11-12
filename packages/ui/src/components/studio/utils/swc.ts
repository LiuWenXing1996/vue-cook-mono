import { default as _initSwc } from '@swc/wasm-web'
import * as swc from '@swc/wasm-web'
import type { ISwc } from '@vue-cook/schema-bundler'

let _inited = false
export const initSwc = async (swcWasmUrl: string): Promise<ISwc> => {
  if (!_inited) {
    await _initSwc(swcWasmUrl)
  }
  _inited = true
  return swc as unknown as ISwc
}
