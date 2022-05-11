export default {
  ////////////////////////////////////////////////////
  data: () => ({
    myCurrentItemName: undefined
  }),
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "data": {
      type: Array
    },
    "currentName": {
      type: String
    },
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    "keepStatusTo": {
      type: String
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    GUILayout() {
      return {
        type: "cols",
        border: true,
        blocks: [
          {
            type: "rows",
            size: "30%",
            border: true,
            blocks: [
              {
                name: "menu",
                size: "0.42rem",
                body: "menu"
              },
              {
                name: "list",
                body: "list"
              }
            ]
          },
          {
            name: "form",
            body: "form"
          }
        ]
      }
    },
    //------------------------------------------------
    GUISchema() {
      return {
        "menu": {
          comType: "TiActionbar",
          comConf: {
            className: "pad-hs",
            items: this.ActionMenuItems,
            status: this.ActionMenuStatus
          }
        },
        "list": {
          comType: "TiList",
          comConf: {
            data: this.ReactItemList,
            display: ["<icon>", "name"],
            rowNumberBase: 1,
            currentId: this.myCurrentItemName,
            idBy: "name",
            puppetMode: true,
            dftLabelHoverCopy: false
          }
        },
        "form": {
          comType: "HmReactItem",
          comConf: {
            data: this.CurrentReactItemData
          }
        }
      }
    },
    //------------------------------------------------
    ActionMenuItems() {
      return [
        {
          icon: "zmdi-plus",
          text: "新建执行项",
          action: () => {
            this.doCreateNewItem()
          }
        },
        {},
        {
          icon: "zmdi-delete",
          enabled: {
            hasCurrent: true
          },
          action: () => {
            this.doRemoveCurrentItem()
          }
        },
        {},
        {
          icon: "fas-long-arrow-alt-up",
          enabled: {
            hasCurrent: true
          },
          disabled: {
            atFirst: true
          },
          action: () => {
            this.doMoveCurrentUp()
          }
        },
        {
          icon: "fas-long-arrow-alt-down",
          enabled: {
            hasCurrent: true
          },
          disabled: {
            atLast: true
          },
          action: () => {
            this.doMoveCurrentDown()
          }
        }
      ]
    },
    //------------------------------------------------
    ActionMenuStatus() {
      return {
        hasCurrent: this.hasCurrentItem,
        atFirst: this.isCurrentAtFirst,
        atLast: this.isCurrentAtLast
      }
    },
    //------------------------------------------------
    hasCurrentItem() { return this.CurrentReactItem ? true : false },
    isEmpty() { return _.isEmpty(this.data) },
    LastItemIndex() {
      return this.hasCurrentItem ? this.data.length - 1 : -1;
    },
    isCurrentAtFirst() {
      return this.hasCurrentItem && 0 == this.CurrentReactItemIndex
    },
    isCurrentAtLast() {
      return this.hasCurrentItem && this.LastItemIndex == this.CurrentReactItemIndex
    },
    //------------------------------------------------
    CurrentReactItem() {
      if (!this.isEmpty) {
        let index = _.findIndex(this.data, li => li.name == this.myCurrentItemName)
        if (index >= 0) {
          return {
            index, data: this.data[index]
          }
        }
      }
    },
    //------------------------------------------------
    CurrentReactItemIndex() {
      if (this.hasCurrentItem) {
        return this.CurrentReactItem.index
      }
    },
    //------------------------------------------------
    CurrentReactItemData() {
      if (this.hasCurrentItem) {
        return this.CurrentReactItem.data
      }
    },
    //------------------------------------------------
    ReactItemList() {
      let list = []
      _.forEach(this.data, (it, index) => {
        list.push({
          key: it.name || `RI_${index}`,
          icon: it.icon || 'fas-bolt',
          name: it.name
        })
      })
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnListSelect({ currentId }) {
      this.myCurrentItemName = currentId
    },
    //------------------------------------------------
    OnFormFieldChange() { },
    //------------------------------------------------
    OnFormChange(item) {
      // Guard
      if (!this.hasCurrentItem) {
        return
      }

      // Update value
      let data = _.cloneDeep(this.data) || []
      data[this.CurrentReactItemIndex] = item
      this.tryNotifyChange(data)

      // Update to new name
      this.$nextTick(() => {
        this.OnListSelect({ currentId: item.name })
      })
    },
    //------------------------------------------------
    doCreateNewItem() {
      let newName = "新自动执行项"
      let data = _.cloneDeep(this.data) || []
      data.push({
        name: newName
      })
      this.myCurrentItemName = newName
      this.tryNotifyChange(data)
    },
    //------------------------------------------------
    doRemoveCurrentItem() {
      // 防守
      if (!this.hasCurrentItem) {
        return
      }
      // 找到下一个要高亮的节点
      let itName = this.myCurrentItemName
      let { index, item } = Ti.Util.findNextItemBy(this.data, li => li.name == itName)

      // 更新数据
      let data = _.filter(this.data, li => li.name != itName)
      this.tryNotifyChange(data)

      // 更新当前选中
      if (index >= 0 && item.name) {
        this.myCurrentItemName = item.name
      }
    },
    //------------------------------------------------
    doMoveCurrentUp() {
      // 防守
      if (!this.hasCurrentItem || this.isCurrentAtFirst) {
        return
      }
      // 获取当前下标
      let itName = this.myCurrentItemName
      let index = _.findIndex(this.data, li => li.name == itName)

      // 更新数据： 与前面交换
      let data = _.cloneDeep(this.data)
      let it0 = data[index]
      data[index] = data[index - 1]
      data[index - 1] = it0
      this.tryNotifyChange(data)
    },
    //------------------------------------------------
    doMoveCurrentDown() {
      // 防守
      if (!this.hasCurrentItem || this.isCurrentAtLast) {
        return
      }
      // 获取当前下标
      let itName = this.myCurrentItemName
      let index = _.findIndex(this.data, li => li.name == itName)

      // 更新数据： 与前面交换
      let data = _.cloneDeep(this.data)
      let it0 = data[index]
      data[index] = data[index + 1]
      data[index + 1] = it0
      this.tryNotifyChange(data)
    },
    //------------------------------------------------
    tryNotifyChange(data) {
      if (!_.isEqual(this.data, data)) {
        this.$notify("change", data)
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "currentName": {
      handler: function (newVal, oldVal) {
        //console.log("update current")
        if (!Ti.Util.isNil(newVal)) {
          this.myCurrentItemName = newVal
        }
      },
      immediate: true
    },
    "myCurrentItemName": function (newVal, oldVal) {
      //console.log(newVal, oldVal)
      if (this.keepStatusTo && !_.isEqual(newVal, oldVal)) {
        if (Ti.Util.isNil(newVal)) {
          Ti.Storage.local.remove(this.keepStatusTo)
        } else {
          Ti.Storage.local.set(this.keepStatusTo, newVal)
        }
      }
    }
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    if (this.keepStatusTo && Ti.Util.isNil(this.currentName)) {
      this.myCurrentItemName = Ti.Storage.local.getString(this.keepStatusTo)
    }
  }
  ////////////////////////////////////////////////////
}