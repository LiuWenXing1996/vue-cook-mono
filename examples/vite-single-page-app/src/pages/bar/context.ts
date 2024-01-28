import { defineViewContext } from "@vue-cook/core";

// TODO:实现转码后的context
export default defineViewContext({
  setup() {
    const { ctx } = this;
    return {
      states: {
        buttenSize: "large",
        wrapperClassState: true,
      },
      actions: {
        toggleButtonSize: () => {
          console.log("toggleButtonSize");
          const btnSize = ctx.states.get("buttenSize");
          if (btnSize === "large") {
            ctx.setState("buttenSize", "small");
          } else {
            ctx.setState("buttenSize", "large");
          }
        },
        toggleWrapperClassState: async () => {
          console.log("toggleWrapperClassState");
          const wrapperClassState = ctx.states.get("wrapperClassState");
          ctx.setState("wrapperClassState", !wrapperClassState);
        },
      },
    };
  },
});
