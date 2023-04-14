"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// virtual:@vue-cook/core
var require_core = __commonJS({
  "virtual:@vue-cook/core"(exports, module2) {
    var { getLib } = __cook_sandbox_global_inject_method_202304090723_();
    var Lib0 = getLib("@vue-cook/core");
    module2.exports = Lib0;
  }
});

// lowcode/index.ts
var lowcode_exports = {};
__export(lowcode_exports, {
  default: () => lowcode_default
});
module.exports = __toCommonJS(lowcode_exports);

// unplugin-vue:/Users/luweixin/Desktop/code/vue-cook-all/vue-cook-monorepo/examples/lowcode-pages-demo/lowcode/pages/foo/index.vue?vue&type=script&lang.ts
var import_core3 = __toESM(require_core());

// lowcode/pages/foo/states/refNumber.ts
var import_core = __toESM(require_core());
var refNumber_default = (0, import_core.defineState)({
  name: "refNumber",
  type: "Ref",
  typeDefine: (0, import_core.Number)(),
  init: (ctx) => {
    return 30;
  }
});

// lowcode/pages/foo/states/refString.ts
var import_core2 = __toESM(require_core());
var refString_default = (0, import_core2.defineState)({
  name: "refString",
  type: "Ref",
  init: (ctx) => {
    return 1;
  }
});

// lowcode/pages/foo/methods/count.ts
var count_default = defineMethod({
  name: "count",
  init: (context) => {
    const num = useState(context, refNumber_default);
    return () => {
      if (num) {
        num.value = num.value + 1;
      }
    };
  }
});

// lowcode/pages/foo/methods/hello.ts
var hello_default = defineMethod({
  name: "hello",
  init: () => {
    return (msg) => {
      console.log(`bar component hello ${msg}`);
    };
  }
});

// unplugin-vue:/Users/luweixin/Desktop/code/vue-cook-all/vue-cook-monorepo/examples/lowcode-pages-demo/lowcode/pages/foo/index.vue?vue&type=script&lang.ts
var index_vue_vue_type_script_lang_default = {
  components: {},
  setup: () => {
    const statesConfig = {
      refNumber: __spreadProps(__spreadValues({}, refNumber_default), { name: "refNumber" }),
      refString: __spreadProps(__spreadValues({}, refString_default), { name: "refString" })
    };
    const methodsConfig = {
      count: __spreadProps(__spreadValues({}, count_default), { name: "count" }),
      hello: __spreadProps(__spreadValues({}, hello_default), { name: "hello" })
    };
    const cookContext = (0, import_core3.createContext)({
      states: statesConfig,
      methods: methodsConfig
    });
    const states = (0, import_core3.useStates)(cookContext, statesConfig);
    const methods = (0, import_core3.useMethods)(cookContext, methodsConfig);
    return {
      states,
      methods
    };
  }
};

// unplugin-vue:/plugin-vue/export-helper
var export_helper_default = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

// lowcode/pages/foo/index.vue
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return null;
}
var foo_default = /* @__PURE__ */ export_helper_default(index_vue_vue_type_script_lang_default, [["render", _sfc_render], ["__file", "/Users/luweixin/Desktop/code/vue-cook-all/vue-cook-monorepo/examples/lowcode-pages-demo/lowcode/pages/foo/index.vue"]]);

// lowcode/index.ts
var lowcode_default = { PageFoo: foo_default };
