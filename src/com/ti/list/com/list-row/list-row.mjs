export default {
  inheritAttrs: false,
  ///////////////////////////////////////////////////
  data: () => ({
    myDisplayItems: []
  }),
  ///////////////////////////////////////////////////
  props: {
    "indent": {
      type: Number,
      default: 0
    },
    "icon": {
      type: [Boolean, String],
      default: null
    },
    "display": {
      type: Array,
      default: () => []
    }
  },
  ///////////////////////////////////////////////////
  computed: {
    //-----------------------------------------------
    TopClass() {
      return this.getListItemClass({
        "is-group": this.asGroupTitle,
        "is-selectable": !this.asGroupTitle && this.selectable,
        "is-checkable": !this.asGroupTitle && this.checkable,
        "is-openable": !this.asGroupTitle && this.openable,
      }, `row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    hasRealIcon() {
      return this.icon && _.isString(this.icon)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    async evalMyDisplayItems() {
      let items = []
      // if(this.data && this.data.title && this.data.type) {
      //   console.log("evalCellDisplayItems", this.data)
      // }
      // Eval each items
      let diss = this.asGroupTitle
        ? this.groupTitleDisplay
        : this.display
      diss = diss || this.display || []
      for (let displayItem of diss) {
        let it = await this.evalDataForFieldDisplayItem({
          itemData: this.data,
          displayItem,
          vars: {
            "isCurrent": this.isCurrent,
            "isChecked": this.isChecked,
            "isChanged": this.isChanged,
            "isActived": this.isActived,
            "rowId": this.rowId
          },
          autoIgnoreNil: !this.asGroupTitle,
          autoIgnoreBlank: !this.asGroupTitle
        })
        if (it) {
          items.push(it)
        }
      }
      // Update and return
      this.myDisplayItems = items
    },
    //-----------------------------------------------
    onItemChanged({ name, value } = {}) {
      this.$notify("item:changed", {
        name, value,
        rowId: this.rowId,
        data: this.data
      })
    },
    //-----------------------------------------------
    OnClickIcon($event) {
      this.$notify("icon", {
        rowId: this.rowId,
        shift: $event.shiftKey,
        toggle: ($event.ctrlKey || $event.metaKey)
      })
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-list-row", uniqKey)
      if (!_.isEmpty(this.rowToggleKey)) {
        if (this.isRowToggleKey(uniqKey)) {
          this.onClickChecker({})
          return { prevent: true, stop: true, quit: true }
        }
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch: {
    "display": function () {
      this.evalMyDisplayItems()
    },
    "data": function () {
      //console.log("data changed")
      this.evalMyDisplayItems()
    },
    "isCurrent": function () {
      this.evalMyDisplayItems()
    },
    "isChecked": function () {
      this.evalMyDisplayItems()
    }
  },
  ///////////////////////////////////////////////////
  mounted: function () {
    this.evalMyDisplayItems()
  }
  ///////////////////////////////////////////////////
}