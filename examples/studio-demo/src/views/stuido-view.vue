<script setup lang="ts">
import { Studio, createStudioState } from '@vue-cook/ui'
import '@vue-cook/ui/dist/style.css'
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

</script>

<template>
  <Studio :state="studioState" />
</template>
