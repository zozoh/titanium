const _M = {
  /////////////////////////////////////////
  data: () => ({
    "loading": false,
    "dragging": false
  }),
  /////////////////////////////////////////
  props: {
    //-------------------------------------
    // Data
    //-------------------------------------
    /**
     * Each item as :
     * 
     * ```js
     * {
     *    id: "xxx",              // Unique key
     *    src: "http://xxx...",   // Src to preview
     *    file: File,             // Local file, for prerender duraing uploading
     *    value: "id:xxx"         // Value of the item, could be String or Object
     *    link: "/path/to/open"   // Link to open in newtab
     * }
     * ```
     */
    "items": {
      type: Array,
      default: () => []
    },
    /**
     * Show the process `0.0-1.0` during the uploading
     * 
     * ```js
     * {
     *    itemId: 0,              // `0.0-1.0` during the uploading
     * }
     * ```
     */
    "progress": {
      type: Object,
      default: () => ({})
    },
    // check function => {ok:false, msg:"xxx"}
    "fileFilter": {
      type: Function
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "sortable": {
      type: Boolean,
      default: true
    },
    // support remove the objects
    "removable": {
      type: Boolean,
      default: true
    },
    "limit": {
      type: Number,
      default: 0
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "showItemText": {
      type: Boolean,
      default: true
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "itemWidth": {
      type: [Number, String],
      default: undefined
    },
    "itemHeight": {
      type: [Number, String],
      default: undefined
    },
    "previewStyle": {
      type: Object
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-dragging": this.dragging,
        "no-dragging": !this.dragging,
        "is-show-text": this.showItemText,
        "no-show-text": !this.showItemText
      })
    },
    //--------------------------------------
    ItemStyle() {
      return Ti.Css.toStyle({
        width: this.itemWidth,
        height: this.itemHeight
      })
    },
    //--------------------------------------
    ItemPreviewStyle() {
      return Ti.Css.toStyle(this.previewStyle)
    },
    //--------------------------------------
    PreviewItems() {
      let list = []
      _.forEach(this.items, (it, index) => {
        let { id, src, icon, file, value, link, text } = it
        let type = value ? "obj" : "local";
        let thumb;
        // Show local file
        if (file) {
          thumb = { type: "localFile", value: file }
        }
        // Show icon
        else if (icon) {
          thumb = icon
        }
        // Show image
        else {
          thumb = { type: "image", value: src }
        }
        // Get progress
        let progress = _.get(this.progress, id)
        // Join item
        list.push({
          index,
          id, src, file, value, link, text,
          type, thumb, progress,
          className: `is-${type}`
        })
      })
      return list
    },
    //--------------------------------------
    Values() {
      let list = []
      _.forEach(this.items, ({ value }) => {
        list.push(value)
      })
      return list
    },
    //--------------------------------------
    hasItems() {
      return !_.isEmpty(this.items)
    },
    //--------------------------------------
    isShowAddBtn() {
      return this.AvaCapCount != 0
    },
    //--------------------------------------
    AvaCapCount() {
      if (this.dragging) {
        return 0;
      }
      if (this.limit > 0) {
        return this.limit - this.Values.length
      }
      return -1
    },
    //--------------------------------------
    isShowActions() {
      return this.removable && this.hasItems
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnClickAdd() {
      this.$refs.file.click()
    },
    //--------------------------------------
    async OnDropFiles(files) {
      if (!_.isEmpty(files) && this.isShowAddBtn) {
        let fs;
        // Do Filter
        if (_.isFunction(this.fileFilter)) {
          fs = []
          for (let f of files) {
            let re = this.fileFilter(f)
            if (re.ok) {
              fs.push(f)
            }
            // Show Error
            else {
              return await Ti.Alert(re.msg, { type: "warn" })
            }
          }
        } else {
          fs = files
        }

        // Guard
        if (_.isEmpty(fs)) {
          return
        }

        // Auto match the limit
        if (this.AvaCapCount > 0 && fs.length > this.AvaCapCount) {
          fs = _.slice(fs, 0, this.AvaCapCount)
        }
        this.$notify("upload", fs)
      }
    },
    //--------------------------------------
    async OnSelectLocalFilesToUpload(evt) {
      await this.OnDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------
    OnRemoveItem(it) {
      this.$notify("remove", it)
    },
    //--------------------------------------
    OnOpenItem(it) {
      this.$notify("open", it)
    },
    //--------------------------------------
    OnClean() {
      this.$notify("clean")
    },
    //--------------------------------------
    switchItem(fromIndex, toIndex) {
      if (fromIndex != toIndex) {
        //console.log("switch item", { fromIndex, toIndex })
        let values = []
        for (let it of this.PreviewItems) {
          let { value, index } = it
          if (index == fromIndex) {
            index = toIndex
          } else if (index == toIndex) {
            index = fromIndex
          }
          values[index] = value
        }
        _.remove(values, v => v ? false : true)
        console.log("switchItem:", values)
        this.$notify("change", values)
      }
    },
    //--------------------------------------
    initSortable() {
      if (this.sortable && this.$refs.itemsCon) {
        new Sortable(this.$refs.itemsCon, {
          animation: 300,
          filter: ".as-new, .as-local",
          onStart: () => {
            this.$refs.itemsCon.turnOffTiDropFile = true
            this.dragging = true
          },
          onEnd: ({ oldIndex, newIndex }) => {
            this.$refs.itemsCon.turnOffTiDropFile = false
            this.switchItem(oldIndex, newIndex)
            _.delay(() => {
              this.dragging = false
            }, 100)
          }
        })
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "isShowAddBtn": function (newVal) {
      if (this.$refs.itemsCon) {
        this.$refs.itemsCon.turnOffTiDropFile = !newVal
      }
    }
  },
  //////////////////////////////////////////
  mounted: function () {
    this.initSortable()
  }
  //////////////////////////////////////////
}
export default _M;