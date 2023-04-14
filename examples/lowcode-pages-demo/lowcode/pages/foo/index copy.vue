<template>
    {{ddd.children}}
</template>

<style>
</style>

<script lang="ts">
/**
 * script 内容将由脚本自动生成，请不要修改
 * 生成时间：2023-04-09 07:41:42
 */
import { createContext, useStates, useMethods } from '@vue-cook/core'
// states
import staterefNumber from './states/refNumber'
import staterefString from './states/refString'
// methods
import methodcount from './methods/count'
import methodhello from './methods/hello'
import ddd from "./base"
export default {
    components: {},
    setup: () => { 
        const statesConfig = {
            refNumber: { ...staterefNumber, name: "refNumber" },// TODO:这个地方的name也要去掉
            refString: { ...staterefString, name: "refString" }
        }
        const methodsConfig = {
            count: { ...methodcount, name: "count" },
            hello: { ...methodhello, name: "hello" }
        }
        const cookContext = createContext({
            states: statesConfig,
            methods: methodsConfig
        })
        const states = useStates(cookContext, statesConfig)
        const methods = useMethods(cookContext, methodsConfig)
        return {
            states,
            methods,
            ddd
        }
    }
}
</script>
