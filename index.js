import { reactive, computed, defineComponent, inject, ref, openBlock, createElementBlock, createElementVNode, createVNode, unref, withCtx, createTextVNode, h, Fragment, isVNode, toRefs, toDisplayString, renderList, pushScopeId, popScopeId, useCssVars, watch, nextTick, createBlock, createCommentVNode, onUnmounted, onMounted, renderSlot, normalizeClass, getCurrentInstance, onUpdated, resolveComponent, resolveDynamicComponent, mergeProps, toHandlers, createSlots, provide, markRaw, KeepAlive } from "vue";
import { NInput, NIcon, NPopover, NTree, NTag, NSpace, NInputNumber, NEmpty, NScrollbar, NForm, NDivider, NFormItem, NDataTable, NSelect, NTabs, NTabPane, NConfigProvider, zhCN, dateZhCN, NLayout, NLayoutSider, NMenu } from "naive-ui";
import { Search, AddCircleOutline, ArrowUndoOutline, ArrowRedoOutline, LocateOutline, TrashOutline, InformationCircle, LocationOutline, Folder, SearchOutline, DocumentsOutline } from "@vicons/ionicons5";
import { v4 } from "uuid";
import { useRefHistory } from "@vueuse/core";
import Ruler from "@scena/ruler";
import { drag } from "@daybrush/drag";
import { Edit32Regular, ArrowUp48Regular, ArrowDown48Regular } from "@vicons/fluent";
import { SelectOutlined } from "@vicons/antd";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { Volume, createFsFromVolume } from "memfs";
import { path } from "@vue-cook/core";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import { uniq } from "lodash-es";
function makeDefaultComponentConfig(maker2) {
  const uid = v4();
  let config = {
    uid,
    name: maker2.name,
    makerType: "component",
    makerName: maker2.name,
    makerPkg: maker2.pkg
  };
  return config;
}
const stateMap$4 = reactive(/* @__PURE__ */ new Map());
function usePageEditingUidList(cookEditorState) {
  const list = computed(() => {
    const _list = stateMap$4.get(cookEditorState) || [];
    return [..._list];
  });
  const add = (pageUid) => {
    let _list = stateMap$4.get(cookEditorState);
    if (!_list) {
      _list = [];
      stateMap$4.set(cookEditorState, _list);
    }
    _list.push(pageUid);
  };
  const remove2 = (pageUid) => {
    if (pageUid) {
      const list2 = stateMap$4.get(cookEditorState);
      if (list2) {
        const _list = list2.filter((d) => d !== pageUid);
        stateMap$4.set(cookEditorState, _list);
      }
    }
  };
  return {
    list,
    add,
    remove: remove2
  };
}
const _hoisted_1$l = { class: "page-component-tree" };
const _hoisted_2$f = { class: "actions" };
const _sfc_main$I = /* @__PURE__ */ defineComponent({
  __name: "PageComponentTree",
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    const pageList = computed(() => {
      return cookEditorState.pages;
    });
    const pattern = ref("");
    const renderLabel = ({ option }) => {
      return h(
        "div",
        {
          onClick: () => {
            if (option.type === "page") {
              const uid = option.key;
              usePageEditingUidList(cookEditorState).add(uid);
            }
            if (option.type === "component") {
              const uid = option.key;
              const pageUid = option.pageUid;
              useComponentSelected(cookEditorState).set({
                pageUid,
                componentUid: uid
              });
            }
          },
          onMousemove: () => {
            if (option.type === "component") {
              const uid = option.key;
              const pageUid = option.pageUid;
              if (uid && pageUid) {
                useComponentFocused(cookEditorState).set({
                  pageUid,
                  componentUid: uid
                });
              }
            }
          },
          onMouseleave: () => {
            useComponentFocused(cookEditorState).set();
          }
        },
        option.label
      );
    };
    function componentToTreeNode(config, pageUid, parentSlotName) {
      const treeNode = {
        key: config.uid,
        label: config.name,
        type: "component",
        pageUid,
        prefix: () => {
          return h(
            NTag,
            {
              size: "small",
              type: "success",
              round: true
            },
            {
              default: () => parentSlotName || "root"
            }
          );
        }
      };
      if (config == null ? void 0 : config.slots) {
        const treeNodeChildren = [];
        const slots = config == null ? void 0 : config.slots;
        for (const key in slots) {
          if (Object.prototype.hasOwnProperty.call(slots, key)) {
            const componentConfigs = slots[key];
            componentConfigs.forEach((cc) => {
              const treeNodeChild = componentToTreeNode(cc, pageUid, key);
              treeNodeChildren.push(treeNodeChild);
            });
          }
        }
        treeNode.children = treeNodeChildren;
      }
      return treeNode;
    }
    function pageToTreeNode(page) {
      const componentTreeNode = componentToTreeNode(page.component, page.uid);
      const pageTreeNode = {
        key: page.uid,
        label: page.name,
        children: [componentTreeNode],
        type: "page",
        prefix: () => {
          return h(
            NTag,
            {
              size: "small",
              type: "success",
              round: true
            },
            {
              default: () => "page"
            }
          );
        }
      };
      return pageTreeNode;
    }
    const treeData = computed(() => {
      return pageList.value.map((page) => {
        return pageToTreeNode(page);
      });
    });
    const addPage = () => {
      const uid = v4();
      const page = {
        name: "新增页面",
        uid,
        path: `/${uid}`,
        component: makeDefaultComponentConfig(RootAppMaker)
      };
      pageList.value.push(page);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$l, [
        createElementVNode("div", _hoisted_2$f, [
          createVNode(unref(NInput), {
            value: pattern.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => pattern.value = $event),
            placeholder: "搜索",
            size: "small",
            round: "",
            clearable: ""
          }, {
            prefix: withCtx(() => [
              createVNode(unref(NIcon), null, {
                default: withCtx(() => [
                  createVNode(unref(Search))
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["value"]),
          createVNode(unref(NPopover), { trigger: "hover" }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), { onClick: addPage }, {
                default: withCtx(() => [
                  createVNode(unref(AddCircleOutline))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 新增页面 ")
            ]),
            _: 1
          })
        ]),
        createVNode(unref(NTree), {
          data: treeData.value,
          "block-line": "",
          pattern: pattern.value,
          selectable: false,
          "render-label": renderLabel
        }, null, 8, ["data", "pattern"])
      ]);
    };
  }
});
const PageComponentTree_vue_vue_type_style_index_0_scoped_374c123d_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const PageComponentTree = /* @__PURE__ */ _export_sfc(_sfc_main$I, [["__scopeId", "data-v-374c123d"]]);
function definePanelMaker(maker2) {
  const _maker = {
    type: "panel",
    ...maker2
  };
  return _maker;
}
const name = "@vue-cook/ui";
const maker$2 = definePanelMaker({
  name: "页面组件树",
  pkg: name,
  defaultSplitLayoutPaneName: "left",
  make: () => PageComponentTree
});
const PageSizeIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjM0MjcyOTU4MjY4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQyNDQiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj48L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNNzA0IDk3LjQ3Mkw4OTQuOTc2IDI4OEg4OTZ2MTc1LjI5NmwtMzItMzEuNjQ4VjMyMGgtMTkyVjEyOEgxNjB2NzY4aDIyNC4zMnYzMkgxMjhWOTZoNTc2djEuNDcyeiBtMCA0NS4yMTZWMjg4aDE0NS42NjRMNzA0IDE0Mi42ODh6TTc1MC42NTYgODk2SDg2NHYtMTE0LjU2bDMyLTMyLjM1MlY5MjhoLTE3Ni45NmwzMS42MTYtMzJ6IG04MS41MzYtMjE2Ljk5MmwtMjQuODMyLTIzLjc0NC0yMDUuNjMyIDIwNS42MzIgMjkuNDcyIDI4LjQ4IDIwMC45Ni0yMTAuMzY4eiBtMjIuMDgtMjMuMTM2bDQ2Ljc4NC00OC45Ni05MS4wMDgtOTEuMDQtNDkuODg4IDQ5Ljg4OCA5NC4xMTIgOTAuMTEyeiBtLTExNi43MzYtNjcuNDg4bC0yMDUuMzEyIDIwNS4zMTIgNDYuNDk2IDQ0Ljk2IDIwNS41MzYtMjA1LjUzNi00Ni43Mi00NC43MzZ6IG0tMjI3LjkzNiAyMjcuOTY4bC0yOS42IDI5LjU2OFY5MjhoMTE0LjMwNGwxNC44MTYtMTUuNDg4LTk5LjUyLTk2LjE2eiBtMzAwLjQ0OC0zNDUuNzI4bDEzNS43NDQgMTM1Ljc3Nkw2MDggOTYwaC0xNjB2LTEyNy4zNmwzNjIuMDQ4LTM2Mi4wMTZ6TTQzMS4xMDQgODAwbC0zMi4xMjggMzJIMjI0VjE5Mmg0MTZ2MzJIMjU2djU3NmgxNzUuMTA0ek03NjggNDY0LjU3NlYzNTJoMzJ2ODAuNzM2bC0zMiAzMS44NHoiIHAtaWQ9IjQyNDUiPjwvcGF0aD48L3N2Zz4=";
const VueCookPlayerExportDataTag = "__VUE_COOK_PLAYER_EXPORT_DATA__";
const VueCookEditorExportDataPreTag = "__VUE_COOK_EDITOR_EXPORT_PAGE_PRE__";
const VueCookLogicMakerDraggerTag = "vue-cook-logic-maker-dragger-tag";
const VueCookComponentMakerDraggerTag = "vue-cook-component-maker-dragger-tag";
const pkgName = name;
function getCookEditorExportDataUniqTag(uid) {
  return `${VueCookEditorExportDataPreTag}-${uid}`;
}
function exportCookEditorData(state, pageUid) {
  const data = {
    getPage: () => {
      const page = state.pages.find((e) => e.uid === pageUid);
      if (page) {
        const jsonString = JSON.stringify(page);
        return JSON.parse(jsonString);
      }
    },
    setPage: (page) => {
      const index = state.pages.findIndex((e) => e.uid === page.uid);
      if (index > -1) {
        const jsonString = JSON.stringify(page);
        const oldJsonString = JSON.stringify(state.pages[index]);
        if (jsonString !== oldJsonString) {
          const _page = JSON.parse(jsonString);
          state.pages.splice(index, 1, _page);
        }
      }
    }
  };
  window[getCookEditorExportDataUniqTag(pageUid)] = data;
}
function isFragment(instance) {
  return instance.subTree.type === Fragment;
}
function createEmptyRect() {
  const rect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    get width() {
      return rect.right - rect.left;
    },
    get height() {
      return rect.bottom - rect.top;
    }
  };
  return rect;
}
function getComponentRect(instance) {
  let rect = createEmptyRect();
  if (isFragment(instance)) {
    rect = getFragmentRect(instance.subTree);
  } else {
    const vNode = instance.subTree;
    rect = getVNodeRect(vNode);
  }
  return rect;
}
function getVNodeRect(vnode) {
  let rect = createEmptyRect();
  if (vnode.type === Fragment) {
    rect = getFragmentRect(vnode);
  } else if (vnode.component) {
    rect = getComponentRect(vnode.component);
  } else if (vnode.el) {
    const el = vnode.el;
    if (el.nodeType === 1 || el.getBoundingClientRect) {
      rect = el.getBoundingClientRect();
    } else if (el.nodeType === 3 && el.data.trim()) {
      rect = getTextRect(el);
    }
  }
  return rect;
}
function getVNodeArrayRect(vNodeArray) {
  let rect = createEmptyRect();
  for (let i = 0, l = vNodeArray.length; i < l; i++) {
    const childVnode = vNodeArray[i];
    if (isVNode(childVnode)) {
      const childRect = getVNodeRect(childVnode);
      rect = mergeRects(rect, childRect);
    } else if (Array.isArray(childVnode)) {
      const childRect = getVNodeArrayRect(childVnode);
      rect = mergeRects(rect, childRect);
    }
  }
  return rect;
}
let range;
function getTextRect(node) {
  if (!range)
    range = document.createRange();
  range.selectNode(node);
  return range.getBoundingClientRect();
}
function getFragmentRect(vNode) {
  let rect = createEmptyRect();
  if (!vNode.children)
    return rect;
  if (Array.isArray(vNode.children)) {
    rect = getVNodeArrayRect(vNode.children);
  }
  return rect;
}
function isEmptyRect(r) {
  return r.top === 0 && r.bottom === 0 && r.left === 0 && r.right === 0;
}
function mergeRects(a, b) {
  if (isEmptyRect(b)) {
    return a;
  }
  if (isEmptyRect(a)) {
    return b;
  }
  let rect = createEmptyRect();
  rect.top = Math.min(a.top, b.top);
  rect.bottom = Math.max(a.bottom, b.bottom);
  rect.left = Math.min(a.left, b.left);
  rect.right = Math.max(a.right, b.right);
  return rect;
}
function getCookPlayerExportDataFromWindow(window2) {
  let exportData2;
  if (window2) {
    const _exportData = window2[VueCookPlayerExportDataTag];
    exportData2 = _exportData;
  }
  return exportData2;
}
const findComponentConfig = (parent, componentUid) => {
  let configFound;
  if (parent.uid === componentUid) {
    configFound = parent;
  } else {
    const slots = parent == null ? void 0 : parent.slots;
    if (slots) {
      const keys = Object.keys(slots);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const configList = slots[key];
        for (let j = 0; j < configList.length; j++) {
          const config = configList[j];
          configFound = findComponentConfig(config, componentUid);
          if (configFound) {
            return configFound;
          }
        }
        if (configFound) {
          break;
        }
      }
    }
  }
  return configFound;
};
const stateMap$3 = reactive(/* @__PURE__ */ new Map());
function useComponentSelected(cookEditorState) {
  const config = computed(() => {
    const { pageUid, componentUid } = stateMap$3.get(cookEditorState) || {};
    const page = cookEditorState.pages.find((e) => e.uid === pageUid);
    if (page && componentUid) {
      const component = findComponentConfig(page.component, componentUid);
      if (component) {
        return {
          page,
          component
        };
      }
    }
  });
  const get = () => {
    return config;
  };
  const set = (componetSelected) => {
    stateMap$3.set(cookEditorState, componetSelected);
  };
  return {
    get,
    set
  };
}
const handleClick = (cookEditorState, overlay, event) => {
  var _a, _b;
  event.stopPropagation();
  if (((_a = useComponentSelected(cookEditorState).get().value) == null ? void 0 : _a.page.uid) === overlay.pageUid && ((_b = useComponentSelected(cookEditorState).get().value) == null ? void 0 : _b.component.uid) === overlay.configUid) {
    useComponentSelected(cookEditorState).set();
  } else {
    useComponentSelected(cookEditorState).set({
      pageUid: overlay.pageUid,
      componentUid: overlay.configUid
    });
  }
};
function useComponentMakerList(cookState) {
  return computed(() => {
    const allList = cookState.makerList;
    return allList.filter((e) => e.type === "component");
  });
}
function useComponentMaker(cookState, name2, pkg) {
  return computed(() => {
    const makerList = useComponentMakerList(cookState);
    const maker2 = makerList.value.find((e) => e.name === name2 && e.pkg === pkg);
    return maker2;
  });
}
const _withScopeId$9 = (n) => (pushScopeId("data-v-919e6eb8"), n = n(), popScopeId(), n);
const _hoisted_1$k = {
  key: 0,
  class: "component-overlay-tips"
};
const _hoisted_2$e = { class: "overlay-tips-item" };
const _hoisted_3$b = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createElementVNode("div", { class: "overlay-tips-item-label" }, "名称", -1));
const _hoisted_4$9 = { class: "overlay-tips-item-content" };
const _hoisted_5$7 = { class: "overlay-tips-item" };
const _hoisted_6$6 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createElementVNode("div", { class: "overlay-tips-item-label" }, "唯一ID", -1));
const _hoisted_7$4 = { class: "overlay-tips-item-content" };
const _hoisted_8$4 = { class: "overlay-tips-item" };
const _hoisted_9$4 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createElementVNode("div", { class: "overlay-tips-item-label" }, "宽度", -1));
const _hoisted_10$3 = { class: "overlay-tips-item-content" };
const _hoisted_11$3 = { class: "overlay-tips-item" };
const _hoisted_12$3 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createElementVNode("div", { class: "overlay-tips-item-label" }, "高度", -1));
const _hoisted_13$2 = { class: "overlay-tips-item-content" };
const _hoisted_14$1 = { class: "overlay-tips-item" };
const _hoisted_15$1 = /* @__PURE__ */ _withScopeId$9(() => /* @__PURE__ */ createElementVNode("div", { class: "overlay-tips-item-label" }, "插槽", -1));
const _hoisted_16$1 = { class: "overlay-tips-item-content" };
const _hoisted_17$1 = { class: "round-slot-tag" };
const _sfc_main$H = /* @__PURE__ */ defineComponent({
  __name: "ComponentOverlayTips",
  props: {
    overlay: {
      type: Object,
      required: true
    },
    size: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { overlay, size } = toRefs(props);
    const toPx = (n) => `${n}px`;
    const width = computed(() => toPx(overlay.value.rect.width * size.value.scale / 100));
    const height = computed(() => toPx(overlay.value.rect.height * size.value.scale / 100));
    const componentConfig = computed(() => {
      const page = cookEditorState.pages.find((e) => e.uid === overlay.value.pageUid);
      if (page) {
        return findComponentConfig(page.component, overlay.value.configUid);
      }
    });
    const maker2 = computed(() => {
      var _a, _b;
      return useComponentMaker(cookEditorState, (_a = componentConfig.value) == null ? void 0 : _a.makerName, (_b = componentConfig.value) == null ? void 0 : _b.makerPkg).value;
    });
    const slotOptions = computed(() => {
      var _a, _b;
      if (componentConfig.value) {
        const _slotOptions = (_b = (_a = maker2.value) == null ? void 0 : _a.makeSlotOptions) == null ? void 0 : _b.call(_a, cookEditorState, componentConfig.value);
        if (_slotOptions && _slotOptions.length > 0) {
          return _slotOptions;
        }
      }
      return [];
    });
    return (_ctx, _cache) => {
      return componentConfig.value ? (openBlock(), createElementBlock("div", _hoisted_1$k, [
        createElementVNode("div", _hoisted_2$e, [
          _hoisted_3$b,
          createElementVNode("div", _hoisted_4$9, toDisplayString(componentConfig.value.name), 1)
        ]),
        createElementVNode("div", _hoisted_5$7, [
          _hoisted_6$6,
          createElementVNode("div", _hoisted_7$4, toDisplayString(componentConfig.value.uid), 1)
        ]),
        createElementVNode("div", _hoisted_8$4, [
          _hoisted_9$4,
          createElementVNode("div", _hoisted_10$3, toDisplayString(width.value), 1)
        ]),
        createElementVNode("div", _hoisted_11$3, [
          _hoisted_12$3,
          createElementVNode("div", _hoisted_13$2, toDisplayString(height.value), 1)
        ]),
        createElementVNode("div", _hoisted_14$1, [
          _hoisted_15$1,
          createElementVNode("div", _hoisted_16$1, [
            slotOptions.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(slotOptions.value, (slotName) => {
              return openBlock(), createElementBlock("div", _hoisted_17$1, toDisplayString(slotName), 1);
            }), 256)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createTextVNode("无")
            ], 64))
          ])
        ])
      ])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        createTextVNode("没有找到" + toDisplayString(unref(overlay).configUid) + "的组件信息", 1)
      ], 64));
    };
  }
});
const ComponentOverlayTips_vue_vue_type_style_index_0_scoped_919e6eb8_lang = "";
const ComponentOverlayTips = /* @__PURE__ */ _export_sfc(_sfc_main$H, [["__scopeId", "data-v-919e6eb8"]]);
const _sfc_main$G = /* @__PURE__ */ defineComponent({
  __name: "ComponentOverlay",
  props: {
    overlay: {
      type: Object,
      required: true
    },
    size: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    useCssVars((_ctx) => ({
      "2a263154": width.value,
      "00d0ff59": height.value,
      "0dd61a8e": left.value,
      "29115063": top.value
    }));
    const cookEditorState = inject("cookEditorState");
    const { overlay, size } = toRefs(props);
    const toPx = (n) => `${n}px`;
    const width = computed(() => toPx(overlay.value.rect.width * size.value.scale / 100));
    const height = computed(() => toPx(overlay.value.rect.height * size.value.scale / 100));
    const left = computed(() => toPx(overlay.value.rect.left * size.value.scale / 100));
    const top = computed(() => toPx(overlay.value.rect.top * size.value.scale / 100));
    const componentConfig = computed(() => {
      const page = cookEditorState.pages.find((e) => e.uid === overlay.value.pageUid);
      if (page) {
        return findComponentConfig(page.component, overlay.value.configUid);
      }
    });
    watch(overlay, (newValue, oldValue) => {
      if (newValue.configUid !== oldValue.configUid) {
        showPopover.value = false;
        nextTick(() => {
          showPopover.value = true;
        });
      }
    });
    const showPopover = ref(true);
    return (_ctx, _cache) => {
      return componentConfig.value ? (openBlock(), createBlock(unref(NPopover), {
        key: 0,
        trigger: "manual",
        show: showPopover.value,
        placement: "left"
      }, {
        trigger: withCtx(() => [
          createElementVNode("div", {
            class: "component-overlay",
            onClick: _cache[0] || (_cache[0] = ($event) => unref(handleClick)(unref(cookEditorState), unref(overlay), $event))
          })
        ]),
        default: withCtx(() => [
          createVNode(ComponentOverlayTips, {
            size: unref(size),
            overlay: unref(overlay)
          }, null, 8, ["size", "overlay"])
        ]),
        _: 1
      }, 8, ["show"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        createTextVNode("id为" + toDisplayString(unref(overlay).configUid) + "的组件没有找到", 1)
      ], 64));
    };
  }
});
const ComponentOverlay_vue_vue_type_style_index_0_scoped_8aad1acc_lang = "";
const ComponentOverlay = /* @__PURE__ */ _export_sfc(_sfc_main$G, [["__scopeId", "data-v-8aad1acc"]]);
const stateMap$2 = reactive(/* @__PURE__ */ new Map());
function useComponentFocused(cookEditorState) {
  const config = computed(() => {
    const { pageUid, componentUid } = stateMap$2.get(cookEditorState) || {};
    const page = cookEditorState.pages.find((e) => e.uid === pageUid);
    if (page && componentUid) {
      const component = findComponentConfig(page.component, componentUid);
      if (component) {
        return {
          page,
          component
        };
      }
    }
  });
  const get = () => {
    return config;
  };
  const set = (componetFoused) => {
    stateMap$2.set(cookEditorState, componetFoused);
  };
  return {
    get,
    set
  };
}
const _sfc_main$F = /* @__PURE__ */ defineComponent({
  __name: "ComponentPicker",
  props: {
    iframeRef: {
      type: Object
    },
    enablePicker: {
      type: Boolean,
      required: true
    },
    size: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    useCssVars((_ctx) => ({
      "223d2312": width.value,
      "590532d4": height.value
    }));
    const cookEditorState = inject("cookEditorState");
    const { iframeRef, enablePicker, size } = toRefs(props);
    const componentFocused = useComponentFocused(cookEditorState).get();
    watch(componentFocused, () => {
      var _a, _b;
      if (componentFocused.value) {
        const rect = (_a = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _a.getBoundingClientRect();
        if (rect) {
          const exportData2 = getCookPlayerExportDataFromWindow(((_b = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _b.contentWindow) || void 0);
          if (exportData2 && rect) {
            const componentOverlay = exportData2.getComponetnOverlayFromComponentConfigUid(componentFocused.value.component.uid);
            overlay.value = componentOverlay;
          }
        }
      } else {
        overlay.value = void 0;
      }
    });
    const handleMouseMove = (e) => {
      var _a, _b, _c, _d;
      if (enablePicker.value) {
        const rect = (_a = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _a.getBoundingClientRect();
        if (rect) {
          const el = (_c = (_b = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _b.contentWindow) == null ? void 0 : _c.document.elementFromPoint((e.x - rect.x) / size.value.scale * 100, (e.y - rect.y) / size.value.scale * 100);
          const exportData2 = getCookPlayerExportDataFromWindow(((_d = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _d.contentWindow) || void 0);
          if (exportData2 && rect && el) {
            const componentOverlay = exportData2.getComponetnOverlayFromElement(el);
            overlay.value = componentOverlay;
          }
        }
      }
    };
    const handleMouseLeave = () => {
      overlay.value = void 0;
    };
    const handleDragOver2 = (e) => {
      var _a, _b, _c, _d;
      const rect = (_a = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _a.getBoundingClientRect();
      if (rect) {
        const el = (_c = (_b = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _b.contentWindow) == null ? void 0 : _c.document.elementFromPoint((e.x - rect.x) / size.value.scale * 100, (e.y - rect.y) / size.value.scale * 100);
        const exportData2 = getCookPlayerExportDataFromWindow(((_d = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _d.contentWindow) || void 0);
        if (exportData2 && rect && el) {
          const componentOverlay = exportData2.getComponetnOverlayFromElement(el);
          overlay.value = componentOverlay;
        }
      }
    };
    const overlay = ref();
    const width = computed(() => {
      return enablePicker.value ? "100%" : 0;
    });
    const height = computed(() => {
      return enablePicker.value ? "100%" : 0;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "component-picker",
        onMousemove: _cache[0] || (_cache[0] = ($event) => handleMouseMove($event)),
        onDragover: _cache[1] || (_cache[1] = ($event) => handleDragOver2($event)),
        onMouseleave: handleMouseLeave
      }, [
        overlay.value ? (openBlock(), createBlock(ComponentOverlay, {
          key: 0,
          overlay: overlay.value,
          size: unref(size)
        }, null, 8, ["overlay", "size"])) : createCommentVNode("", true)
      ], 32);
    };
  }
});
const ComponentPicker_vue_vue_type_style_index_0_scoped_d95258ae_lang = "";
const ComponentPicker = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["__scopeId", "data-v-d95258ae"]]);
const _hoisted_1$j = { class: "page-cook-content" };
const _hoisted_2$d = ["src"];
const _sfc_main$E = /* @__PURE__ */ defineComponent({
  __name: "PageCookContent",
  props: {
    pageEditing: {
      type: Object,
      required: true
    },
    enablePicker: {
      type: Boolean,
      required: true
    },
    size: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    useCssVars((_ctx) => ({
      "e32cc154": widthPx.value,
      "5cd149a7": heightPx.value,
      "52a2e612": iframeWidthPx.value,
      "1fc0da6b": iframeHeightPx.value,
      "5484c2e3": scaleString.value
    }));
    const cookEditorState = inject("cookEditorState");
    const { pageEditing, size } = toRefs(props);
    const iframeRef = ref();
    const path2 = ref(`${location.href}?preview=${pageEditing.value.uid}`);
    const toPx = (n) => `${n}px`;
    const widthPx = computed(() => toPx(size.value.width * size.value.scale / 100));
    const heightPx = computed(() => toPx(size.value.height * size.value.scale / 100));
    const iframeWidthPx = computed(() => toPx(size.value.width));
    const iframeHeightPx = computed(() => toPx(size.value.height));
    const scaleString = computed(() => {
      return `scale(${size.value.scale / 100})`;
    });
    exportCookEditorData(cookEditorState, pageEditing.value.uid);
    watch(pageEditing, () => {
      var _a;
      const exportData2 = getCookPlayerExportDataFromWindow(((_a = iframeRef == null ? void 0 : iframeRef.value) == null ? void 0 : _a.contentWindow) || void 0);
      if (exportData2) {
        exportData2.setPage(pageEditing.value);
      }
    }, {
      deep: true
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$j, [
        createElementVNode("iframe", {
          src: path2.value,
          ref_key: "iframeRef",
          ref: iframeRef
        }, null, 8, _hoisted_2$d),
        createVNode(ComponentPicker, {
          "iframe-ref": iframeRef.value,
          "enable-picker": __props.enablePicker,
          size: unref(size)
        }, null, 8, ["iframe-ref", "enable-picker", "size"])
      ]);
    };
  }
});
const PageCookContent_vue_vue_type_style_index_0_scoped_b9648a59_lang = "";
const PageCookContent = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["__scopeId", "data-v-b9648a59"]]);
const stateMap$1 = reactive(/* @__PURE__ */ new Map());
function useComponentPickerEnable(cookEditorState) {
  const enable = computed(() => {
    const pickerEnable = stateMap$1.get(cookEditorState);
    return Boolean(pickerEnable);
  });
  const get = () => {
    return enable;
  };
  const set = (componentPickerEnable) => {
    stateMap$1.set(cookEditorState, componentPickerEnable);
  };
  const toggle = () => {
    set(!enable.value);
  };
  return {
    get,
    set,
    toggle
  };
}
function createRenderLoop(render) {
  let frameId;
  const f = () => {
    render();
    frameId = requestAnimationFrame(f);
  };
  const stop = () => {
    cancelAnimationFrame(frameId);
  };
  frameId = requestAnimationFrame(f);
  return stop;
}
function useRulerDivWidth(rulerDiv) {
  const width = ref(0);
  const stopFunc = createRenderLoop(() => {
    if (rulerDiv.value) {
      width.value = rulerDiv.value.clientWidth;
    }
  });
  onUnmounted(() => {
    stopFunc();
  });
  return width;
}
function getRulerUnit(scale) {
  const s1 = Number((1 / scale * 50).toFixed());
  const s2 = Number((s1 / 5).toFixed()) * 5;
  return s2;
}
const _sfc_main$D = /* @__PURE__ */ defineComponent({
  __name: "RulerHorizontal",
  props: {
    scale: {
      type: Number,
      required: true
    },
    scroll: {
      type: Number,
      required: true
    }
  },
  emits: ["update:scroll"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const { scale, scroll } = toRefs(props);
    const rulerDiv = ref();
    const width = useRulerDivWidth(rulerDiv);
    let ruler = null;
    let dragger = null;
    watch(scroll, () => {
      ruler == null ? void 0 : ruler.scroll(scroll.value);
    });
    watch(width, () => {
      ruler == null ? void 0 : ruler.resize();
    });
    watch(scale, () => {
      if (ruler) {
        ruler.zoom = scale.value / 100;
        ruler.unit = getRulerUnit(scale.value / 100);
      }
    });
    onMounted(() => {
      if (rulerDiv.value) {
        if (!ruler) {
          ruler = new Ruler(rulerDiv.value, {
            type: "horizontal",
            backgroundColor: "#ffffff",
            textColor: "#000000",
            unit: getRulerUnit(scale.value / 100),
            zoom: scale.value / 100
          });
        }
        if (!dragger) {
          dragger = drag(rulerDiv.value, {
            drag: ({ deltaX }) => {
              emits("update:scroll", scroll.value - deltaX);
            }
          });
        }
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "rulerDiv",
        ref: rulerDiv,
        class: "ruler"
      }, null, 512);
    };
  }
});
const RulerHorizontal_vue_vue_type_style_index_0_scoped_36b92415_lang = "";
const RulerHorizontal = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["__scopeId", "data-v-36b92415"]]);
function useRulerDivHeight(rulerDiv) {
  const height = ref(0);
  const stopFunc = createRenderLoop(() => {
    if (rulerDiv.value) {
      height.value = rulerDiv.value.clientHeight;
    }
  });
  onUnmounted(() => {
    stopFunc();
  });
  return height;
}
const _sfc_main$C = /* @__PURE__ */ defineComponent({
  __name: "RulerVertical",
  props: {
    scale: {
      type: Number,
      required: true
    },
    scroll: {
      type: Number,
      required: true
    }
  },
  emits: ["update:scroll"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const { scale, scroll } = toRefs(props);
    const rulerDiv = ref();
    const height = useRulerDivHeight(rulerDiv);
    let ruler = null;
    let dragger = null;
    watch(scroll, () => {
      ruler == null ? void 0 : ruler.scroll(scroll.value);
    });
    watch(height, () => {
      ruler == null ? void 0 : ruler.resize();
    });
    watch(scale, () => {
      if (ruler) {
        ruler.zoom = scale.value / 100;
        ruler.unit = getRulerUnit(scale.value / 100);
      }
    });
    onMounted(() => {
      if (rulerDiv.value) {
        if (!ruler) {
          ruler = new Ruler(rulerDiv.value, {
            type: "vertical",
            backgroundColor: "#ffffff",
            textColor: "#000000",
            unit: getRulerUnit(scale.value / 100),
            zoom: scale.value / 100
          });
        }
        if (!dragger) {
          dragger = drag(rulerDiv.value, {
            drag: ({ deltaY }) => {
              emits("update:scroll", scroll.value - deltaY);
            }
          });
        }
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "rulerDiv",
        ref: rulerDiv,
        class: "ruler"
      }, null, 512);
    };
  }
});
const RulerVertical_vue_vue_type_style_index_0_scoped_76565e3f_lang = "";
const RulerVertical = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["__scopeId", "data-v-76565e3f"]]);
const _withScopeId$8 = (n) => (pushScopeId("data-v-a7e1c6b7"), n = n(), popScopeId(), n);
const _hoisted_1$i = { class: "ruler-box" };
const _hoisted_2$c = /* @__PURE__ */ _withScopeId$8(() => /* @__PURE__ */ createElementVNode("div", { class: "ruler-outer-box" }, null, -1));
const _hoisted_3$a = { class: "ruler-horizontal-wrapper" };
const _hoisted_4$8 = { class: "ruler-vertical-wrapper" };
const _hoisted_5$6 = { class: "ruler-inner-box" };
const _hoisted_6$5 = { class: "ruler-inner-box-content" };
const _sfc_main$B = /* @__PURE__ */ defineComponent({
  __name: "RulerBox",
  props: {
    size: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    useCssVars((_ctx) => ({
      "51730862": leftPx.value,
      "7552b246": topPx.value
    }));
    const { size } = toRefs(props);
    const scroll = ref({
      x: 0,
      y: 0
    });
    const toPx = (n) => `${n}px`;
    const leftPx = computed(() => toPx(-scroll.value.x * size.value.scale / 100));
    const topPx = computed(() => toPx(-scroll.value.y * size.value.scale / 100));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$i, [
        _hoisted_2$c,
        createElementVNode("div", _hoisted_3$a, [
          createVNode(RulerHorizontal, {
            scale: unref(size).scale,
            scroll: scroll.value.x,
            "onUpdate:scroll": _cache[0] || (_cache[0] = ($event) => scroll.value.x = $event)
          }, null, 8, ["scale", "scroll"])
        ]),
        createElementVNode("div", _hoisted_4$8, [
          createVNode(RulerVertical, {
            scale: unref(size).scale,
            scroll: scroll.value.y,
            "onUpdate:scroll": _cache[1] || (_cache[1] = ($event) => scroll.value.y = $event)
          }, null, 8, ["scale", "scroll"])
        ]),
        createElementVNode("div", _hoisted_5$6, [
          createElementVNode("div", _hoisted_6$5, [
            renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ])
        ])
      ]);
    };
  }
});
const RulerBox_vue_vue_type_style_index_0_scoped_a7e1c6b7_lang = "";
const RulerBox = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["__scopeId", "data-v-a7e1c6b7"]]);
const _withScopeId$7 = (n) => (pushScopeId("data-v-64334aa4"), n = n(), popScopeId(), n);
const _hoisted_1$h = { class: "actions" };
const _hoisted_2$b = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createElementVNode("label", null, "宽度：", -1));
const _hoisted_3$9 = { style: { "width": "130px" } };
const _hoisted_4$7 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createElementVNode("label", null, "高度：", -1));
const _hoisted_5$5 = { style: { "width": "130px" } };
const _hoisted_6$4 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createElementVNode("label", null, "比例：", -1));
const _hoisted_7$3 = { style: { "width": "130px" } };
const _hoisted_8$3 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createElementVNode("label", null, "名称：", -1));
const _hoisted_9$3 = { style: { "width": "130px" } };
const _hoisted_10$2 = /* @__PURE__ */ _withScopeId$7(() => /* @__PURE__ */ createElementVNode("label", null, "地址：", -1));
const _hoisted_11$2 = { style: { "width": "130px" } };
const _hoisted_12$2 = { class: "page-cook-contaienr" };
const _sfc_main$A = /* @__PURE__ */ defineComponent({
  __name: "PageCook",
  props: {
    page: {}
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { page } = toRefs(props);
    const pageEditing = computed({
      get: () => {
        return page.value;
      },
      set: (value) => {
        if (value) {
          Object.assign(page.value, value);
        }
      }
    });
    const { undo, redo, dispose } = useRefHistory(pageEditing, {
      deep: true
    });
    const enablePicker = useComponentPickerEnable(cookEditorState).get();
    const togglePicker = () => {
      useComponentPickerEnable(cookEditorState).toggle();
    };
    const size = ref({
      width: 1920,
      height: 1080,
      scale: 100
    });
    const delPage = () => {
      dispose();
      usePageEditingUidList(cookEditorState).remove(page.value.uid);
      cookEditorState.pages = cookEditorState.pages.filter((e) => e.uid !== page.value.uid);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock(Fragment, null, [
        createElementVNode("div", _hoisted_1$h, [
          createVNode(unref(NSpace), { align: "center" }, {
            default: withCtx(() => [
              createVNode(unref(NPopover), {
                trigger: "hover",
                placement: "bottom"
              }, {
                trigger: withCtx(() => [
                  createVNode(unref(NIcon), {
                    onClick: _cache[0] || (_cache[0] = ($event) => unref(undo)())
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(ArrowUndoOutline))
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  createTextVNode(" 撤销 ")
                ]),
                _: 1
              }),
              createVNode(unref(NPopover), {
                trigger: "hover",
                placement: "bottom"
              }, {
                trigger: withCtx(() => [
                  createVNode(unref(NIcon), {
                    onClick: _cache[1] || (_cache[1] = ($event) => unref(redo)())
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(ArrowRedoOutline))
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  createTextVNode(" 恢复 ")
                ]),
                _: 1
              }),
              createVNode(unref(NPopover), {
                trigger: "hover",
                placement: "bottom"
              }, {
                trigger: withCtx(() => [
                  createVNode(unref(NIcon), {
                    onClick: togglePicker,
                    class: normalizeClass({ actived: unref(enablePicker) })
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(LocateOutline))
                    ]),
                    _: 1
                  }, 8, ["class"])
                ]),
                default: withCtx(() => [
                  createTextVNode(" 在页面上选择组件 ")
                ]),
                _: 1
              }),
              createVNode(unref(NPopover), {
                trigger: "hover",
                placement: "bottom"
              }, {
                trigger: withCtx(() => [
                  createVNode(unref(NIcon), { onClick: delPage }, {
                    default: withCtx(() => [
                      createVNode(unref(TrashOutline))
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  createTextVNode(" 删除当前页面 ")
                ]),
                _: 1
              }),
              createVNode(unref(NPopover), {
                trigger: "hover",
                placement: "bottom"
              }, {
                trigger: withCtx(() => [
                  createVNode(unref(NIcon), null, {
                    default: withCtx(() => [
                      createVNode(unref(PageSizeIcon))
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  createVNode(unref(NSpace), { vertical: "" }, {
                    default: withCtx(() => [
                      createVNode(unref(NSpace), {
                        align: "center",
                        justify: "space-around",
                        style: { "width": "200px" }
                      }, {
                        default: withCtx(() => [
                          _hoisted_2$b,
                          createElementVNode("div", _hoisted_3$9, [
                            createVNode(unref(NInputNumber), {
                              value: size.value.width,
                              "onUpdate:value": _cache[2] || (_cache[2] = ($event) => size.value.width = $event),
                              size: "small"
                            }, {
                              suffix: withCtx(() => [
                                createTextVNode("px")
                              ]),
                              _: 1
                            }, 8, ["value"])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(unref(NSpace), {
                        align: "center",
                        justify: "space-around",
                        style: { "width": "200px" }
                      }, {
                        default: withCtx(() => [
                          _hoisted_4$7,
                          createElementVNode("div", _hoisted_5$5, [
                            createVNode(unref(NInputNumber), {
                              value: size.value.height,
                              "onUpdate:value": _cache[3] || (_cache[3] = ($event) => size.value.height = $event),
                              size: "small"
                            }, {
                              suffix: withCtx(() => [
                                createTextVNode("px")
                              ]),
                              _: 1
                            }, 8, ["value"])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(unref(NSpace), {
                        align: "center",
                        justify: "space-around",
                        style: { "width": "200px" }
                      }, {
                        default: withCtx(() => [
                          _hoisted_6$4,
                          createElementVNode("div", _hoisted_7$3, [
                            createVNode(unref(NInputNumber), {
                              value: size.value.scale,
                              "onUpdate:value": _cache[4] || (_cache[4] = ($event) => size.value.scale = $event),
                              size: "small"
                            }, {
                              suffix: withCtx(() => [
                                createTextVNode("%")
                              ]),
                              _: 1
                            }, 8, ["value"])
                          ])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(unref(NPopover), {
                trigger: "hover",
                placement: "bottom"
              }, {
                trigger: withCtx(() => [
                  createVNode(unref(NIcon), null, {
                    default: withCtx(() => [
                      createVNode(unref(InformationCircle))
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  createVNode(unref(NSpace), { vertical: "" }, {
                    default: withCtx(() => [
                      createVNode(unref(NSpace), {
                        align: "center",
                        justify: "space-around",
                        style: { "width": "200px" }
                      }, {
                        default: withCtx(() => [
                          _hoisted_8$3,
                          createElementVNode("div", _hoisted_9$3, [
                            createVNode(unref(NInput), {
                              value: pageEditing.value.name,
                              "onUpdate:value": _cache[5] || (_cache[5] = ($event) => pageEditing.value.name = $event),
                              size: "small"
                            }, null, 8, ["value"])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(unref(NSpace), {
                        align: "center",
                        justify: "space-around",
                        style: { "width": "200px" }
                      }, {
                        default: withCtx(() => [
                          _hoisted_10$2,
                          createElementVNode("div", _hoisted_11$2, [
                            createVNode(unref(NInput), {
                              value: pageEditing.value.path,
                              "onUpdate:value": _cache[6] || (_cache[6] = ($event) => pageEditing.value.path = $event),
                              size: "small",
                              type: "textarea"
                            }, null, 8, ["value"])
                          ])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        createElementVNode("div", _hoisted_12$2, [
          createVNode(RulerBox, { size: size.value }, {
            default: withCtx(() => [
              createVNode(PageCookContent, {
                "page-editing": pageEditing.value,
                "enable-picker": unref(enablePicker),
                size: size.value
              }, null, 8, ["page-editing", "enable-picker", "size"])
            ]),
            _: 1
          }, 8, ["size"])
        ])
      ], 64);
    };
  }
});
const PageCook_vue_vue_type_style_index_0_scoped_64334aa4_lang = "";
const PageCook = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["__scopeId", "data-v-64334aa4"]]);
const _hoisted_1$g = { class: "page-cook-panel" };
const _sfc_main$z = /* @__PURE__ */ defineComponent({
  __name: "PageCookPanel",
  props: {
    pageUid: {
      type: String
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { pageUid } = toRefs(props);
    const pageEditing = computed(() => {
      return cookEditorState.pages.find((e) => e.uid === (pageUid == null ? void 0 : pageUid.value));
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$g, [
        pageEditing.value ? (openBlock(), createBlock(PageCook, {
          key: 0,
          page: pageEditing.value
        }, null, 8, ["page"])) : (openBlock(), createBlock(unref(NEmpty), {
          key: 1,
          description: "没有正在编辑的页面"
        }))
      ]);
    };
  }
});
const PageCookPanel_vue_vue_type_style_index_0_scoped_c0a80fb6_lang = "";
const PageCookPanel = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["__scopeId", "data-v-c0a80fb6"]]);
function usePanelMakerList(cookState) {
  return computed(() => {
    const allList = cookState.makerList;
    return allList.filter((e) => e.type === "panel");
  });
}
function usePanelMaker(cookState, name2, pkg) {
  return computed(() => {
    const makerList = usePanelMakerList(cookState);
    const maker2 = makerList.value.find((e) => e.name === name2 && e.pkg === pkg);
    return maker2;
  });
}
function remove(cookEditorState, splitLayoutPaneName, panelConfig) {
  var _a, _b;
  const list = cookEditorState.layout[splitLayoutPaneName];
  const index = list.findIndex((e) => e.uid === panelConfig.uid);
  if (index > -1) {
    list.splice(index, 1);
    const maker2 = usePanelMaker(cookEditorState, panelConfig.makerName, panelConfig.makerPkg);
    (_b = (_a = maker2 == null ? void 0 : maker2.value) == null ? void 0 : _a.onClose) == null ? void 0 : _b.call(_a, cookEditorState, panelConfig);
  }
}
function layoutRemoveTab(cookEditorState, panelConfig) {
  remove(cookEditorState, "left", panelConfig);
  remove(cookEditorState, "center", panelConfig);
  remove(cookEditorState, "bottom", panelConfig);
  remove(cookEditorState, "right", panelConfig);
}
function layoutAddTab(cookEditorState, panelConfig, splitLayoutPaneName) {
  var _a, _b;
  cookEditorState.layout[splitLayoutPaneName].push(panelConfig);
  const maker2 = usePanelMaker(cookEditorState, panelConfig.makerName, panelConfig.makerPkg);
  (_b = (_a = maker2 == null ? void 0 : maker2.value) == null ? void 0 : _a.onOpen) == null ? void 0 : _b.call(_a, cookEditorState, panelConfig);
}
function makeDefaultPanelConfig(maker2) {
  const uid = v4();
  let config = {
    uid,
    name: maker2.name,
    makerType: "panel",
    makerName: maker2.name,
    makerPkg: maker2.pkg
  };
  return config;
}
const stateMap = /* @__PURE__ */ new Map();
const getPanelLink = (cookEditorState, panelUid) => {
  const linkList = stateMap.get(cookEditorState) || [];
  return linkList.find((e) => e.panelUid === panelUid);
};
const setLink = (cookEditorState, link) => {
  let linkList = stateMap.get(cookEditorState);
  if (!linkList) {
    linkList = [];
    stateMap.set(cookEditorState, linkList);
  }
  linkList.push(link);
};
const getPageLink = (cookEditorState, pageUid) => {
  const linkList = stateMap.get(cookEditorState) || [];
  return linkList.find((e) => e.pageUid === pageUid);
};
const PagePanelLinker = {
  getPageUid: (cookEditorState, panelUid) => {
    const link = getPanelLink(cookEditorState, panelUid);
    return link == null ? void 0 : link.pageUid;
  },
  getPanelUid: (cookEditorState, pageUid) => {
    const link = getPageLink(cookEditorState, pageUid);
    return link == null ? void 0 : link.panelUid;
  },
  link: (cookEditorState, pageUid, panelUid) => {
    const pageLink = getPageLink(cookEditorState, pageUid);
    const panelLink = getPanelLink(cookEditorState, panelUid);
    if (pageLink) {
      pageLink.panelUid = panelUid;
      return;
    }
    if (panelLink) {
      panelLink.pageUid = pageUid;
      return;
    }
    setLink(cookEditorState, {
      pageUid,
      panelUid
    });
  }
};
function findPanelConfig(cookEditorState, panelUid) {
  const layout = cookEditorState.layout;
  let found = void 0;
  found = layout.left.find((e) => e.uid === panelUid);
  if (!found) {
    found = layout.center.find((e) => e.uid === panelUid);
  }
  if (!found) {
    found = layout.right.find((e) => e.uid === panelUid);
  }
  if (!found) {
    found = layout.bottom.find((e) => e.uid === panelUid);
  }
  return found;
}
const maker$1 = definePanelMaker({
  name: "页面编辑器",
  pkg: pkgName,
  defaultSplitLayoutPaneName: "center",
  make: (cookState, config) => {
    let pageUid;
    if (cookState.type === "editor") {
      const cookEditorState = cookState;
      pageUid = PagePanelLinker.getPageUid(cookEditorState, config.uid);
      cookEditorState.pages.find((d) => d.uid === pageUid);
    }
    return defineComponent({
      setup() {
        return () => h(
          PageCookPanel,
          {
            pageUid
          }
        );
      }
    });
  },
  makeTitle: (cookState, config) => {
    let pageUid;
    let page;
    if (cookState.type === "editor") {
      const cookEditorState = cookState;
      pageUid = PagePanelLinker.getPageUid(cookEditorState, config.uid);
      page = cookEditorState.pages.find((d) => d.uid === pageUid);
    }
    return (page == null ? void 0 : page.name) || "没有正在编辑的页面";
  },
  onClose: (cookState, config) => {
    if (cookState.type === "editor") {
      const cookEditorState = cookState;
      const pageUid = PagePanelLinker.getPageUid(cookEditorState, config.uid);
      usePageEditingUidList(cookEditorState).remove(pageUid);
    }
  },
  install: (cookState) => {
    if (cookState.type === "editor") {
      const cookEditorState = cookState;
      useComponentPickerEnable(cookEditorState).set(true);
      const pageEditingUidList = usePageEditingUidList(cookEditorState).list;
      watch(pageEditingUidList, (state, prevState) => {
        const needClose = prevState.filter((e) => {
          return !state.find((d) => e === d);
        });
        const needOpen = state.filter((e) => {
          return !prevState.find((d) => e === d);
        });
        needClose.map((e) => {
          const panelUid = PagePanelLinker.getPanelUid(cookEditorState, e);
          if (!panelUid) {
            return;
          }
          const panelConfig = findPanelConfig(cookEditorState, panelUid);
          if (!panelConfig) {
            return;
          }
          layoutRemoveTab(cookEditorState, panelConfig);
        });
        needOpen.map((e) => {
          const page = cookEditorState.pages.find((d) => d.uid === e);
          if (page) {
            const config = makeDefaultPanelConfig(maker$1);
            PagePanelLinker.link(cookEditorState, e, config.uid);
            layoutAddTab(cookEditorState, config, maker$1.defaultSplitLayoutPaneName);
          }
        });
      });
    }
  }
});
const _withScopeId$6 = (n) => (pushScopeId("data-v-3e97564e"), n = n(), popScopeId(), n);
const _hoisted_1$f = { class: "emit-info-tips" };
const _hoisted_2$a = { class: "info-tips-item" };
const _hoisted_3$8 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createElementVNode("div", { class: "info-tips-item-label" }, "名称", -1));
const _hoisted_4$6 = { class: "info-tips-item-content" };
const _hoisted_5$4 = { class: "info-tips-item" };
const _hoisted_6$3 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createElementVNode("div", { class: "info-tips-item-label" }, "唯一ID", -1));
const _hoisted_7$2 = { class: "info-tips-item-content" };
const _hoisted_8$2 = { class: "info-tips-item" };
const _hoisted_9$2 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createElementVNode("div", { class: "info-tips-item-label" }, "资源类型", -1));
const _hoisted_10$1 = { class: "info-tips-item-content" };
const _hoisted_11$1 = { class: "round-name-tag" };
const _hoisted_12$1 = /* @__PURE__ */ _withScopeId$6(() => /* @__PURE__ */ createElementVNode("div", { style: { "padding": "0 2px" } }, "-", -1));
const _hoisted_13$1 = { class: "round-pkg-tag" };
const _sfc_main$y = /* @__PURE__ */ defineComponent({
  __name: "EventInfoTips",
  props: {
    logicConfig: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$f, [
        createElementVNode("div", _hoisted_2$a, [
          _hoisted_3$8,
          createElementVNode("div", _hoisted_4$6, toDisplayString(__props.logicConfig.name), 1)
        ]),
        createElementVNode("div", _hoisted_5$4, [
          _hoisted_6$3,
          createElementVNode("div", _hoisted_7$2, toDisplayString(__props.logicConfig.uid), 1)
        ]),
        createElementVNode("div", _hoisted_8$2, [
          _hoisted_9$2,
          createElementVNode("div", _hoisted_10$1, [
            createElementVNode("div", _hoisted_11$1, toDisplayString(__props.logicConfig.makerName), 1),
            _hoisted_12$1,
            createElementVNode("div", _hoisted_13$1, toDisplayString(__props.logicConfig.makerPkg), 1)
          ])
        ])
      ]);
    };
  }
});
const EventInfoTips_vue_vue_type_style_index_0_scoped_3e97564e_lang = "";
const EventInfoTips = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["__scopeId", "data-v-3e97564e"]]);
function useLogicMakerList(cookState) {
  return computed(() => {
    const allList = cookState.makerList;
    return allList.filter((e) => e.type === "logic");
  });
}
function useLogicMaker(cookState, name2, pkg) {
  return computed(() => {
    const makerList = useLogicMakerList(cookState);
    const maker2 = makerList.value.find((e) => e.name === name2 && e.pkg === pkg);
    return maker2;
  });
}
const _hoisted_1$e = { class: "emit-params-edit" };
const _sfc_main$x = /* @__PURE__ */ defineComponent({
  __name: "EventParamsEdit",
  props: {
    logicConfig: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { logicConfig } = toRefs(props);
    const paramsOptions = ref([]);
    const formValue = ref();
    const updateParamsOptions = () => {
      var _a, _b, _c;
      const configValue = logicConfig.value;
      if (!configValue) {
        paramsOptions.value = [];
        return;
      }
      const maker2 = useLogicMaker(cookEditorState, (_a = logicConfig.value) == null ? void 0 : _a.makerName, (_b = logicConfig.value) == null ? void 0 : _b.makerPkg).value;
      if (!maker2) {
        paramsOptions.value = [];
        return;
      }
      const _paramsOptions = ((_c = maker2 == null ? void 0 : maker2.makePropOptions) == null ? void 0 : _c.call(maker2, cookEditorState, configValue)) || [];
      const _optionsWithValue = _paramsOptions.map((e) => {
        var _a2, _b2;
        let value = ((_b2 = (_a2 = logicConfig.value) == null ? void 0 : _a2.props) == null ? void 0 : _b2[e]) || "";
        return {
          label: e,
          value
        };
      });
      paramsOptions.value = _optionsWithValue;
    };
    watch(logicConfig, () => {
      updateParamsOptions();
    }, {
      immediate: true
    });
    watch(paramsOptions, () => {
      const configValue = logicConfig.value;
      if (!configValue) {
        return;
      }
      paramsOptions.value.map((e) => {
        configValue.props = (configValue == null ? void 0 : configValue.props) || {};
        configValue.props[e.label] = e.value;
      });
    }, {
      deep: true
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NScrollbar), { style: { "height": "200px" } }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1$e, [
            createVNode(unref(NForm), {
              "label-placement": "left",
              "label-width": 70,
              "label-align": "right",
              size: "small",
              model: formValue.value
            }, {
              default: withCtx(() => [
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("基础信息")
                  ]),
                  _: 1
                }),
                createVNode(unref(NFormItem), { label: "名字" }, {
                  default: withCtx(() => [
                    createVNode(unref(NInput), {
                      value: unref(logicConfig).name,
                      "onUpdate:value": _cache[0] || (_cache[0] = ($event) => unref(logicConfig).name = $event)
                    }, null, 8, ["value"])
                  ]),
                  _: 1
                }),
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("属性")
                  ]),
                  _: 1
                }),
                paramsOptions.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(paramsOptions.value, (paramOption) => {
                  return openBlock(), createBlock(unref(NFormItem), {
                    label: paramOption.label
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(NInput), {
                        value: paramOption.value,
                        "onUpdate:value": ($event) => paramOption.value = $event
                      }, null, 8, ["value", "onUpdate:value"])
                    ]),
                    _: 2
                  }, 1032, ["label"]);
                }), 256)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  createTextVNode("无")
                ], 64))
              ]),
              _: 1
            }, 8, ["model"])
          ])
        ]),
        _: 1
      });
    };
  }
});
const EventParamsEdit_vue_vue_type_style_index_0_scoped_2adc05f6_lang = "";
const EventParamsEdit = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["__scopeId", "data-v-2adc05f6"]]);
const _sfc_main$w = /* @__PURE__ */ defineComponent({
  __name: "EventLogicAction",
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  emits: ["del", "up", "down"],
  setup(__props, { emit: emits }) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NSpace), { align: "center" }, {
        default: withCtx(() => [
          createVNode(unref(NPopover), {
            trigger: "hover",
            placement: "bottom"
          }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onClick: _cache[0] || (_cache[0] = ($event) => emits("del"))
              }, {
                default: withCtx(() => [
                  createVNode(unref(TrashOutline))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 删除 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), {
            trigger: "hover",
            placement: "bottom"
          }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), null, {
                default: withCtx(() => [
                  createVNode(unref(Edit32Regular))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createVNode(EventParamsEdit, { "logic-config": __props.config }, null, 8, ["logic-config"])
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), {
            trigger: "hover",
            placement: "bottom"
          }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onClick: _cache[1] || (_cache[1] = ($event) => emits("up"))
              }, {
                default: withCtx(() => [
                  createVNode(unref(ArrowUp48Regular))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 上移 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), {
            trigger: "hover",
            placement: "bottom"
          }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onClick: _cache[2] || (_cache[2] = ($event) => emits("down"))
              }, {
                default: withCtx(() => [
                  createVNode(unref(ArrowDown48Regular))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 上移 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), {
            trigger: "hover",
            placement: "left"
          }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), null, {
                default: withCtx(() => [
                  createVNode(unref(InformationCircle))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createVNode(EventInfoTips, { "logic-config": __props.config }, null, 8, ["logic-config"])
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
});
const EventLogicAction_vue_vue_type_style_index_0_scoped_4ef50e19_lang = "";
const EventLogicAction = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["__scopeId", "data-v-4ef50e19"]]);
function makeDefaultLogicConfig(maker2) {
  const uid = v4();
  let config = {
    uid,
    name: maker2.name,
    makerType: "logic",
    makerName: maker2.name,
    makerPkg: maker2.pkg
  };
  return config;
}
function getMakerDataFromDragEvent(e) {
  if (!e.dataTransfer) {
    return;
  }
  const makerName = e.dataTransfer.getData("name");
  const makerPkg = e.dataTransfer.getData("package");
  const makerType = e.dataTransfer.getData("type");
  if (!makerName || !makerPkg || !makerType) {
    return;
  }
  return {
    name: makerName,
    package: makerPkg,
    type: makerType
  };
}
const handleDrop$3 = (cookEditorState, eventName, componentConfig, e) => {
  if (!componentConfig) {
    return;
  }
  const data = getMakerDataFromDragEvent(e);
  if (!data) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  const makerName = data.name;
  const makerPkg = data.package;
  const maker2 = useLogicMaker(cookEditorState, makerName, makerPkg);
  if (!maker2.value) {
    return;
  }
  const logicConfig = makeDefaultLogicConfig(maker2.value);
  componentConfig.events = componentConfig.events || {};
  componentConfig.events[eventName] = componentConfig.events[eventName] || [];
  componentConfig.events[eventName].push(logicConfig);
  if (e.target && e.target instanceof HTMLElement) {
    e.target.classList.remove("dragenter");
  }
};
const handleDragOver$3 = (e) => {
  e.preventDefault();
  if (e.dataTransfer) {
    if (!e.dataTransfer.types.includes(VueCookLogicMakerDraggerTag)) {
      e.dataTransfer.dropEffect = "none";
    }
  }
};
function handleDragEnter$2(e) {
  if (e.dataTransfer) {
    if (e.dataTransfer.types.includes(VueCookLogicMakerDraggerTag)) {
      if (e.target && e.target instanceof HTMLElement) {
        e.target.classList.add("dragenter");
      }
    }
  }
}
function handleDragLeave$2(e) {
  if (e.target && e.target instanceof HTMLElement) {
    e.target.classList.remove("dragenter");
  }
}
const _sfc_main$v = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    eventName: {
      type: String,
      required: true
    },
    componentConfig: {
      type: Object
    }
  },
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "event-dragger",
        onDrop: _cache[0] || (_cache[0] = ($event) => unref(handleDrop$3)(unref(cookEditorState), __props.eventName, __props.componentConfig, $event)),
        onDragover: _cache[1] || (_cache[1] = ($event) => unref(handleDragOver$3)($event)),
        onDragenter: _cache[2] || (_cache[2] = ($event) => unref(handleDragEnter$2)($event)),
        onDragleave: _cache[3] || (_cache[3] = ($event) => unref(handleDragLeave$2)($event))
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createTextVNode(toDisplayString(__props.eventName), 1)
        ], true)
      ], 32);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_57505425_lang = "";
const EventDragger = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["__scopeId", "data-v-57505425"]]);
const _hoisted_1$d = { class: "event-editor" };
const _hoisted_2$9 = { class: "event-add-bar" };
const _sfc_main$u = /* @__PURE__ */ defineComponent({
  __name: "EventEditorItem",
  props: {
    eventOption: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    const selectedComponent = useComponentSelected(cookEditorState).get();
    const config = computed(() => {
      var _a;
      return (_a = selectedComponent.value) == null ? void 0 : _a.component;
    });
    const columns = ref([
      {
        title: "名称",
        key: "name"
      },
      {
        title: "操作",
        key: "actions",
        render(rowData, rowIndex) {
          return h(
            EventLogicAction,
            {
              config: rowData.value,
              onDel: () => {
                var _a, _b;
                const event = (_b = (_a = config.value) == null ? void 0 : _a.events) == null ? void 0 : _b[rowData.eventName];
                if (event) {
                  event.splice(rowIndex, 1);
                }
              },
              onUp: () => {
                var _a, _b;
                const event = (_b = (_a = config.value) == null ? void 0 : _a.events) == null ? void 0 : _b[rowData.eventName];
                if (event) {
                  if (rowIndex <= 0) {
                    return;
                  }
                  const temp = event[rowIndex];
                  event[rowIndex] = event[rowIndex - 1];
                  event[rowIndex - 1] = temp;
                }
              },
              onDown: () => {
                var _a, _b;
                const event = (_b = (_a = config.value) == null ? void 0 : _a.events) == null ? void 0 : _b[rowData.eventName];
                if (event) {
                  if (rowIndex >= event.length - 1) {
                    return;
                  }
                  const temp = event[rowIndex];
                  event[rowIndex] = event[rowIndex + 1];
                  event[rowIndex + 1] = temp;
                }
              }
            }
          );
        }
      }
    ]);
    const getData = (eventValue, eventName) => {
      return eventValue.map((e) => {
        return {
          key: e.uid,
          name: e.name,
          eventName,
          value: e
        };
      });
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NFormItem), {
        label: __props.eventOption.name
      }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1$d, [
            createElementVNode("div", _hoisted_2$9, [
              createVNode(EventDragger, {
                "component-config": config.value,
                "event-name": __props.eventOption.name
              }, {
                default: withCtx(() => [
                  createTextVNode("拖拽逻辑到此处添加")
                ]),
                _: 1
              }, 8, ["component-config", "event-name"])
            ]),
            createVNode(unref(NDataTable), {
              columns: columns.value,
              data: getData(__props.eventOption.value, __props.eventOption.name),
              size: "small"
            }, null, 8, ["columns", "data"])
          ])
        ]),
        _: 1
      }, 8, ["label"]);
    };
  }
});
const EventEditorItem_vue_vue_type_style_index_0_scoped_b9a96854_lang = "";
const EventEditorItem = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["__scopeId", "data-v-b9a96854"]]);
const _sfc_main$t = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    const eventOptions = computed(() => {
      var _a, _b, _c;
      const configValue = config.value;
      if (!configValue) {
        return [];
      }
      const maker2 = useComponentMaker(cookEditorState, (_a = config.value) == null ? void 0 : _a.makerName, (_b = config.value) == null ? void 0 : _b.makerPkg).value;
      if (!maker2) {
        return [];
      }
      const _eventOptions = ((_c = maker2 == null ? void 0 : maker2.makeEventOptions) == null ? void 0 : _c.call(maker2, cookEditorState, configValue)) || [];
      const _optionsWithValue = _eventOptions.map((e) => {
        var _a2, _b2;
        let value = ((_b2 = (_a2 = config.value) == null ? void 0 : _a2.events) == null ? void 0 : _b2[e]) || [];
        return {
          name: e,
          value
        };
      });
      return _optionsWithValue;
    });
    const selectedComponent = useComponentSelected(cookEditorState).get();
    const config = computed(() => {
      var _a;
      return (_a = selectedComponent.value) == null ? void 0 : _a.component;
    });
    return (_ctx, _cache) => {
      return eventOptions.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(eventOptions.value, (eventOption) => {
        return openBlock(), createBlock(EventEditorItem, { "event-option": eventOption }, null, 8, ["event-option"]);
      }), 256)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        createTextVNode("无")
      ], 64));
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_b4c19684_lang = "";
const EventsEditor = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["__scopeId", "data-v-b4c19684"]]);
const _withScopeId$5 = (n) => (pushScopeId("data-v-fd1317f0"), n = n(), popScopeId(), n);
const _hoisted_1$c = { class: "component-info-tips" };
const _hoisted_2$8 = { class: "info-tips-item" };
const _hoisted_3$7 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createElementVNode("div", { class: "info-tips-item-label" }, "名称", -1));
const _hoisted_4$5 = { class: "info-tips-item-content" };
const _hoisted_5$3 = { class: "info-tips-item" };
const _hoisted_6$2 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createElementVNode("div", { class: "info-tips-item-label" }, "唯一ID", -1));
const _hoisted_7$1 = { class: "info-tips-item-content" };
const _hoisted_8$1 = { class: "info-tips-item" };
const _hoisted_9$1 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createElementVNode("div", { class: "info-tips-item-label" }, "资源类型", -1));
const _hoisted_10 = { class: "info-tips-item-content" };
const _hoisted_11 = { class: "round-name-tag" };
const _hoisted_12 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createElementVNode("div", { style: { "padding": "0 2px" } }, "-", -1));
const _hoisted_13 = { class: "round-pkg-tag" };
const _hoisted_14 = { class: "info-tips-item" };
const _hoisted_15 = /* @__PURE__ */ _withScopeId$5(() => /* @__PURE__ */ createElementVNode("div", { class: "info-tips-item-label" }, "插槽", -1));
const _hoisted_16 = { class: "info-tips-item-content" };
const _hoisted_17 = { class: "round-slot-tag" };
const _sfc_main$s = /* @__PURE__ */ defineComponent({
  __name: "ComponentInfoTips",
  props: {
    componentConfig: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { componentConfig } = toRefs(props);
    const maker2 = computed(() => {
      var _a, _b;
      return useComponentMaker(cookEditorState, (_a = componentConfig.value) == null ? void 0 : _a.makerName, (_b = componentConfig.value) == null ? void 0 : _b.makerPkg).value;
    });
    const slotOptions = computed(() => {
      var _a, _b;
      if (componentConfig.value) {
        const _slotOptions = (_b = (_a = maker2.value) == null ? void 0 : _a.makeSlotOptions) == null ? void 0 : _b.call(_a, cookEditorState, componentConfig.value);
        if (_slotOptions && _slotOptions.length > 0) {
          return _slotOptions;
        }
      }
      return [];
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$c, [
        createElementVNode("div", _hoisted_2$8, [
          _hoisted_3$7,
          createElementVNode("div", _hoisted_4$5, toDisplayString(unref(componentConfig).name), 1)
        ]),
        createElementVNode("div", _hoisted_5$3, [
          _hoisted_6$2,
          createElementVNode("div", _hoisted_7$1, toDisplayString(unref(componentConfig).uid), 1)
        ]),
        createElementVNode("div", _hoisted_8$1, [
          _hoisted_9$1,
          createElementVNode("div", _hoisted_10, [
            createElementVNode("div", _hoisted_11, toDisplayString(unref(componentConfig).makerName), 1),
            _hoisted_12,
            createElementVNode("div", _hoisted_13, toDisplayString(unref(componentConfig).makerPkg), 1)
          ])
        ]),
        createElementVNode("div", _hoisted_14, [
          _hoisted_15,
          createElementVNode("div", _hoisted_16, [
            slotOptions.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(slotOptions.value, (slotName) => {
              return openBlock(), createElementBlock("div", _hoisted_17, toDisplayString(slotName), 1);
            }), 256)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createTextVNode("无")
            ], 64))
          ])
        ])
      ]);
    };
  }
});
const ComponentInfoTips_vue_vue_type_style_index_0_scoped_fd1317f0_lang = "";
const ComponentInfoTips = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["__scopeId", "data-v-fd1317f0"]]);
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  __name: "SlotComponentAction",
  props: {
    config: {
      type: Object,
      required: true
    },
    slotName: {
      type: String,
      required: true
    },
    pageUid: {
      type: String
    }
  },
  emits: ["del", "location", "up", "down", "select"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { config, pageUid } = toRefs(props);
    const handleMouseLeave = () => {
      useComponentFocused(cookEditorState).set();
    };
    const handleMouseMove = (e) => {
      if (pageUid == null ? void 0 : pageUid.value) {
        useComponentFocused(cookEditorState).set({
          pageUid: pageUid.value,
          componentUid: config.value.uid
        });
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NSpace), { align: "center" }, {
        default: withCtx(() => [
          createVNode(unref(NPopover), { trigger: "hover" }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onClick: _cache[0] || (_cache[0] = ($event) => emits("del"))
              }, {
                default: withCtx(() => [
                  createVNode(unref(TrashOutline))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 删除 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), { trigger: "hover" }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onMousemove: handleMouseMove,
                onMouseleave: handleMouseLeave
              }, {
                default: withCtx(() => [
                  createVNode(unref(LocateOutline))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 定位 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), { trigger: "hover" }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onClick: _cache[1] || (_cache[1] = ($event) => emits("select"))
              }, {
                default: withCtx(() => [
                  createVNode(unref(SelectOutlined))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 选择 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), { trigger: "hover" }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onClick: _cache[2] || (_cache[2] = ($event) => emits("up"))
              }, {
                default: withCtx(() => [
                  createVNode(unref(ArrowUp48Regular))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 上移 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), { trigger: "hover" }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), {
                onClick: _cache[3] || (_cache[3] = ($event) => emits("down"))
              }, {
                default: withCtx(() => [
                  createVNode(unref(ArrowDown48Regular))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createTextVNode(" 下移 ")
            ]),
            _: 1
          }),
          createVNode(unref(NPopover), {
            trigger: "hover",
            placement: "left"
          }, {
            trigger: withCtx(() => [
              createVNode(unref(NIcon), null, {
                default: withCtx(() => [
                  createVNode(unref(InformationCircle))
                ]),
                _: 1
              })
            ]),
            default: withCtx(() => [
              createVNode(ComponentInfoTips, { "component-config": unref(config) }, null, 8, ["component-config"])
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
});
const SlotComponentAction_vue_vue_type_style_index_0_scoped_0af6636f_lang = "";
const SlotComponentAction = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["__scopeId", "data-v-0af6636f"]]);
function addComponentConfig(parentComponent, childComponent, slotName) {
  parentComponent.slots = parentComponent.slots || {};
  parentComponent.slots[slotName] = parentComponent.slots[slotName] || [];
  parentComponent.slots[slotName].push(childComponent);
}
function removeComponentConfig(parentComponent, childComponentUid, slotName) {
  var _a;
  const list = ((_a = parentComponent.slots) == null ? void 0 : _a[slotName]) || [];
  const index = list.findIndex((e) => e.uid === childComponentUid);
  if (index > -1) {
    list.splice(index, 1);
  }
}
const _hoisted_1$b = { class: "slot-editor" };
const _hoisted_2$7 = { class: "slot-add-bar" };
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  __name: "SlotsEditorItem",
  props: {
    slotOption: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { slotOption } = toRefs(props);
    const handleComponentDrop = (componentConfig) => {
      if (config.value) {
        addComponentConfig(config.value, componentConfig, slotOption.value);
      }
    };
    const selectedComponent = useComponentSelected(cookEditorState).get();
    const config = computed(() => {
      var _a;
      return (_a = selectedComponent.value) == null ? void 0 : _a.component;
    });
    const tableData = computed(() => {
      var _a, _b;
      const slotData = ((_b = (_a = config.value) == null ? void 0 : _a.slots) == null ? void 0 : _b[slotOption.value]) || [];
      return slotData.map((e) => {
        return {
          key: e.uid,
          name: e.name,
          slotName: slotOption.value,
          value: e
        };
      });
    });
    const columns = ref([
      {
        title: "名称",
        key: "name"
      },
      {
        title: "操作",
        key: "actions",
        render(rowData, rowIndex) {
          var _a;
          return h(
            SlotComponentAction,
            {
              config: rowData.value,
              slotName: rowData.slotName,
              pageUid: (_a = selectedComponent.value) == null ? void 0 : _a.page.uid,
              onDel: () => {
                if (config.value) {
                  removeComponentConfig(config.value, rowData.value.uid, rowData.slotName);
                }
              },
              onSelect: () => {
                var _a2, _b;
                if ((_a2 = selectedComponent.value) == null ? void 0 : _a2.page.uid) {
                  useComponentSelected(cookEditorState).set({
                    pageUid: (_b = selectedComponent.value) == null ? void 0 : _b.page.uid,
                    componentUid: rowData.value.uid
                  });
                }
              },
              onUp: () => {
                var _a2, _b;
                const slot = (_b = (_a2 = config.value) == null ? void 0 : _a2.slots) == null ? void 0 : _b[rowData.slotName];
                if (slot) {
                  if (rowIndex <= 0) {
                    return;
                  }
                  const temp = slot[rowIndex];
                  slot[rowIndex] = slot[rowIndex - 1];
                  slot[rowIndex - 1] = temp;
                }
              },
              onDown: () => {
                var _a2, _b;
                const slot = (_b = (_a2 = config.value) == null ? void 0 : _a2.slots) == null ? void 0 : _b[rowData.slotName];
                if (slot) {
                  if (rowIndex >= slot.length - 1) {
                    return;
                  }
                  const temp = slot[rowIndex];
                  slot[rowIndex] = slot[rowIndex + 1];
                  slot[rowIndex + 1] = temp;
                }
              }
            }
          );
        }
      }
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NFormItem), { label: unref(slotOption) }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1$b, [
            createElementVNode("div", _hoisted_2$7, [
              createVNode(unref(ComponentDragger), {
                onDrop: _cache[0] || (_cache[0] = ($event) => handleComponentDrop($event))
              }, {
                default: withCtx(() => [
                  createTextVNode("拖拽组件到此处添加")
                ]),
                _: 1
              })
            ]),
            createVNode(unref(NDataTable), {
              columns: columns.value,
              data: tableData.value,
              size: "small"
            }, null, 8, ["columns", "data"])
          ])
        ]),
        _: 1
      }, 8, ["label"]);
    };
  }
});
const SlotsEditorItem_vue_vue_type_style_index_0_scoped_09b7a2ff_lang = "";
const SlotsEditorItem = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["__scopeId", "data-v-09b7a2ff"]]);
function useSlotOptions(cookEditorState, componentConfig) {
  return computed(() => {
    var _a, _b, _c;
    const configValue = componentConfig.value;
    if (!configValue) {
      return [];
    }
    const maker2 = useComponentMaker(cookEditorState, (_a = componentConfig.value) == null ? void 0 : _a.makerName, (_b = componentConfig.value) == null ? void 0 : _b.makerPkg).value;
    if (!maker2) {
      return [];
    }
    return ((_c = maker2 == null ? void 0 : maker2.makeSlotOptions) == null ? void 0 : _c.call(maker2, cookEditorState, configValue)) || [];
  });
}
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    const selectedComponent = useComponentSelected(cookEditorState).get();
    const config = computed(() => {
      var _a;
      return (_a = selectedComponent.value) == null ? void 0 : _a.component;
    });
    const slotOptions = useSlotOptions(cookEditorState, config);
    return (_ctx, _cache) => {
      return unref(slotOptions).length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(unref(slotOptions), (slotOption) => {
        return openBlock(), createBlock(SlotsEditorItem, { "slot-option": slotOption }, null, 8, ["slot-option"]);
      }), 256)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        createTextVNode("无")
      ], 64));
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_950abf58_lang = "";
const SlotsEditor = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["__scopeId", "data-v-950abf58"]]);
const LogicIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyBjbGFzcz0iaWNvbiIgd2lkdGg9IjIwMHB4IiBoZWlnaHQ9IjIwMC4wMHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbD0iIzMzMzMzMyIgZD0iTTgwOC4yIDY1NS44Yy0yMS43IDAtNDIgNS43LTU5LjUgMTUuOEw1OTIuNCA1MTUuNFY1MDlsMTU2LjUtMTU2LjVjMTcuNSAxMCAzNy43IDE1LjYgNTkuMyAxNS42IDY2LjMgMCAxMjAtNTMuNyAxMjAtMTIwcy01My43LTEyMC0xMjAtMTIwLTEyMCA1My43LTEyMCAxMjBjMCAyMS41IDUuNiA0MS42IDE1LjUgNTkuMWwtMTczIDE3M0g0MDIuNWMtMTQuNy03MC4yLTc3LjEtMTIzLTE1MS43LTEyMy04NS42IDAtMTU1IDY5LjQtMTU1IDE1NXM2OS40IDE1NSAxNTUgMTU1Yzc0LjYgMCAxMzYuOS01Mi44IDE1MS43LTEyM2gxMjguMkw3MDMuNiA3MTdjLTkuOCAxNy40LTE1LjQgMzcuNC0xNS40IDU4LjggMCA2Ni4zIDUzLjcgMTIwIDEyMCAxMjBzMTIwLTUzLjcgMTIwLTEyMC01My44LTEyMC0xMjAtMTIweiBtLTU1Ny40LTUyLjZjLTUwLjIgMC05MS00MC44LTkxLTkxczQwLjgtOTEgOTEtOTEgOTEgNDAuOCA5MSA5MS00MC44IDkxLTkxIDkxeiBtNTU3LjQtNDExYzMwLjkgMCA1NiAyNS4xIDU2IDU2cy0yNS4xIDU2LTU2IDU2LTU2LTI1LjEtNTYtNTYgMjUuMS01NiA1Ni01NnogbTAgNjM5LjZjLTMwLjkgMC01Ni0yNS4xLTU2LTU2czI1LjEtNTYgNTYtNTYgNTYgMjUuMSA1NiA1Ni0yNS4xIDU2LTU2IDU2eiIgLz48L3N2Zz4=";
const handleDrop$2 = (cookEditorState, e, callBack) => {
  const data = getMakerDataFromDragEvent(e);
  if (!data) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  const makerName = data.name;
  const makerPkg = data.package;
  const maker2 = useLogicMaker(cookEditorState, makerName, makerPkg);
  if (!maker2.value) {
    return;
  }
  const logicConfig = makeDefaultLogicConfig(maker2.value);
  callBack(logicConfig);
  if (e.target && e.target instanceof HTMLElement) {
    e.target.classList.remove("dragenter");
  }
};
const handleDragOver$2 = (e) => {
  e.preventDefault();
  if (e.dataTransfer) {
    if (!e.dataTransfer.types.includes(VueCookLogicMakerDraggerTag)) {
      e.dataTransfer.dropEffect = "none";
    }
  }
};
function handleDragEnter$1(e) {
  if (e.dataTransfer) {
    if (e.dataTransfer.types.includes(VueCookLogicMakerDraggerTag)) {
      if (e.target && e.target instanceof HTMLElement) {
        e.target.classList.add("dragenter");
      }
    }
  }
}
function handleDragLeave$1(e) {
  if (e.target && e.target instanceof HTMLElement) {
    e.target.classList.remove("dragenter");
  }
}
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "index",
  emits: ["drop"],
  setup(__props, { emit: emits }) {
    const cookEditorState = inject("cookEditorState");
    const dropCallBack = (logicConfig) => {
      emits("drop", logicConfig);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "logic-dragger",
        onDrop: _cache[0] || (_cache[0] = ($event) => unref(handleDrop$2)(unref(cookEditorState), $event, dropCallBack)),
        onDragover: _cache[1] || (_cache[1] = ($event) => unref(handleDragOver$2)($event)),
        onDragenter: _cache[2] || (_cache[2] = ($event) => unref(handleDragEnter$1)($event)),
        onDragleave: _cache[3] || (_cache[3] = ($event) => unref(handleDragLeave$1)($event))
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createTextVNode("拖拽逻辑到此处添加")
        ], true)
      ], 32);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_5c631d4f_lang = "";
const LogicDragger = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["__scopeId", "data-v-5c631d4f"]]);
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "LogicEditorItem",
  props: {
    propOption: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const { propOption, config } = toRefs(props);
    const editableValue = computed({
      get: () => {
        return propOption.value.value;
      },
      set: (value) => {
        const configValue = config.value;
        if (!configValue) {
          return;
        }
        configValue.props = (configValue == null ? void 0 : configValue.props) || {};
        configValue.props[propOption.value.name] = value;
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NFormItem), {
        label: unref(propOption).name,
        class: "logic-editor-item"
      }, {
        default: withCtx(() => [
          createVNode(unref(NInput), {
            value: editableValue.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => editableValue.value = $event),
            round: ""
          }, null, 8, ["value"])
        ]),
        _: 1
      }, 8, ["label"]);
    };
  }
});
const _withScopeId$4 = (n) => (pushScopeId("data-v-71304804"), n = n(), popScopeId(), n);
const _hoisted_1$a = { class: "logic-params-edit" };
const _hoisted_2$6 = { class: "round-name-tag" };
const _hoisted_3$6 = /* @__PURE__ */ _withScopeId$4(() => /* @__PURE__ */ createElementVNode("div", { style: { "padding": "0 2px" } }, "-", -1));
const _hoisted_4$4 = { class: "round-pkg-tag" };
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    logicConfig: {
      type: Object,
      required: true
    }
  },
  emits: ["change"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { logicConfig } = toRefs(props);
    const editableValue = ref(logicConfig.value);
    watch(editableValue, () => {
      emits("change", editableValue.value);
    }, {
      deep: true
    });
    const formValue = ref();
    const propOptions = computed(() => {
      var _a, _b, _c;
      const configValue = logicConfig.value;
      if (!configValue) {
        return [];
      }
      const maker2 = useLogicMaker(cookEditorState, (_a = logicConfig.value) == null ? void 0 : _a.makerName, (_b = logicConfig.value) == null ? void 0 : _b.makerPkg).value;
      if (!maker2) {
        return [];
      }
      const _paramsOptions = ((_c = maker2 == null ? void 0 : maker2.makePropOptions) == null ? void 0 : _c.call(maker2, cookEditorState, configValue)) || [];
      const _optionsWithValue = _paramsOptions.map((e) => {
        var _a2, _b2;
        let value = ((_b2 = (_a2 = logicConfig.value) == null ? void 0 : _a2.props) == null ? void 0 : _b2[e]) || "";
        return {
          name: e,
          value
        };
      });
      return _optionsWithValue;
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NScrollbar), { style: { "height": "200px" } }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1$a, [
            createVNode(unref(NForm), {
              "label-placement": "left",
              "label-width": 70,
              "label-align": "right",
              size: "small",
              model: formValue.value
            }, {
              default: withCtx(() => [
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("基础信息")
                  ]),
                  _: 1
                }),
                createVNode(unref(NFormItem), { label: "名字" }, {
                  default: withCtx(() => [
                    createVNode(unref(NInput), {
                      value: editableValue.value.name,
                      "onUpdate:value": _cache[0] || (_cache[0] = ($event) => editableValue.value.name = $event)
                    }, null, 8, ["value"])
                  ]),
                  _: 1
                }),
                createVNode(unref(NFormItem), { label: "唯一ID" }, {
                  default: withCtx(() => [
                    createElementVNode("div", null, toDisplayString(editableValue.value.uid), 1)
                  ]),
                  _: 1
                }),
                createVNode(unref(NFormItem), { label: "资源类型" }, {
                  default: withCtx(() => [
                    createElementVNode("div", _hoisted_2$6, toDisplayString(editableValue.value.makerName), 1),
                    _hoisted_3$6,
                    createElementVNode("div", _hoisted_4$4, toDisplayString(editableValue.value.makerPkg), 1)
                  ]),
                  _: 1
                }),
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("属性")
                  ]),
                  _: 1
                }),
                propOptions.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(propOptions.value, (propOption) => {
                  return openBlock(), createBlock(_sfc_main$n, {
                    "prop-option": propOption,
                    config: editableValue.value
                  }, null, 8, ["prop-option", "config"]);
                }), 256)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  createTextVNode("无")
                ], 64))
              ]),
              _: 1
            }, 8, ["model"])
          ])
        ]),
        _: 1
      });
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_71304804_lang = "";
const LogicEditor = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["__scopeId", "data-v-71304804"]]);
function isLogicConfig(config) {
  if (!config) {
    return false;
  }
  if (!config.uid || !config.name || !config.makerType || !config.makerName || !config.makerPkg) {
    return false;
  }
  if (config.makerType !== "logic") {
    return false;
  }
  return true;
}
function parseLogicConfig(jsonString) {
  if (jsonString) {
    let config;
    try {
      config = JSON.parse(jsonString);
    } catch (e) {
      console.log(e);
    }
    if (isLogicConfig(config)) {
      return config;
    }
  }
}
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "PropEditorItem",
  props: {
    propOption: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { propOption } = toRefs(props);
    const editableValue = computed({
      get: () => {
        return propOption.value.value;
      },
      set: (value) => {
        const configValue = config.value;
        if (!configValue) {
          return;
        }
        configValue.props = (configValue == null ? void 0 : configValue.props) || {};
        configValue.props[propOption.value.name] = value;
      }
    });
    const selectedComponent = useComponentSelected(cookEditorState).get();
    const config = computed(() => {
      var _a;
      return (_a = selectedComponent.value) == null ? void 0 : _a.component;
    });
    const handleLogicDrop = (logicConfig2) => {
      editableValue.value = JSON.stringify(logicConfig2);
    };
    const handleLogicChange = (logicConfig2) => {
      editableValue.value = JSON.stringify(logicConfig2);
    };
    const logicConfig = computed(() => {
      return parseLogicConfig(propOption.value.value);
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NFormItem), {
        label: unref(propOption).name,
        class: "prop-editor-item"
      }, {
        default: withCtx(() => [
          createVNode(unref(NInput), {
            value: editableValue.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => editableValue.value = $event),
            round: "",
            class: "prop-editor-item-input"
          }, null, 8, ["value"]),
          createVNode(LogicDragger, {
            onDrop: _cache[2] || (_cache[2] = ($event) => handleLogicDrop($event))
          }, {
            default: withCtx(() => [
              createVNode(unref(NPopover), {
                trigger: "hover",
                placement: "top-end"
              }, {
                trigger: withCtx(() => [
                  createVNode(unref(NIcon), {
                    size: "15",
                    depth: 3
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(LogicIcon))
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  logicConfig.value ? (openBlock(), createBlock(LogicEditor, {
                    key: 0,
                    "logic-config": logicConfig.value,
                    onChange: _cache[1] || (_cache[1] = ($event) => handleLogicChange($event))
                  }, null, 8, ["logic-config"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    createTextVNode("拖拽逻辑到此处添加")
                  ], 64))
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["label"]);
    };
  }
});
const PropEditorItem_vue_vue_type_style_index_0_scoped_c9c6a9af_lang = "";
const PropEditorItem = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["__scopeId", "data-v-c9c6a9af"]]);
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    const propOptions = computed(() => {
      var _a, _b, _c;
      const configValue = config.value;
      if (!configValue) {
        return [];
      }
      const maker2 = useComponentMaker(cookEditorState, (_a = config.value) == null ? void 0 : _a.makerName, (_b = config.value) == null ? void 0 : _b.makerPkg).value;
      if (!maker2) {
        return [];
      }
      const _propOptions = ((_c = maker2 == null ? void 0 : maker2.makePropOptions) == null ? void 0 : _c.call(maker2, cookEditorState, configValue)) || [];
      const _optionsWithValue = _propOptions.map((e) => {
        var _a2, _b2;
        let value = ((_b2 = (_a2 = config.value) == null ? void 0 : _a2.props) == null ? void 0 : _b2[e]) || "";
        return {
          name: e,
          value
        };
      });
      return _optionsWithValue;
    });
    const selectedComponent = useComponentSelected(cookEditorState).get();
    const config = computed(() => {
      var _a;
      return (_a = selectedComponent.value) == null ? void 0 : _a.component;
    });
    return (_ctx, _cache) => {
      return propOptions.value.length > 0 ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(propOptions.value, (propOption) => {
        return openBlock(), createBlock(PropEditorItem, { "prop-option": propOption }, null, 8, ["prop-option"]);
      }), 256)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        createTextVNode("无")
      ], 64));
    };
  }
});
const _withScopeId$3 = (n) => (pushScopeId("data-v-ba3506eb"), n = n(), popScopeId(), n);
const _hoisted_1$9 = { class: "editor-panel" };
const _hoisted_2$5 = { class: "round-name-tag" };
const _hoisted_3$5 = /* @__PURE__ */ _withScopeId$3(() => /* @__PURE__ */ createElementVNode("div", { style: { "padding": "0 2px" } }, "-", -1));
const _hoisted_4$3 = { class: "round-pkg-tag" };
const _hoisted_5$2 = { key: 1 };
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "EditorPanel",
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    const selectedComponent = useComponentSelected(cookEditorState).get();
    const config = computed(() => {
      var _a;
      return (_a = selectedComponent.value) == null ? void 0 : _a.component;
    });
    const formValue = ref();
    const handleMouseLeave = () => {
      useComponentFocused(cookEditorState).set();
    };
    const handleMouseMove = (e) => {
      var _a, _b, _c, _d;
      if (((_a = selectedComponent.value) == null ? void 0 : _a.page.uid) && ((_b = selectedComponent.value) == null ? void 0 : _b.component.uid)) {
        useComponentFocused(cookEditorState).set({
          pageUid: (_c = selectedComponent.value) == null ? void 0 : _c.page.uid,
          componentUid: (_d = selectedComponent.value) == null ? void 0 : _d.component.uid
        });
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NScrollbar), { style: { "height": "100%" } }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1$9, [
            config.value ? (openBlock(), createBlock(unref(NForm), {
              key: 0,
              "label-placement": "left",
              "label-width": 70,
              "label-align": "right",
              size: "small",
              model: formValue.value
            }, {
              default: withCtx(() => [
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("基础信息")
                  ]),
                  _: 1
                }),
                createVNode(unref(NFormItem), { label: "名字" }, {
                  default: withCtx(() => [
                    createVNode(unref(NInput), {
                      value: config.value.name,
                      "onUpdate:value": _cache[0] || (_cache[0] = ($event) => config.value.name = $event)
                    }, null, 8, ["value"])
                  ]),
                  _: 1
                }),
                createVNode(unref(NFormItem), { label: "唯一ID" }, {
                  default: withCtx(() => [
                    createElementVNode("div", null, [
                      createTextVNode(toDisplayString(config.value.uid) + " ", 1),
                      createVNode(unref(NIcon), {
                        onMousemove: handleMouseMove,
                        onMouseleave: handleMouseLeave
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(LocationOutline))
                        ]),
                        _: 1
                      })
                    ])
                  ]),
                  _: 1
                }),
                createVNode(unref(NFormItem), { label: "资源类型" }, {
                  default: withCtx(() => [
                    createElementVNode("div", _hoisted_2$5, toDisplayString(config.value.makerName), 1),
                    _hoisted_3$5,
                    createElementVNode("div", _hoisted_4$3, toDisplayString(config.value.makerPkg), 1)
                  ]),
                  _: 1
                }),
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("属性")
                  ]),
                  _: 1
                }),
                createVNode(_sfc_main$k),
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("事件")
                  ]),
                  _: 1
                }),
                createVNode(EventsEditor),
                createVNode(unref(NDivider), { "title-placement": "left" }, {
                  default: withCtx(() => [
                    createTextVNode("插槽")
                  ]),
                  _: 1
                }),
                createVNode(SlotsEditor)
              ]),
              _: 1
            }, 8, ["model"])) : (openBlock(), createElementBlock("div", _hoisted_5$2, "请选择组件"))
          ])
        ]),
        _: 1
      });
    };
  }
});
const EditorPanel_vue_vue_type_style_index_0_scoped_ba3506eb_lang = "";
const EditorPanel = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["__scopeId", "data-v-ba3506eb"]]);
const ComponentEditorMaker = definePanelMaker({
  name: "基础组件编辑器",
  pkg: pkgName,
  defaultSplitLayoutPaneName: "right",
  make: () => EditorPanel
});
const ComponentIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyBjbGFzcz0iaWNvbiIgd2lkdGg9IjIwMHB4IiBoZWlnaHQ9IjIwMC4wMHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbD0iIzMzMzMzMyIgZD0iTTk0MC44IDI0Mi42ODhMNTMwLjU2IDQuOGMtMTEuMi02LjQtMjUuNi02LjQtMzYuNzM2IDBMODMuNTg0IDI0Mi42ODhjLTExLjIgNi40LTE5LjIgMTkuMTM2LTE5LjIgMzEuODcyVjc0OC44YzAgMTIuOCA2LjQgMjUuNTM2IDE5LjIgMzEuOTM2bDQxMC4yNCAyMzYuMjg4YzExLjIgNi40IDI1LjYgNi40IDM2LjczNiAwTDk0MC44IDc4MC43MzZjMTEuMi02LjQgMTkuMi0xOS4yIDE5LjItMzJWMjc0LjU2YzAtMTQuMzM2LTgtMjUuNTM2LTE5LjItMzEuODcyeiBtLTQ0LjY3MiA0OTAuMDQ4TDUxMy4wMjQgOTUzLjA4OCAxMjkuODU2IDczMi43MzZWMjg4Ljk2TDUxMy4wMjQgNjguNjcyIDg5Ni4xMjggMjkwLjU2VjczMi44ek0yNzkuOTM2IDM0MC4wMzJhMzAuOTc2IDMwLjk3NiAwIDAgMC00My4xMzYgMTEuMmMtNy45MzYgMTQuMzM2LTMuMiAzNS4xMzYgMTEuMiA0My4wNzJsMjMzLjA4OCAxMzUuNjh2MjY4LjIyNGEzMiAzMiAwIDAgMCAzMS45MzYgMzEuOTM2IDMyIDMyIDAgMCAwIDMxLjg3Mi0zMS45MzZ2LTI2OS43NmwyMzMuMDg4LTEzNC4xNDRjMTYtOS42IDIwLjgtMjguNzM2IDExLjItNDMuMDcyLTkuNi0xNi0yOC43MzYtMjAuOC00My4xMzYtMTEuMmwtMjMzLjAyNCAxMzQuMDgtMjMzLjA4OC0xMzQuMDh6IiAvPjwvc3ZnPg==";
const PanelIcon = "data:image/svg+xml;base64,PHN2ZyB0PSIxNjMzNzU4NzAyNDkxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjcwNTUiDQogICAgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPg0KICAgIDxwYXRoIGQ9Ik0wIDBoMTAyNHYxMDI0SDB6IiBmaWxsPSIjRkZGRkZGIiBwLWlkPSI3MDU2Ij48L3BhdGg+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTg1My4zMzMzMzMgODUzLjMzMzMzM0gxNzAuNjY2NjY3YTg1LjMzMzMzMyA4NS4zMzMzMzMgMCAwIDEtODUuMzMzMzM0LTg1LjMzMzMzM1YyNTZhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzQtODUuMzMzMzMzaDY4Mi42NjY2NjZhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzQgODUuMzMzMzMzdjUxMmE4NS4zMzMzMzMgODUuMzMzMzMzIDAgMCAxLTg1LjMzMzMzNCA4NS4zMzMzMzN6TTIxMy4zMzMzMzMgMjU2YTQyLjY2NjY2NyA0Mi42NjY2NjcgMCAwIDAtNDIuNjY2NjY2IDQyLjY2NjY2N3Y0NjkuMzMzMzMzaDY4Mi42NjY2NjZ2LTM0MS4zMzMzMzNoLTM0MS4zMzMzMzNhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjctNDIuNjY2NjY3VjI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMC00Mi42NjY2NjYtNDIuNjY2NjY3eiBtMzg0IDBhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMC00Mi42NjY2NjYgNDIuNjY2NjY3djQyLjY2NjY2NmgyOTguNjY2NjY2VjI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMC00Mi42NjY2NjYtNDIuNjY2NjY3eiINCiAgICAgICAgcC1pZD0iNzA1NyI+PC9wYXRoPg0KPC9zdmc+";
const _hoisted_1$8 = { class: "icon-wrapper" };
const _hoisted_2$4 = { class: "maker-detail" };
const _hoisted_3$4 = { class: "maker-name" };
const _hoisted_4$2 = { class: "maker-pkg" };
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "ResuorceMaker",
  props: {
    maker: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ResourceMaker), { maker: __props.maker }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1$8, [
            createVNode(unref(NIcon), {
              size: "25",
              depth: 3
            }, {
              default: withCtx(() => [
                __props.maker.type === "component" ? (openBlock(), createBlock(unref(ComponentIcon), { key: 0 })) : createCommentVNode("", true),
                __props.maker.type === "logic" ? (openBlock(), createBlock(unref(LogicIcon), { key: 1 })) : createCommentVNode("", true),
                __props.maker.type === "panel" ? (openBlock(), createBlock(unref(PanelIcon), { key: 2 })) : createCommentVNode("", true)
              ]),
              _: 1
            })
          ]),
          createElementVNode("div", _hoisted_2$4, [
            createElementVNode("div", _hoisted_3$4, toDisplayString(__props.maker.name), 1),
            createElementVNode("div", _hoisted_4$2, toDisplayString(__props.maker.pkg), 1)
          ])
        ]),
        _: 1
      }, 8, ["maker"]);
    };
  }
});
const ResuorceMaker_vue_vue_type_style_index_0_scoped_0c434a8b_lang = "";
const ResuorceMaker = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__scopeId", "data-v-0c434a8b"]]);
const _withScopeId$2 = (n) => (pushScopeId("data-v-2012a7da"), n = n(), popScopeId(), n);
const _hoisted_1$7 = { class: "resource-panel" };
const _hoisted_2$3 = { style: { "padding": "10px" } };
const _hoisted_3$3 = { class: "actions" };
const _hoisted_4$1 = { class: "action-item" };
const _hoisted_5$1 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createElementVNode("div", { class: "action-item-label" }, "关键字：", -1));
const _hoisted_6$1 = { class: "action-item" };
const _hoisted_7 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createElementVNode("div", { class: "action-item-label" }, "类型：", -1));
const _hoisted_8 = { class: "action-item" };
const _hoisted_9 = /* @__PURE__ */ _withScopeId$2(() => /* @__PURE__ */ createElementVNode("div", { class: "action-item-label" }, "包名：", -1));
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "ResourcePanel",
  setup(__props) {
    const cookEditorState = inject("cookEditorState");
    const makerList = computed(() => {
      return cookEditorState.makerList;
    });
    const result = computed(() => {
      let _res = makerList.value;
      if (types.value.length > 0) {
        _res = _res.filter((e) => types.value.includes(e.type));
      }
      if (pkgs.value.length > 0) {
        _res = _res.filter((e) => pkgs.value.includes(e.pkg));
      }
      if (pattern.value) {
        _res = _res.filter((e) => {
          return e.name.indexOf(pattern.value) > -1;
        });
      }
      return _res;
    });
    const pattern = ref("");
    const types = ref([]);
    const typeOptions = computed(() => {
      const _types = makerList.value.map((e) => e.type);
      return uniq(_types).map((e) => {
        return {
          label: e,
          value: e
        };
      });
    });
    const pkgs = ref([]);
    const pkgOptions = computed(() => {
      const _pkgs = makerList.value.map((e) => e.pkg);
      return uniq(_pkgs).map((e) => {
        return {
          label: e,
          value: e
        };
      });
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        createVNode(unref(NScrollbar), { "x-scrollable": "" }, {
          default: withCtx(() => [
            createElementVNode("div", _hoisted_2$3, [
              createElementVNode("div", _hoisted_3$3, [
                createElementVNode("div", _hoisted_4$1, [
                  _hoisted_5$1,
                  createVNode(unref(NInput), {
                    value: pattern.value,
                    "onUpdate:value": _cache[0] || (_cache[0] = ($event) => pattern.value = $event),
                    placeholder: "搜索",
                    round: "",
                    clearable: "",
                    size: "small"
                  }, {
                    prefix: withCtx(() => [
                      createVNode(unref(NIcon), null, {
                        default: withCtx(() => [
                          createVNode(unref(Search))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["value"])
                ]),
                createElementVNode("div", _hoisted_6$1, [
                  _hoisted_7,
                  createVNode(unref(NSelect), {
                    value: types.value,
                    "onUpdate:value": _cache[1] || (_cache[1] = ($event) => types.value = $event),
                    multiple: "",
                    options: typeOptions.value,
                    size: "small"
                  }, null, 8, ["value", "options"])
                ]),
                createElementVNode("div", _hoisted_8, [
                  _hoisted_9,
                  createVNode(unref(NSelect), {
                    value: pkgs.value,
                    "onUpdate:value": _cache[2] || (_cache[2] = ($event) => pkgs.value = $event),
                    multiple: "",
                    options: pkgOptions.value,
                    size: "small"
                  }, null, 8, ["value", "options"])
                ])
              ]),
              createVNode(unref(NSpace), null, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(result.value, (maker2) => {
                    return openBlock(), createBlock(ResuorceMaker, { maker: maker2 }, null, 8, ["maker"]);
                  }), 256))
                ]),
                _: 1
              })
            ])
          ]),
          _: 1
        })
      ]);
    };
  }
});
const ResourcePanel_vue_vue_type_style_index_0_scoped_2012a7da_lang = "";
const ResourcePanel = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["__scopeId", "data-v-2012a7da"]]);
const maker = definePanelMaker({
  name: "资源面板",
  pkg: name,
  defaultSplitLayoutPaneName: "bottom",
  make: () => ResourcePanel
});
function defineComponentMaker(maker2) {
  const _maker = {
    type: "component",
    ...maker2
  };
  return _maker;
}
const RootApp_vue_vue_type_style_index_0_scoped_58a5f594_lang = "";
const _sfc_main$g = {};
const _hoisted_1$6 = { class: "root-app" };
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("div", _hoisted_1$6, [
    renderSlot(_ctx.$slots, "default", {}, void 0, true)
  ]);
}
const RootApp = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render], ["__scopeId", "data-v-58a5f594"]]);
const RootAppMaker = defineComponentMaker({
  name: "主应用",
  pkg: pkgName,
  makeSlotOptions: () => ["default"],
  make: () => RootApp
});
const defaultMakerList = [
  maker$2,
  maker$1,
  ComponentEditorMaker,
  maker,
  RootAppMaker
];
function createCookPlayerState(state) {
  const _state = reactive({
    type: "player",
    makerList: defaultMakerList,
    ...state
  });
  const makerList = state.makerList || defaultMakerList;
  makerList.map((maker2) => {
    var _a;
    (_a = maker2.install) == null ? void 0 : _a.call(maker2, _state);
  });
  return reactive(_state);
}
function getCookEditorExportDataFromWindow(window2, pageUid) {
  const uniqTag = getCookEditorExportDataUniqTag(pageUid);
  const exportData2 = window2[uniqTag];
  if (exportData2) {
    return exportData2;
  }
}
const ComponentUidToInstanceMap = /* @__PURE__ */ new Map();
const ElementToComponentUidMap = /* @__PURE__ */ new Map();
const getComponentOverlayFromElement = (element, cookPlayerState) => {
  const componentConfigUid = getComponentConfigFromElement(element);
  if (componentConfigUid) {
    const componentInstance = ComponentUidToInstanceMap.get(componentConfigUid);
    if (componentInstance) {
      const rect = getComponentRect(componentInstance);
      const overlay = {
        configUid: componentConfigUid,
        pageUid: cookPlayerState.page.uid,
        rect
      };
      return overlay;
    }
  }
};
const getComponentConfigFromElement = (element) => {
  let currentEl = element;
  let currentConfig;
  while (currentEl) {
    currentConfig = ElementToComponentUidMap.get(currentEl);
    if (currentConfig) {
      break;
    }
    currentEl = currentEl.parentElement;
  }
  return currentConfig;
};
const getComponetnOverlayFromComponentConfigUid = (uid, cookPlayerState) => {
  const componentInstance = ComponentUidToInstanceMap.get(uid);
  if (componentInstance) {
    const rect = getComponentRect(componentInstance);
    const overlay = {
      configUid: uid,
      pageUid: cookPlayerState.page.uid,
      rect
    };
    return overlay;
  }
};
function exportData(cookPlayerState) {
  const data = {
    getComponetnOverlayFromElement: (element) => {
      return getComponentOverlayFromElement(element, cookPlayerState);
    },
    getComponetnOverlayFromComponentConfigUid: (uid) => {
      return getComponetnOverlayFromComponentConfigUid(uid, cookPlayerState);
    },
    setPage: (page) => {
      const jsonString = JSON.stringify(page);
      const oldJsonString = JSON.stringify(cookPlayerState.page);
      if (jsonString !== oldJsonString) {
        const _page = JSON.parse(jsonString);
        cookPlayerState.page = _page;
      }
    }
  };
  window[VueCookPlayerExportDataTag] = data;
}
function getComponentElements(instance) {
  let elements = [];
  if (isFragment(instance)) {
    elements = getFragmentElements(instance.subTree);
  } else {
    const vNode = instance.subTree;
    elements = getVNodeElement(vNode);
  }
  return elements;
}
function getVNodeElement(vnode) {
  let elements = [];
  if (vnode.type === Fragment) {
    const _elements = getFragmentElements(vnode);
    elements.push(..._elements);
  } else if (vnode.component) {
    const _elements = getComponentElements(vnode.component);
    elements.push(..._elements);
  } else if (vnode.el) {
    const el = vnode.el;
    if (el instanceof Element) {
      elements.push(el);
    }
  }
  return elements;
}
function getFragmentElements(vNode) {
  const elements = [];
  if (!vNode.children)
    return elements;
  if (Array.isArray(vNode.children)) {
    for (let i = 0, l = vNode.children.length; i < l; i++) {
      const childVnode = vNode.children[i];
      if (isVNode(childVnode)) {
        const _elements = getVNodeElement(childVnode);
        elements.push(..._elements);
      }
    }
  }
  if (!vNode.dynamicChildren)
    return elements;
  const dynamicChildren = vNode.dynamicChildren;
  if (Array.isArray(dynamicChildren)) {
    for (let i = 0, l = dynamicChildren.length; i < l; i++) {
      const childVnode = dynamicChildren[i];
      if (isVNode(childVnode)) {
        const _elements = getVNodeElement(childVnode);
        elements.push(..._elements);
      }
    }
  }
  return elements;
}
async function logicRun(cookState, config, ...payload) {
  let returns;
  const maker2 = useLogicMaker(cookState, config.makerName, config.makerPkg).value;
  if (maker2) {
    let func = maker2.make(cookState, config);
    returns = await func(...payload);
  }
  return returns;
}
const _hoisted_1$5 = { key: 1 };
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "ComponentRender",
  props: {
    config: {
      type: Object,
      required: true
    },
    dev: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    const props = __props;
    const cookPlayerState = inject("cookPlayerState");
    const { config, dev } = toRefs(props);
    const maker2 = computed(() => {
      const makerList = cookPlayerState.makerList;
      const { makerName, makerPkg } = config.value;
      const _maker = makerList.find((e) => e.name === makerName && e.pkg === makerPkg);
      return _maker;
    });
    const emits = computed(() => {
      const res = {};
      const _emits = config.value.events || {};
      for (const key in _emits) {
        if (Object.prototype.hasOwnProperty.call(_emits, key)) {
          const logidConfigList = _emits[key];
          res[key] = (...payload) => {
            logidConfigList.map((logicConfig) => {
              try {
                logicRun(cookPlayerState, logicConfig, ...payload);
              } catch (error) {
                console.error(error);
              }
            });
          };
        }
      }
      return res;
    });
    if (dev.value) {
      onMounted(() => {
        const internalInstance = getCurrentInstance();
        if (internalInstance) {
          const elements = getComponentElements(internalInstance);
          elements.forEach((el) => {
            ElementToComponentUidMap.set(el, config.value.uid);
          });
          ComponentUidToInstanceMap.set(config.value.uid, internalInstance);
        }
      });
      onUpdated(() => {
        const internalInstance = getCurrentInstance();
        if (internalInstance) {
          const elements = getComponentElements(internalInstance);
          elements.forEach((el) => {
            ElementToComponentUidMap.set(el, config.value.uid);
          });
          ComponentUidToInstanceMap.set(config.value.uid, internalInstance);
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b;
      const _component_component_render = resolveComponent("component-render", true);
      return maker2.value ? (openBlock(), createBlock(resolveDynamicComponent(maker2.value.make(unref(cookPlayerState), unref(config))), mergeProps({ key: 0 }, (_a = unref(config)) == null ? void 0 : _a.props, toHandlers(emits.value), {
        uid: unref(config).uid
      }), createSlots({ _: 2 }, [
        renderList((_b = unref(config)) == null ? void 0 : _b.slots, (slot, name2) => {
          return {
            name: name2,
            fn: withCtx(() => [
              (openBlock(true), createElementBlock(Fragment, null, renderList(slot, (_config) => {
                return openBlock(), createBlock(_component_component_render, {
                  config: _config,
                  dev: unref(dev)
                }, null, 8, ["config", "dev"]);
              }), 256))
            ])
          };
        })
      ]), 1040, ["uid"])) : (openBlock(), createElementBlock("span", _hoisted_1$5, toDisplayString(unref(config).makerPkg) + " - " + toDisplayString(unref(config).makerName) + "没有找到", 1));
    };
  }
});
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    state: {},
    preview: {}
  },
  setup(__props) {
    const props = __props;
    let dev = ref(false);
    const { state, preview } = toRefs(props);
    provide("cookPlayerState", state.value);
    if (preview.value) {
      exportData(state.value);
      dev.value = true;
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$f, {
        config: unref(state).page.component,
        dev: unref(dev)
      }, null, 8, ["config", "dev"]);
    };
  }
});
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "CookPlayerWrapper",
  props: {
    state: {
      type: Object,
      required: true
    },
    preview: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const { preview, state } = toRefs(props);
    const exportData2 = getCookEditorExportDataFromWindow(window.parent, preview.value);
    watch(() => state.value.page, () => {
      exportData2 == null ? void 0 : exportData2.setPage(state.value.page);
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$e, {
        state: unref(state),
        preview: unref(preview)
      }, null, 8, ["state", "preview"]);
    };
  }
});
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    state: {
      type: Object,
      required: true
    },
    preview: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const { preview, state } = toRefs(props);
    const exportData2 = getCookEditorExportDataFromWindow(window.parent, preview.value);
    const page = exportData2 == null ? void 0 : exportData2.getPage();
    let playerState;
    if (page) {
      playerState = createCookPlayerState({
        page,
        makerList: state.value.makerList
      });
    }
    return (_ctx, _cache) => {
      return unref(playerState) ? (openBlock(), createBlock(_sfc_main$d, {
        key: 0,
        state: unref(playerState),
        preview: unref(preview)
      }, null, 8, ["state", "preview"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
        createTextVNode("没有找到id为" + toDisplayString(unref(preview)) + "的页面", 1)
      ], 64));
    };
  }
});
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "PanelRender",
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { config } = toRefs(props);
    const maker2 = usePanelMaker(cookEditorState, config.value.makerName, config.value.makerPkg);
    const panel = computed(() => {
      var _a;
      return (_a = maker2 == null ? void 0 : maker2.value) == null ? void 0 : _a.make(cookEditorState, config.value);
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(panel.value));
    };
  }
});
const _withScopeId$1 = (n) => (pushScopeId("data-v-bb87c6c5"), n = n(), popScopeId(), n);
const _hoisted_1$4 = { class: "panel-list" };
const _hoisted_2$2 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ createElementVNode("div", { class: "title" }, [
  /* @__PURE__ */ createElementVNode("div", null, "无面板")
], -1));
const _hoisted_3$2 = { class: "content" };
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "PanelList",
  props: {
    list: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { list } = toRefs(props);
    const currentUid = ref();
    watch(list, () => {
      if (list.value.length > 0) {
        if (!currentUid.value) {
          currentUid.value = list.value[0].uid;
        } else {
          const length = list.value.length;
          currentUid.value = list.value[length - 1].uid;
        }
      } else {
        currentUid.value = void 0;
      }
    }, {
      deep: true,
      immediate: true
    });
    const useTitle = (panelConfig) => {
      var _a;
      const maker2 = usePanelMaker(cookEditorState, panelConfig.makerName, panelConfig.makerPkg).value;
      return ((_a = maker2 == null ? void 0 : maker2.makeTitle) == null ? void 0 : _a.call(maker2, cookEditorState, panelConfig)) || (maker2 == null ? void 0 : maker2.name) || "未识别的面板";
    };
    const handleClose = (name2) => {
      const panelConfig = list.value.find((e) => e.uid === name2);
      if (panelConfig) {
        layoutRemoveTab(cookEditorState, panelConfig);
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        unref(list).length <= 0 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
          _hoisted_2$2,
          createElementVNode("div", _hoisted_3$2, [
            createVNode(unref(NEmpty), { description: "没有打开的面板" })
          ])
        ], 64)) : (openBlock(), createBlock(unref(NTabs), {
          key: 1,
          type: "card",
          size: "small",
          value: currentUid.value,
          "onUpdate:value": _cache[0] || (_cache[0] = ($event) => currentUid.value = $event),
          onClose: handleClose,
          style: { height: "100%", display: "flex", flexDirection: " column" },
          "pane-style": { flexGrow: 1, padding: 0, overflow: "hidden" }
        }, {
          default: withCtx(() => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(list), (l) => {
              return openBlock(), createBlock(unref(NTabPane), {
                name: l.uid,
                closable: !l.alwaysOpen,
                "display-directive": "show"
              }, {
                tab: withCtx(() => [
                  createElementVNode("div", null, toDisplayString(useTitle(l)), 1)
                ]),
                default: withCtx(() => [
                  createVNode(_sfc_main$b, { config: l }, null, 8, ["config"])
                ]),
                _: 2
              }, 1032, ["name", "closable"]);
            }), 256))
          ]),
          _: 1
        }, 8, ["value"]))
      ]);
    };
  }
});
const PanelList_vue_vue_type_style_index_0_scoped_bb87c6c5_lang = "";
const PanelList = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-bb87c6c5"]]);
const _hoisted_1$3 = { class: "cook-editor" };
const _hoisted_2$1 = { class: "left-pane" };
const _hoisted_3$1 = { class: "center-bottom-pane" };
const _hoisted_4 = { class: "center-pane" };
const _hoisted_5 = { class: "bottom-pane" };
const _hoisted_6 = {
  class: "right-pane",
  "min-size": "15",
  size: "20"
};
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    state: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const { state } = toRefs(props);
    provide("cookEditorState", state.value);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NConfigProvider), {
        locale: unref(zhCN),
        "date-locale": unref(dateZhCN),
        style: { "height": "100%" }
      }, {
        default: withCtx(() => [
          createElementVNode("div", _hoisted_1$3, [
            createElementVNode("div", _hoisted_2$1, [
              createVNode(PanelList, {
                list: unref(state).layout.left
              }, null, 8, ["list"])
            ]),
            createElementVNode("div", _hoisted_3$1, [
              createElementVNode("div", _hoisted_4, [
                createVNode(PanelList, {
                  list: unref(state).layout.center
                }, null, 8, ["list"])
              ]),
              createElementVNode("div", _hoisted_5, [
                createVNode(PanelList, {
                  list: unref(state).layout.bottom
                }, null, 8, ["list"])
              ])
            ]),
            createElementVNode("div", _hoisted_6, [
              createVNode(PanelList, {
                list: unref(state).layout.right
              }, null, 8, ["list"])
            ])
          ])
        ]),
        _: 1
      }, 8, ["locale", "date-locale"]);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_f43a3cde_lang = "";
const InsideEditor = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-f43a3cde"]]);
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    state: {
      type: Object,
      required: true
    },
    preview: {
      type: String
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return __props.preview ? (openBlock(), createBlock(_sfc_main$c, {
        key: 0,
        state: __props.state,
        preview: __props.preview
      }, null, 8, ["state", "preview"])) : (openBlock(), createBlock(InsideEditor, {
        key: 1,
        state: __props.state
      }, null, 8, ["state"]));
    };
  }
});
const handleDrop = (cookEditorState, e, callBack) => {
  const data = getMakerDataFromDragEvent(e);
  if (!data) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  const makerName = data.name;
  const makerPkg = data.package;
  const maker2 = useComponentMaker(cookEditorState, makerName, makerPkg);
  if (!maker2.value) {
    return;
  }
  const componentConfig = makeDefaultComponentConfig(maker2.value);
  callBack(componentConfig);
  if (e.target && e.target instanceof HTMLElement) {
    e.target.classList.remove("dragenter");
  }
};
const handleDrop$1 = handleDrop;
const handleDragOver = (e) => {
  e.preventDefault();
  if (e.dataTransfer) {
    if (!e.dataTransfer.types.includes(VueCookComponentMakerDraggerTag)) {
      e.dataTransfer.dropEffect = "none";
    }
  }
};
const handleDragOver$1 = handleDragOver;
function handleDragEnter(e) {
  if (e.dataTransfer) {
    if (e.dataTransfer.types.includes(VueCookComponentMakerDraggerTag)) {
      if (e.target && e.target instanceof HTMLElement) {
        e.target.classList.add("dragenter");
      }
    }
  }
}
function handleDragLeave(e) {
  if (e.target && e.target instanceof HTMLElement) {
    e.target.classList.remove("dragenter");
  }
}
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "index",
  emits: ["drop"],
  setup(__props, { emit: emits }) {
    const cookEditorState = inject("cookEditorState");
    const dropCallBack = (componentConfig) => {
      emits("drop", componentConfig);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "component-dragger",
        onDrop: _cache[0] || (_cache[0] = ($event) => unref(handleDrop$1)(unref(cookEditorState), $event, dropCallBack)),
        onDragover: _cache[1] || (_cache[1] = ($event) => unref(handleDragOver$1)($event)),
        onDragenter: _cache[2] || (_cache[2] = ($event) => unref(handleDragEnter)($event)),
        onDragleave: _cache[3] || (_cache[3] = ($event) => unref(handleDragLeave)($event))
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createTextVNode("拖拽组件到此处添加")
        ], true)
      ], 32);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_d5805181_lang = "";
const ComponentDragger = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-d5805181"]]);
const _hoisted_1$2 = ["draggable", "data-type", "data-name", "data-package"];
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "index",
  props: {
    maker: {}
  },
  setup(__props) {
    const props = __props;
    const cookEditorState = inject("cookEditorState");
    const { maker: _maker } = toRefs(props);
    const maker2 = _maker;
    const draggable = computed(() => {
      return maker2.value.type === "component" || maker2.value.type === "logic";
    });
    const handleDragStart = (e) => {
      var _a, _b, _c, _d, _e;
      if (!(e.target instanceof HTMLDivElement)) {
        return;
      }
      (_a = e == null ? void 0 : e.dataTransfer) == null ? void 0 : _a.setData("name", maker2.value.name);
      (_b = e == null ? void 0 : e.dataTransfer) == null ? void 0 : _b.setData("package", maker2.value.pkg);
      (_c = e == null ? void 0 : e.dataTransfer) == null ? void 0 : _c.setData("type", maker2.value.type);
      if (maker2.value.type === "logic") {
        (_d = e == null ? void 0 : e.dataTransfer) == null ? void 0 : _d.setData(VueCookLogicMakerDraggerTag, VueCookLogicMakerDraggerTag);
      }
      if (maker2.value.type === "component") {
        (_e = e == null ? void 0 : e.dataTransfer) == null ? void 0 : _e.setData(VueCookComponentMakerDraggerTag, VueCookComponentMakerDraggerTag);
      }
    };
    const handelClick = () => {
      if (maker2.value.type === "panel") {
        const _maker2 = maker2.value;
        const config = makeDefaultPanelConfig(_maker2);
        const defaultSplitLayoutPaneName = _maker2.defaultSplitLayoutPaneName;
        layoutAddTab(cookEditorState, config, defaultSplitLayoutPaneName);
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["resource-maker", [unref(maker2).type]]),
        draggable: draggable.value,
        onDragstart: handleDragStart,
        onClick: handelClick,
        "data-type": unref(maker2).type,
        "data-name": unref(maker2).name,
        "data-package": unref(maker2).pkg
      }, [
        renderSlot(_ctx.$slots, "default", {}, () => [
          createTextVNode(toDisplayString(unref(maker2).name) + "-" + toDisplayString(unref(maker2).pkg), 1)
        ], true)
      ], 42, _hoisted_1$2);
    };
  }
});
const index_vue_vue_type_style_index_0_scoped_872c8cde_lang = "";
const ResourceMaker = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-872c8cde"]]);
function listToTree(list) {
  const idToIndex = {};
  let node = void 0;
  let roots = [];
  const initList = list.map((e, i) => {
    idToIndex[e.id] = i;
    return { ...e, children: [] };
  });
  for (let i = 0; i < initList.length; i += 1) {
    node = initList[i];
    if (node.isLeaf) {
      node.children = void 0;
    }
    if (node.isRoot) {
      roots.push(node);
    } else {
      initList[idToIndex[node.parentId]].children.push(node);
    }
  }
  return roots;
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "file-tree",
  setup(__props) {
    const studioState = inject("studioState");
    const { fs, volume } = studioState;
    const modules = ref(volume.toJSON());
    fs.watch("/", {}, () => {
      console.log("fs-change:");
      modules.value = volume.toJSON();
    });
    const selectedKeys = ref([]);
    const getAllPaths = (filePath) => {
      const allPathPoints = filePath.split("/");
      let allPaths = [];
      allPathPoints.map((_key, index) => {
        allPaths[index] = allPathPoints.slice(0, index + 1).join("/");
      });
      return allPaths;
    };
    const isDir = (path2) => {
      if (!fs.existsSync(path2)) {
        return false;
      }
      const isFile = fs.lstatSync(path2).isFile();
      if (!isFile) {
        return true;
      }
      return false;
    };
    const treeFlattedData = {};
    Object.keys(modules.value).forEach((key) => {
      const allPaths = getAllPaths(key);
      const length = allPaths.length;
      allPaths.map((e, i) => {
        const allPathPoints = e.split("/");
        treeFlattedData[e] = {
          id: e,
          key: e,
          parentId: allPaths[i - 1],
          isLeaf: i === length - 1,
          isRoot: i === 0,
          label: allPathPoints[allPathPoints.length - 1],
          value: e,
          prefix: () => {
            if (isDir(e)) {
              return h(NIcon, null, {
                default: () => h(Folder)
              });
            }
          }
        };
      });
    });
    const list = Object.keys(treeFlattedData).map((e) => treeFlattedData[e]);
    const treeData = listToTree(list);
    const data = ref(treeData);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NTree), {
        "block-line": "",
        "expand-on-click": "",
        data: data.value,
        "selected-keys": selectedKeys.value,
        "onUpdate:selectedKeys": _cache[0] || (_cache[0] = (keys) => {
          selectedKeys.value = keys;
          const willEditKey = selectedKeys.value[0];
          const file = unref(studioState).currentEditFiles.files.find((e) => e === willEditKey);
          if (isDir(willEditKey)) {
            return;
          }
          if (!file) {
            unref(studioState).currentEditFiles = {
              ...unref(studioState).currentEditFiles,
              files: [...unref(studioState).currentEditFiles.files, willEditKey]
            };
          }
          unref(studioState).currentEditFiles = {
            ...unref(studioState).currentEditFiles,
            activeFilePath: willEditKey
          };
        })
      }, null, 8, ["data", "selected-keys"]);
    };
  }
});
const _hoisted_1$1 = { class: "left-content" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "left-pane",
  setup(__props) {
    const selectedKey = ref("resource-manager");
    const selectedContent = computed(() => {
      var _a;
      const content = (_a = menuOptions.find((e) => e.key === selectedKey.value)) == null ? void 0 : _a.content;
      return content;
    });
    const renderIcon = (icon) => {
      return () => h(NIcon, null, { default: () => h(icon) });
    };
    const menuOptions = [
      {
        label: "资源管理器",
        key: "resource-manager",
        icon: renderIcon(DocumentsOutline),
        content: _sfc_main$5
      },
      {
        label: "搜索",
        key: "search",
        icon: renderIcon(SearchOutline),
        content: SearchOutline
      }
    ];
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NLayout), { "has-sider": "" }, {
        default: withCtx(() => [
          createVNode(unref(NLayoutSider), {
            bordered: "",
            width: 64
          }, {
            default: withCtx(() => [
              createVNode(unref(NMenu), {
                options: menuOptions,
                collapsed: true,
                "collapsed-width": 64,
                "collapsed-icon-size": 22,
                value: selectedKey.value,
                "onUpdate:value": _cache[0] || (_cache[0] = ($event) => selectedKey.value = $event)
              }, null, 8, ["value"])
            ]),
            _: 1
          }),
          createVNode(unref(NLayout), null, {
            default: withCtx(() => [
              createElementVNode("div", _hoisted_1$1, [
                (openBlock(), createBlock(resolveDynamicComponent(selectedContent.value)))
              ])
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
});
let _envInited = false;
function useMonaco() {
  if (!_envInited) {
    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === "json") {
          return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
          return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
          return new tsWorker();
        }
        return new editorWorker();
      }
    };
    _envInited = true;
  }
  return monaco;
}
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "monaco-editor",
  props: {
    value: {},
    language: {}
  },
  emits: ["update:value"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const editorContainerRef = ref();
    const monaco2 = useMonaco();
    const { value, language } = toRefs(props);
    let editor = void 0;
    onMounted(() => {
      if (editorContainerRef.value) {
        setTimeout(() => {
          if (editorContainerRef.value) {
            editor = monaco2.editor.create(editorContainerRef.value, {
              value: value.value,
              language: language.value
            });
            editor.onDidChangeModelContent(() => {
              const value2 = editor == null ? void 0 : editor.getValue();
              emits("update:value", value2 || "");
            });
          }
        });
      }
    });
    watch(value, (value2) => {
      if (!editor) {
        return;
      }
      const oldValue = editor == null ? void 0 : editor.getValue();
      if (value2 !== oldValue) {
        editor.setValue(value2);
      }
    });
    watch(language, (language2) => {
      if (!editor) {
        return;
      }
      const editorModel = editor.getModel();
      if (editorModel) {
        monaco2.editor.setModelLanguage(editorModel, language2);
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "editorContainerRef",
        ref: editorContainerRef,
        class: "monaco-editor"
      }, null, 512);
    };
  }
});
const monacoEditor_vue_vue_type_style_index_0_scoped_721fea00_lang = "";
const MonacoEditor = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-721fea00"]]);
const getExtName = (name2) => {
  const allPathPoints = name2.split(".");
  const extName = allPathPoints[allPathPoints.length - 1];
  return extName;
};
const getLanguage = (extName) => {
  const map = {
    ts: "typescript",
    js: "javascript",
    map: "json"
  };
  return map[extName] || extName;
};
const createStudioState = (dataJson) => {
  const vol = new Volume();
  vol.fromJSON(dataJson);
  const fs = createFsFromVolume(vol);
  const state = {
    fs: markRaw(fs),
    volume: markRaw(vol),
    path: markRaw({ ...path }),
    currentEditFiles: {
      files: []
    }
  };
  const stateRef = reactive(state);
  return stateRef;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "file-editor",
  props: {
    value: {},
    name: {}
  },
  emits: ["update:value"],
  setup(__props, { emit: emits }) {
    const props = __props;
    const { value, name: name2 } = toRefs(props);
    const language = computed(() => {
      const extName = getExtName(name2.value);
      const lang = getLanguage(extName);
      return lang;
    });
    const onValueChange = (value2) => {
      emits("update:value", value2);
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(MonacoEditor, {
        value: unref(value),
        language: language.value,
        "onUpdate:value": onValueChange
      }, null, 8, ["value", "language"]);
    };
  }
});
const fileEditor_vue_vue_type_style_index_0_scoped_ad1a7181_lang = "";
const FileEditor = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-ad1a7181"]]);
const _withScopeId = (n) => (pushScopeId("data-v-b87de930"), n = n(), popScopeId(), n);
const _hoisted_1 = { class: "panel-list" };
const _hoisted_2 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createElementVNode("div", { class: "title" }, [
  /* @__PURE__ */ createElementVNode("div", null, "无面板")
], -1));
const _hoisted_3 = { class: "content" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "center-pane",
  setup(__props) {
    const studioState = inject("studioState");
    const { fs } = studioState;
    const { currentEditFiles } = toRefs(studioState);
    const files = computed(() => {
      var _a;
      return ((_a = currentEditFiles == null ? void 0 : currentEditFiles.value) == null ? void 0 : _a.files) || [];
    });
    const panelList = computed(() => {
      console.log(files);
      return files.value.map((f) => {
        const value = fs.readFileSync(f, { encoding: "utf-8" });
        const panelConfig = {
          uid: f,
          title: f,
          content: () => h(FileEditor, {
            value,
            name: f
          })
        };
        return panelConfig;
      });
    });
    const currentUid = ref();
    watch(files, () => {
      if (files.value.length > 0) {
        if (!currentUid.value) {
          currentUid.value = files.value[0];
        } else {
          const length = files.value.length;
          currentUid.value = files.value[length - 1];
        }
      } else {
        currentUid.value = void 0;
      }
    }, {
      deep: true,
      immediate: true
    });
    const handleClose = (name2) => {
      if (studioState.currentEditFiles) {
        const panelConfig = files.value.find((e) => e === name2);
        if (panelConfig) {
          studioState.currentEditFiles = {
            ...studioState.currentEditFiles,
            files: studioState.currentEditFiles.files.filter((e) => e !== name2)
          };
        }
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        files.value.length <= 0 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
          _hoisted_2,
          createElementVNode("div", _hoisted_3, [
            createVNode(unref(NEmpty), { description: "没有打开的面板" })
          ])
        ], 64)) : (openBlock(), createBlock(unref(NTabs), {
          key: 1,
          size: "small",
          type: "card",
          value: currentUid.value,
          "onUpdate:value": _cache[0] || (_cache[0] = ($event) => currentUid.value = $event),
          closable: "",
          onClose: handleClose,
          style: { height: "100%", display: "flex", flexDirection: " column" },
          "pane-style": { flexGrow: 1, padding: 0, overflow: "hidden" }
        }, {
          default: withCtx(() => [
            (openBlock(true), createElementBlock(Fragment, null, renderList(panelList.value, (l) => {
              return openBlock(), createBlock(unref(NTabPane), {
                name: l.uid,
                "display-directive": "show"
              }, {
                tab: withCtx(() => [
                  createElementVNode("div", null, toDisplayString(l.title), 1)
                ]),
                default: withCtx(() => [
                  (openBlock(), createBlock(KeepAlive, null, [
                    (openBlock(), createBlock(resolveDynamicComponent(l.content)))
                  ], 1024))
                ]),
                _: 2
              }, 1032, ["name"]);
            }), 256))
          ]),
          _: 1
        }, 8, ["value"]))
      ]);
    };
  }
});
const centerPane_vue_vue_type_style_index_0_scoped_b87de930_lang = "";
const CenterPane = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-b87de930"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const a = ref("sss");
    const studioState = createStudioState({
      "./src/index.js": `
import React from 'react';
import {render} from 'react-dom';
import {App} from './components/app';

const el = document.createElement('div');
document.body.appendChild(el);
render(el, React.createElement(App, {}));
`,
      "./README.md": `
# Hello World

This is some super cool project.
`,
      ".node_modules/EMPTY": ""
    });
    provide("studioState", studioState);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(NConfigProvider), {
        locale: unref(zhCN),
        "date-locale": unref(dateZhCN),
        style: { "height": "100%" }
      }, {
        default: withCtx(() => [
          createTextVNode(toDisplayString(a.value) + " ", 1),
          createVNode(unref(Splitpanes), { class: "cook-studio default-theme" }, {
            default: withCtx(() => [
              createVNode(unref(Pane), {
                class: "left-pane",
                "min-size": "15",
                size: "20"
              }, {
                default: withCtx(() => [
                  createVNode(_sfc_main$4)
                ]),
                _: 1
              }),
              createVNode(unref(Pane), {
                class: "center-bottom-pane",
                "min-size": "15",
                size: "60"
              }, {
                default: withCtx(() => [
                  createVNode(unref(Splitpanes), { horizontal: "" }, {
                    default: withCtx(() => [
                      createVNode(unref(Pane), {
                        class: "center-pane",
                        "min-size": "15"
                      }, {
                        default: withCtx(() => [
                          createVNode(CenterPane)
                        ]),
                        _: 1
                      }),
                      createVNode(unref(Pane), {
                        class: "bottom-pane",
                        "min-size": "15",
                        size: "20"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" bottom ")
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(unref(Pane), {
                class: "right-pane",
                "min-size": "15",
                size: "20"
              }, {
                default: withCtx(() => [
                  createTextVNode(" right ")
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["locale", "date-locale"]);
    };
  }
});
const index_vue_vue_type_style_index_0_lang = "";
const resourcePanelConfig = makeDefaultPanelConfig(maker);
resourcePanelConfig.alwaysOpen = true;
const defaultSplitLayout = {
  "left": [
    makeDefaultPanelConfig(maker$2)
  ],
  "center": [],
  "bottom": [
    resourcePanelConfig
  ],
  "right": [
    makeDefaultPanelConfig(ComponentEditorMaker)
  ]
};
function createCookEditorState(state) {
  state = state || {};
  const _state = reactive({
    type: "editor",
    makerList: defaultMakerList,
    pages: [],
    layout: defaultSplitLayout,
    ...state
  });
  const makerList = state.makerList || defaultMakerList;
  makerList.map((maker2) => {
    var _a;
    (_a = maker2.install) == null ? void 0 : _a.call(maker2, _state);
  });
  return _state;
}
function defineLogicMaker(maker2) {
  const _maker = {
    type: "logic",
    ...maker2
  };
  return _maker;
}
export {
  ComponentDragger,
  ComponentEditorMaker,
  _sfc_main$8 as CookEditor,
  _sfc_main$e as CookPlayer,
  LogicDragger,
  maker$2 as PageComponentTreeMaker,
  maker$1 as PageEditorMaker,
  ResourceMaker,
  maker as ResourcePanelMaker,
  RootAppMaker,
  _sfc_main as Studio,
  addComponentConfig,
  createCookEditorState,
  createCookPlayerState,
  defaultMakerList,
  defaultSplitLayout,
  defineComponentMaker,
  defineLogicMaker,
  definePanelMaker,
  findComponentConfig,
  findPanelConfig,
  isLogicConfig,
  layoutAddTab,
  layoutRemoveTab,
  logicRun,
  makeDefaultComponentConfig,
  makeDefaultLogicConfig,
  makeDefaultPanelConfig,
  parseLogicConfig,
  removeComponentConfig,
  useComponentFocused,
  useComponentMaker,
  useComponentMakerList,
  useComponentPickerEnable,
  useComponentSelected,
  useLogicMaker,
  useLogicMakerList,
  usePageEditingUidList,
  usePanelMaker,
  usePanelMakerList,
  useSlotOptions
};
