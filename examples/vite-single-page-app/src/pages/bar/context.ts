import { defineContext } from "@vue-cook/core";

export default defineContext({
  states() {
    const { ctx } = this;
    return {
      buttenSize: "large",
      wrapperClassState: true,
    };
  },
  actions() {
    const { ctx } = this;
    return {
      toggleButtonSize: () => {
        console.log("toggleButtonSize");
        const btnSize = ctx.getState("buttenSize");
        if (btnSize === "large") {
          ctx.setState("buttenSize", "small");
        } else {
          ctx.setState("buttenSize", "large");
        }
      },
      toggleWrapperClassState: async () => {
        console.log("toggleWrapperClassState");
        const wrapperClassState = ctx.getState("wrapperClassState");
        ctx.setState("wrapperClassState", !wrapperClassState);
      },
    };
  },
});
