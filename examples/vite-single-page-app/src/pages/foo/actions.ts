import * as vue from "vue";
import * as A from "@vue-cook/element-plus-materials/runtime";
import { defineJsFunction } from "@vue-cook/core";

export const toggleButtonSize = defineJsFunction(
  (ctx, params: [string, number]) => {
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

export const toggleWrapperClassState = defineJsFunction(
  (ctx, params: [string, number]) => {
    console.log("toggleWrapperClassState");
    const wrapperClassState = ctx.states.get("wrapperClassState");
    ctx.setState("wrapperClassState", !wrapperClassState);
  }
);

// const aaa = {} as any;

// const a = alert(aaa, [1, 1]);
