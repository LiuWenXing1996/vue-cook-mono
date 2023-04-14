import { defineConfig } from 'rollup'
import path from 'node:path'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import _dts from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import { distPath, dtsTempPath } from './constValues'

// HACK:dts这个库在被打包成cjs的时候，访问必须到default
// @ts-ignore
const dts = _dts.default ? _dts.default : _dts

export interface IOptions {
  __dirname: string
}

export const getRollupCommonLibBuildConfig = (options: IOptions) => {
  const { __dirname } = options
  return defineConfig({
    input: path.resolve(__dirname, 'src/index.ts'),
    plugins: [
      commonjs(),
      typescript({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      json()
    ],
    output: [
      {
        file: path.resolve(__dirname, distPath, 'index.cjs'),
        format: 'cjs',
        sourcemap: true
      },
      {
        file: path.resolve(__dirname, distPath, 'index.mjs'),
        format: 'esm',
        sourcemap: true
      }
    ]
  })
}

export const getRollupCommonDtsBuildConfig = (options: IOptions) => {
  const { __dirname } = options
  const dtsTemp = path.resolve(__dirname, dtsTempPath)

  return defineConfig({
    input: path.resolve(__dirname, dtsTemp, './src/index.d.ts'),
    output: {
      file: path.resolve(__dirname, distPath, './index.d.ts'),
      format: 'es'
    },
    plugins: [commonjs(), json(), dts()]
  })
}
