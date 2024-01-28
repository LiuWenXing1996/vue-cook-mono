<template>
    <div>
        {{ states.buttenSize }}{{ states.buttenSize }}
        <el-button :size="states.buttenSize" :plain="false" @click="actions.toggleWrapperClassState">
            <slot></slot>
            {{ states.buttenSize }}
            <template></template>
        </el-button>
    </div>
</template>
<script setup lang="ts">
import { useViewContext } from "@vue-cook/render";
import * as actions from "./actions";

import "./style.css";
actions.as
const viewContext = useViewContext({
    states: {
        buttenSize: "large",
        wrapperClassState: true,
    },
    actions: actions,
});
const { states } = viewContext;
</script>
  