<template>
    <splitpanes class="cook-split-panes-theme">
        <slot></slot>
    </splitpanes>
</template>
<script setup lang="ts">
import { Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
</script>
<style lang="less" >
.cook-split-panes-theme {
    &.splitpanes {
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