import { default as _initSwc } from '@swc/wasm-web'
import * as swc from '@swc/wasm-web'
import swcWasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import type { ISwc } from '@vue-cook/core'

let _inited = false
export const initSwc = async (): Promise<ISwc> => {
  if (!_inited) {
    await _initSwc(swcWasmUrl)
  }
  _inited = true
  return swc as unknown as ISwc
}
