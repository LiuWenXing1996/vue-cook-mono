<script setup lang="ts">
import context from "./context";
import { useViewContext } from "@vue-cook/render";
import "./style.css";

const { states, actions } = useViewContext(context);
</script>
<template>
  <div>
    {{ states.buttenSize }}{{ "buttenSize" }}
    <div
      :class="{
        wrapper: false,
        'wrapper-by-state': states.buttenSize,
      }"
    ></div>
    <el-button
      :size="states.buttenSize"
      :plain="false"
      @click="actions.toggleButtonSize"
      ><slot></slot>{{ states.buttenSize }}<template></template
    ></el-button>
  </div>
</template>
