<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" style="height: 100%;">
    <Splitpanes class="cook-studio default-theme">
      <Pane class="left-pane" min-size="15" size="20">
        <left-pane></left-pane>
      </Pane>
      <Pane class="center-bottom-pane" min-size="15" size="60">
        <Splitpanes horizontal>
          <Pane class="center-pane" min-size="15">
            <CenterPane></CenterPane>
          </Pane>
          <Pane class="bottom-pane" min-size="15" size="20">
            bottom
            <!-- <panel-list :list=" state.layout.bottom"></panel-list> -->
          </Pane>
        </Splitpanes>

      </Pane>
      <Pane class="right-pane" min-size="15" size="20">
        right
        <!-- <panel-list :list="state.layout.right"></panel-list> -->
      </Pane>
    </Splitpanes>
  </n-config-provider>
</template>
<script setup lang="ts">
import LeftPane from "./components/left-pane.vue"
import CenterPane from "./components/center-pane.vue"
// import ICookEditorState from '@/types/ICookEditorState';
// import PanelList from "./PanelList.vue"
import { NConfigProvider, zhCN, dateZhCN } from "naive-ui"
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { provide, ref, reactive } from "vue"
import { createFsFromVolume, Volume } from 'memfs';
import type { IStudioState } from "./types"
import { createStudioState } from "./utils"

const studioState = createStudioState({
  './src/index.js': `
import React from 'react';
import {render} from 'react-dom';
import {App} from './components/app';

const el = document.createElement('div');
document.body.appendChild(el);
render(el, React.createElement(App, {}));
`,

  './README.md': `
# Hello World

This is some super cool project.
`,

  '.node_modules/EMPTY': '',
})

provide('studioState', studioState)

</script>
<style lang="less">
.cook-studio {
  height: 100%;
  display: flex;

  .n-layout {
    height: 100%;
  }

}
</style>