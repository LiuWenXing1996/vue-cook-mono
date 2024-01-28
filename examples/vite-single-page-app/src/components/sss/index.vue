
<template>
  <div>{states.buttenSize}{states.buttenSize}<el-button size={states.buttenSize}>
      <slot></slot>{states.buttenSize}<template></template>
    </el-button></div>
</template>
<script setup lang="ts">
import { useViewContext } from "@vue-cook/render";
import * as actions from "./actions.ts";

import "./style.css";


const viewContext = useViewContext({
  states: {
    buttenSize: "large",
    wrapperClassState: true
  }
})
const { states } = viewContext

</script>
  