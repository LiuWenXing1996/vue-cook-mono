import * as vue from "vue";
import * as A from "@vue-cook/element-plus-materials/runtime";
import { defineAction, defineAsyncAction } from "@vue-cook/core";
import Context from "./context";

export const toggleButtonSize = defineAction(
  (ctx: Context, params: [string, number]) => {
    console.log("toggleButtonSize");
    console.log(vue);
    console.log(A);
    const btnSize = ctx.states.get("buttenSize");
    if (btnSize === "large") {
      ctx.setState("buttenSize", "small");
    } else {
      ctx.setState("buttenSize", "large");
    }
  }
);


export const toggleWrapperClassState = defineAction(
  (ctx, params: [string, number]) => {
    console.log("toggleWrapperClassState");
    const wrapperClassState = ctx.states.get("wrapperClassState");
    ctx.setState("wrapperClassState", !wrapperClassState);
  }
);

export const as = defineAsyncAction(async (ctx, params: [string, number]) => {
  return "sss";
});

// const aaa = {} as any;

// const a = alert(aaa, [1, 1]);
