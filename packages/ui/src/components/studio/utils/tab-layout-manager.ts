import { v4 as uuidv4 } from 'uuid'

// TODO:应用TabLayoutManager到studio中
// TODO:需要一个简单的事件机制
export class TabLayoutManager<T = any> {
  #tabMap: Map<string, ITab> = new Map()
  #tabDataMap: Map<string, T> = new Map()
  #tabContainerMap: Map<string, ITabContaienr> = new Map()
  #tabLayoutMap: Map<string, ITabLayoutHorizontal | ITabLayoutVertical> = new Map()
  #rootLayout: ITabLayoutHorizontal
  #currentTabContaienrKey?: string
  constructor() {
    this.#rootLayout = {
      key: this.#genTabLayoutKey(),
      type: 'TabLayoutHorizontal'
    }
    this.#tabLayoutMap.set(this.#rootLayout.key, this.#rootLayout)
  }
  #genKey(prefix: string) {
    return `${prefix}-${uuidv4()}`
  }
  #genTabKey() {
    return this.#genKey('tab')
  }
  #genTabContainerKey() {
    return this.#genKey('tab-container')
  }
  #genTabLayoutKey() {
    return this.#genKey('tab-layout')
  }
  getTabData(key: string) {
    return this.#tabDataMap.get(key)
  }
  addTab(data: T) {
    const tabKey = this.#genTabKey()
    if (!this.#currentTabContaienrKey) {
      const tabContainerkey = this.#genTabContainerKey()
      const tab: ITab = {
        tabContaienrKey: tabContainerkey,
        key: tabKey,
        type: 'Tab'
      }
      const tabContainer: ITabContaienr = {
        key: tabContainerkey,
        tabKeys: [tab.key],
        currentTabKey: tab.key,
        layout: {
          key: this.#rootLayout.key,
          type: this.#rootLayout.type,
          position: 'top'
        },
        type: 'TabContaienr'
      }
      this.#rootLayout.top = tabContainer
      this.#tabContainerMap.set(tabContainerkey, tabContainer)
      this.#tabMap.set(tabKey, tab)
      this.#tabDataMap.set(tabKey, data)
      return tab
    }
    const tabContainer = this.#tabContainerMap.get(this.#currentTabContaienrKey)
    if (!tabContainer) {
      return
    }
    const tab: ITab = {
      tabContaienrKey: this.#currentTabContaienrKey,
      key: tabKey,
      type: 'Tab'
    }
    this.#tabMap.set(tabKey, tab)
    this.#tabDataMap.set(tabKey, data)
    this.#tabContainerMap.set(this.#currentTabContaienrKey, {
      ...tabContainer,
      tabKeys: [...tabContainer.tabKeys, tabKey],
      currentTabKey: tabKey
    })
  }
  moveTab(tabKey: string, targetTabContaienrKey: string, afterTabKey?: string) {
    const tab = this.#tabMap.get(tabKey)
    if (!tab) {
      return
    }
    const targetTabContaienr = this.#tabContainerMap.get(targetTabContaienrKey)
    if (!targetTabContaienr) {
      return
    }
    const oldTabContainer = this.#tabContainerMap.get(tab.tabContaienrKey)
    if (!oldTabContainer) {
      return
    }
    this.#tabMap.set(tabKey, {
      ...tab,
      tabContaienrKey: targetTabContaienrKey
    })
    let targetTabContaienrTabKeys = [...targetTabContaienr.tabKeys]
    if (afterTabKey) {
      const afterTabKeyIndex = targetTabContaienrTabKeys.findIndex((e) => e === afterTabKey)
      if (afterTabKeyIndex > -1) {
        targetTabContaienrTabKeys = [...targetTabContaienrTabKeys].splice(
          afterTabKeyIndex + 1,
          0,
          tabKey
        )
      } else {
        targetTabContaienrTabKeys = [...targetTabContaienrTabKeys, tabKey]
      }
    } else {
      targetTabContaienrTabKeys = [...targetTabContaienrTabKeys, tabKey]
    }
    this.#tabContainerMap.set(targetTabContaienrKey, {
      ...targetTabContaienr,
      tabKeys: targetTabContaienrTabKeys
    })
    this.#tabContainerMap.set(oldTabContainer.key, {
      ...oldTabContainer,
      tabKeys: oldTabContainer.tabKeys.filter((e) => e !== tabKey)
    })
  }
  removeTab(tabKey: string, targetTabContaienrKey: string) {
    const tab = this.#tabMap.get(tabKey)
    if (!tab) {
      return
    }
    const targetTabContaienr = this.#tabContainerMap.get(targetTabContaienrKey)
    if (!targetTabContaienr) {
      return
    }
    if (tab.tabContaienrKey !== targetTabContaienr.key) {
      return
    }
    this.#tabContainerMap.set(targetTabContaienr.key, {
      ...targetTabContaienr,
      tabKeys: targetTabContaienr.tabKeys.filter((e) => e === tabKey)
    })
    this.#tabMap.delete(tabKey)
  }
  updateTabData(key: string, data: T) {
    const tab = this.#tabMap.get(key)
    if (!tab) {
      return
    }
    this.#tabDataMap.set(key, data)
  }
  splitTab(
    tabKey: string,
    formTabContainerKey: string,
    alignTabContaienrKey: string,
    alignType: 'left' | 'right' | 'bottom' | 'top'
  ) {
    const tab = this.#tabMap.get(tabKey)
    if (!tab) {
      return
    }
    const formTabContainer = this.#tabContainerMap.get(formTabContainerKey)
    if (!formTabContainer) {
      return
    }
    const alignTabContaienr = this.#tabContainerMap.get(alignTabContaienrKey)
    if (!alignTabContaienr) {
      return
    }
    const tagretLayout = this.#tabLayoutMap.get(alignTabContaienr.layout.key)
    if (!tagretLayout) {
      return
    }
    formTabContainer.tabKeys = formTabContainer.tabKeys.filter((e) => e !== tabKey)
    const layoutKey = this.#genTabLayoutKey()
    const insertTabContainer: Omit<ITabContaienr, 'layout'> = {
      key: this.#genTabContainerKey(),
      type: 'TabContaienr',
      currentTabKey: tabKey,
      tabKeys: [tabKey]
    }
    const getLayoutByAlignType: Record<
      typeof alignType,
      () => ITabLayoutHorizontal | ITabLayoutVertical
    > = {
      top: () => {
        const layout: ITabLayoutHorizontal = {
          type: 'TabLayoutHorizontal',
          key: layoutKey,
          top: {
            ...insertTabContainer,
            layout: {
              key: layoutKey,
              type: 'TabLayoutHorizontal',
              position: 'top'
            }
          },
          bottom: {
            ...alignTabContaienr,
            layout: {
              key: layoutKey,
              type: 'TabLayoutHorizontal',
              position: 'bottom'
            }
          }
        }
        return layout
      },
      left: () => {
        const layout: ITabLayoutVertical = {
          type: 'TabLayoutVertical',
          key: layoutKey,
          left: {
            ...insertTabContainer,
            layout: {
              key: layoutKey,
              type: 'TabLayoutVertical',
              position: 'left'
            }
          },
          right: {
            ...alignTabContaienr,
            layout: {
              key: layoutKey,
              type: 'TabLayoutVertical',
              position: 'right'
            }
          }
        }
        return layout
      },
      right: () => {
        const layout: ITabLayoutVertical = {
          type: 'TabLayoutVertical',
          key: layoutKey,
          left: {
            ...alignTabContaienr,
            layout: {
              key: layoutKey,
              type: 'TabLayoutVertical',
              position: 'left'
            }
          },
          right: {
            ...insertTabContainer,
            layout: {
              key: layoutKey,
              type: 'TabLayoutVertical',
              position: 'right'
            }
          }
        }
        return layout
      },
      bottom: () => {
        const layout: ITabLayoutHorizontal = {
          type: 'TabLayoutHorizontal',
          key: layoutKey,
          top: {
            ...alignTabContaienr,
            layout: {
              key: layoutKey,
              type: 'TabLayoutHorizontal',
              position: 'top'
            }
          },
          bottom: {
            ...insertTabContainer,
            layout: {
              key: layoutKey,
              type: 'TabLayoutHorizontal',
              position: 'bottom'
            }
          }
        }
        return layout
      }
    }

    const layout = getLayoutByAlignType[alignType]()
    // @ts-ignore
    tagretLayout[alignTabContaienr.layout.position] = layout

    this.#tabLayoutMap.set(layoutKey, layout)
  }
}

export interface ITab {
  key: string
  type: 'Tab'
  tabContaienrKey: string
}
export interface ITabContaienr {
  key: string
  type: 'TabContaienr'
  currentTabKey: string
  tabKeys: string[]
  layout:
    | {
        key: string
        type: 'TabLayoutHorizontal'
        position: 'top' | 'bottom'
      }
    | {
        key: string
        type: 'TabLayoutVertical'
        position: 'left' | 'right'
      }
}

export interface ITabLayoutHorizontal {
  key: string
  type: 'TabLayoutHorizontal'
  top?: ITabContaienr | ITabLayoutVertical
  bottom?: ITabContaienr | ITabLayoutVertical
}

export interface ITabLayoutVertical {
  key: string
  type: 'TabLayoutVertical'
  left?: ITabContaienr | ITabLayoutVertical
  right?: ITabContaienr | ITabLayoutVertical
}
