<template>
    <div>{{states.refNumber}}</div>
</template>

<style>
</style>

<script lang="ts">
/**
 * script 内容将由脚本自动生成，请不要修改
 * 生成时间：2023-04-07 05:59:45
 */
import { createContext, useStates, useMethods } from '@vue-cook/core'
// TODO:使用getgetCurrentInstance 来消除context？？？
// states
import staterefNumber from './states/refNumber'
import staterefString from './states/refString'
// methods
import methodcount from './methods/count'
import methodhello from './methods/hello'

export default {
    props:{
        a:String
    },
    components: {},
    setup: (props,cotext) => {
        const statesConfig = {
            refNumber: staterefNumber,
            refString: staterefString
        }
        const methodsConfig = {
            count: methodcount,
            hello: methodhello
        }
        const cookContext = createContext({
            states: statesConfig,
            methods: methodsConfig
        })
        const states = useStates(cookContext, statesConfig)
        const methods = useMethods(cookContext, methodsConfig)
        return {
            states,
            methods
        }
    }
}
</script>
