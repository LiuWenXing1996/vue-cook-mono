<template>
</template>

<style>
</style>

<script lang="ts">
/**
 * script 内容将由脚本自动生成，请不要修改
 * 生成时间：2023-04-09 07:41:42
 */
import { createContext, useStates, useMethods } from '@vue-cook/core'





export default {
    components: {},
    setup: () => {
        const statesConfig = {
          
        }
        const methodsConfig = {
          
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
