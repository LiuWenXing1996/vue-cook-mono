import { defineRemotePlugin } from "@vue-cook/core";
import { createApp } from "vue";
import App from "./App.vue";

export default defineRemotePlugin({
  name: "remote-plugin-demo-a",
  run: (data) => {
    console.log("remote-plugin-demo-a run");
    const app = createApp(App);
    app.mount(data.config.mountedEl);
  },
});
