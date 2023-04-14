<template>
    {{ states.refNumber }}
</template>

<style>
.a{
    color: v-bind('states.refNumber');
}
</style>

<script lang="ts">
/**
 * script 内容将由脚本自动生成，请不要修改
 * 生成时间：2023-04-09 07:41:42
 */
import { createContext, useStates, useMethods } from '@vue-cook/core'
// states
// TODO：可以先实现功能
// 后续的webs端的源码编辑体验可以慢慢优化
// 首先保证的是：
// 本地的源码编辑体验
// 线上的低码和无码编辑体验
// 将所有的state收口在一个文件里面，其他类似
// 为了避免在copyState的时候，只有一行代码，也单独占了一个文件
// 感觉还是分文件好一些
// Thinking:多个文件似乎太分散了，如果导出的是一个class，分为私有属性和公开属性这些，会不会更合理？？？
// class

import {setBlockTracking as b} from "vue"

// methods
import methodcount from './methods/count'
import methodhello from './methods/hello'
import statesConfig from "./base"
export default {
    components: {},
    setup: () => {
        // const statesConfig = {
        //     refNumber: { ...staterefNumber, name: "refNumber" },// TODO:这个地方的name也要去掉
        //     refString: { ...staterefString, name: "refString" }
        // }
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
            methods
        }
    }
}
</script>
