import * as vue from "vue";
import * as A from "@vue-cook/element-plus-materials/runtime";
import { defineJsFunction } from "@vue-cook/core";

export const alert = defineJsFunction((ctx, params: [string, number]) => {
  console.log("alert action");
  console.log(vue);
  console.log(A);
  const btnSize = ctx.states.get("msg");
  if (btnSize === "large") {
    ctx.setState("msg", "small");
  } else {
    ctx.setState("msg", "large");
  }
});

// const aaa = {} as any;

// const a = alert(aaa, [1, 1]);
