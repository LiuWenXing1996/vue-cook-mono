<template>
  <div>
    {{ states.buttenSize }}{{ states.buttenSize }}
    <el-button
      :size="states.buttenSize"
      :plain="false"
      @click="actions.toggleWrapperClassState"
    >
      <slot></slot>
      {{ states.buttenSize }}
      <template></template>
    </el-button>
  </div>
</template>
<script setup lang="ts">
import { useViewContext } from "@vue-cook/render";
import context from "./context";
import "./style.css";

const { states, actions } = useViewContext(context);
</script>
