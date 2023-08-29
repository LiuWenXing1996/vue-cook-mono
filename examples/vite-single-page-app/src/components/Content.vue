<script setup lang="ts">
import { runContainer } from '@vue-cook/core'

const res = await runContainer({
    assets: './dist/schema/index.js'
})
console.log("res.a",res.aaaaa)
console.log(".....")
</script>

<template>
    <div>sss</div>
</template>

<style scoped></style>
