export default {
  ///////////////////////////////////////////
  data: () => {
    return {
      collapse: true
    }
  },
  ///////////////////////////////////////////
  props: {
    "groupStatusStoreKey": {
      type: String,
      default: undefined
    },
    "highlightId": {
      type: String,
      default: undefined
    },
    "id": {
      type: String,
      default: undefined
    },
    "depth": {
      type: Number,
      default: 0
    },
    "icon": {
      type: [String, Object],
      default: undefined
    },
    "title": {
      type: String,
      default: undefined
    },
    "tip": {
      type: String,
      default: undefined
    },
    "path": {
      type: String,
      default: undefined
    },
    "view": {
      type: String,
      default: undefined
    },
    "href": {
      type: String,
      default: undefined
    },
    "items": {
      type: Array,
      default: () => []
    }
  },
  ///////////////////////////////////////////
  computed: {
    //---------------------------------------
    TopClass() {
      return {
        "is-top": this.isTop,
        "is-sub": !this.isTop,
        "is-group": this.isGroup,
        "is-item": !this.isGroup,
        "is-collapse": this.collapse,
        "is-expend": !this.collapse,
        "is-highlight": this.isHighlight,
        "has-icon": this.icon ? true : false,
        "nil-icon": this.icon ? false : true
      }
    },
    //---------------------------------------
    isTop() {
      return this.depth == 0
    },
    //---------------------------------------
    isGroup() {
      return _.isArray(this.items)
    },
    //---------------------------------------
    hasHref() {
      return !_.isEmpty(this.href)
    },
    //---------------------------------------
    isHighlight() {
      return this.id && this.id == this.highlightId
    },
    //---------------------------------------
    GroupStatusIcon() {
      return this.collapse
        ? 'zmdi-chevron-down'
        : 'zmdi-chevron-up'
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods: {
    //---------------------------------------
    OnToggleGroupStatus() {
      if (this.isGroup) {
        this.collapse = !this.collapse
        // Save status
        if (this.groupStatusStoreKey) {
          Ti.Storage.local.set(this.groupStatusStoreKey, this.collapse)
        }
      }
    },
    //---------------------------------------
    OnClickItemInfo() {
      this.$notify("item:actived", {
        id: this.id,
        title: this.title,
        path: this.path,
        href: this.href,
        view: this.view
      })
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  mounted: function () {
    if (this.isGroup) {
      // Only Top Group is expended
      if (this.isTop) {
        this.collapse = false
      }
      // Others group will default collapse
      // The 'item' will ignore the setting of collapse
      else {
        this.collapse = true
      }
      // Load local setting
      if (this.groupStatusStoreKey) {
        this.collapse =
          Ti.Storage.local.getBoolean(this.groupStatusStoreKey, this.collapse)
      }
    }
  }
  ///////////////////////////////////////////
}