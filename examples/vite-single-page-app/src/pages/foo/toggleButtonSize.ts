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
