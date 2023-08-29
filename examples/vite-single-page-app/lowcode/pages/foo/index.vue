<template>
  <div>{{ count }}</div>
  <h1>hisssfsfsdf</h1>
</template>
  
<script lang="ts">
import { defineComponent, ref } from 'vue'
const start: number = 1
export default defineComponent({
  setup() {
    return { count: ref(start) }
  },
})
</script>
  
<style scoped>
div {
  color: red;
}
</style>
  
<style scoped>
div {
  font-size: 12px;
}
</style>
  