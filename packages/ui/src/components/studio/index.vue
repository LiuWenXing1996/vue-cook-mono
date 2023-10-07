<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" style="height: 100%;">
    <Splitpanes class="cook-studio default-theme">
      <Pane class="left-pane" min-size="15" size="20">
        <left-pane></left-pane>
      </Pane>
      <Pane class="center-bottom-pane" min-size="15" size="60">
        <Splitpanes horizontal>
          <Pane class="center-pane" min-size="15">
            <center-pane></center-pane>
          </Pane>
          <Pane class="bottom-pane" min-size="15" size="20">
            bottom
            <!-- <panel-list :list=" state.layout.bottom"></panel-list> -->
          </Pane>
        </Splitpanes>
      </Pane>
    </Splitpanes>
  </n-config-provider>
</template>
<script setup lang="ts">
import LeftPane from "./components/left-pane.vue"
import CenterPane from "./components/center-pane.vue"
import PagePlayer from "./components/page-player.vue"
// import ICookEditorState from '@/types/ICookEditorState';
// import PanelList from "./PanelList.vue"
import { NConfigProvider, zhCN, dateZhCN } from "naive-ui"
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { provide, ref, reactive, toRefs } from "vue"
import { createFsFromVolume, Volume } from 'memfs';
import type { IStudioState } from "./types"
import { createStudioState } from "./utils"
import TestA from "./components/TestA.vue"

const props = defineProps({
  state: {
    type: Object as () => IStudioState,
    required: true
  }
})

const { state } = toRefs(props)
provide('studioState', state.value)

</script>
<style lang="less">
.cook-studio {
  height: 100%;
  display: flex;

  .n-layout {
    height: 100%;
  }

  .splitpanes__pane {
    background-color: transparent !important;
  }

}
</style>