
  <template>
      <div class="ref">ref:{{states.ref}}</div>
<div>raw:{{states.raw}}</div>
<button @click="methods.change">更改值</button>
  </template>

  <script setup lang="ts">
  import { ref, markRaw, watch, reactive} from "vue"
  
  
  const states = reactive({
        ref:ref({
  a: "aa",
  b: {
    c: "cccc",
    d: {
      e: "eeee"
    }
  }
}),
  raw:markRaw({
  a: "aa",
  b: {
    c: "cccc",
    d: {
      e: "eeee"
    }
  }
})
  })
  const methods = {
      change:() => {
  states.ref.b.c = "refaaaa"
  states.raw.a = "rawssss"
  states.raw.b.c = "rawssss"
  functions.a(states)
  console.log(states)
}
  }
  const watchers = {
  watchStatesRef:watch(states.ref,(newValue,oldValue)=>{
  console.log('watchStatesRef',newValue)
}),
watchStatesRaw:watch(states.raw,(newValue,oldValue)=>{
  console.log('watchStatesRaw',newValue)
})
    }
  </script>

  <style scoped >
      .ref{
  color:red
}
  </style>

  