<template>
    <n-config-provider :locale="zhCN" :date-locale="dateZhCN" style="height: 100%;">
        <div class="cook-studio">
            <Splitpanes>
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
        </div>

    </n-config-provider>
</template>
<script setup lang="ts">
import LeftPane from "./components/left-pane.vue"
import CenterPane from "./components/center-pane.vue"
import { NConfigProvider, zhCN, dateZhCN } from "naive-ui"
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { provide, toRefs } from "vue"
import type { IStudioState } from "./types"

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

    .splitpanes {
        .splitpanes__pane {
            background-color: transparent;
        }

        .splitpanes__splitter {
            background-color: rgb(239, 239, 245);
            position: relative;
        }

        .splitpanes__splitter:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            transition: opacity 0.4s;
            background-color: rgba(24, 160, 88, 0.2);
            opacity: 0;
            z-index: 1;
        }

        .splitpanes__splitter:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 1;
        }

        .splitpanes__splitter:hover:before {
            opacity: 1;
        }

        &.splitpanes--vertical>.splitpanes__splitter {
            &::before {
                left: -3px;
                right: -3px;
                height: 100%;
            }

            &::after {
                border-left: 1px solid rgb(239, 239, 245);
                border-right: 1px solid rgb(239, 239, 245);
                width: 3px;
                height: 30px;
                transform: translateX(-50%);
            }

        }

        &.splitpanes--horizontal>.splitpanes__splitter {
            &::before {
                top: -3px;
                bottom: -3px;
                width: 100%;
            }

            &::after {
                border-top: 1px solid rgb(239, 239, 245);
                border-bottom: 1px solid rgb(239, 239, 245);
                width: 30px;
                height: 3px;
                transform: translateY(-50%);
            }
        }
    }

}
</style>