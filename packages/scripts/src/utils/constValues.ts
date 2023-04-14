export const dtsTempPath = '.local/dts-temp'
export const distPath = './dist'
export const rollupLibCmd =
  'rollup --config rollup.config.ts --configPlugin typescript'
export const rollupLibCmdWithWatch = `${rollupLibCmd} --watch`
export const emitDtsCmd = 'tsc --outDir .local/dts-temp -p ./tsconfig.dts.json'
export const emitDtsCmdWithWatch = `${emitDtsCmd} --watch`
export const rollupDtsCmd =
  'rollup -c rollup.dts.config.ts  --configPlugin typescript'
export const rollupDtsCmdWitcWatch = `${rollupDtsCmd} --watch`
