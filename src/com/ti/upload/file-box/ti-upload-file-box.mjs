const _M = {
  /////////////////////////////////////////
  data: () => ({
    mouseEnterPrefix: false
  }),
  /////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    // The source to display image
    "preview": {
      type: [String, Object],
      default: null
    },
    // The value must be a LocalFile object
    // to prerender the LocalFile during uploading
    "uploadFile": {
      type: File,
      default: null
    },
    // Show the process `0.0-1.0` during the uploading
    "progress": {
      type: Number,
      default: -1
    },
    // Input a image link directly
    "exlink": {
      type: Boolean,
      default: false
    },
    //------------------------------------------------
    // Behavior
    //------------------------------------------------
    // support remove the objects
    "removable": {
      type: Boolean,
      default: true
    },
    "openable": {
      type: Boolean,
      default: true
    },
    "readonly": {
      type: Boolean,
      default: false
    },
    "downloadable": {
      type: Boolean,
      default: true
    },
    "actions": {
      type: Array,
      default: () => []
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "placeholder": {
      type: String,
      default: "i18n:select",
    },
    "hideBorder": {
      type: Boolean,
      default: false
    },
    //------------------------------------------------
    // Measure
    //------------------------------------------------
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "hover-prefix": this.mouseEnterPrefix,
        "has-preview": this.hasPreview,
        "show-border": !this.hideBorder,
        "hide-border": this.hideBorder,
        "is-readonly": this.readonly,
        "no-readonly": !this.readonly,
      })
    },
    //--------------------------------------
    hasPreview() {
      return this.preview ? true : false
    },
    //--------------------------------------
    isEditable() {
      return !this.readonly
    },
    //--------------------------------------
    TopActionItems() {
      let items = this.ActionItems;
      let N = this.actionLimit
      if (items.length > N) {
        let I = N - 1;
        let list = items.slice(0, I)
        list.push({
          icon: "zmdi-settings",
          text: "i18n:more",
          hoverMore: true
        })
        return list;
      }
      return items;
    },
    //--------------------------------------
    isShowRemoveIcon() {
      if (!this.uploadFile && this.hasPreview && !this.readonly) {
        return true
      }
      return false
    },
    //--------------------------------------
    isShowOpenIcon() {
      return this.openable && this.hasPreview
    },
    //--------------------------------------
    isShowDownloadIcon() {
      return this.downloadable && this.hasPreview
    },
    //--------------------------------------
    PreviewIcon() {
      if (this.uploadFile) {
        return { type: "localFile", value: this.uploadFile }
      }
      // Tip Remove
      if (this.hasPreview && this.mouseEnterPrefix) {
        return "zmdi-close-circle"
      }
      // Normal image
      if (this.preview) {
        return this.preview
      }
      // Show Icon
      return "zmdi-plus"
    },
    //--------------------------------------
    BoxItemText() {
      return Ti.I18n.text(this.placeholder)
    },
    //--------------------------------------
    ActionItems() {
      let items = [];
      let mores = [];

      let itActions = {
        select: {
          icon: "zmdi-folder",
          text: "i18n:select",
          action: () => {
            this.$refs.file.click()
          }
        },
        download: {
          icon: "zmdi-cloud-download",
          text: "i18n:download",
          className: "as-download",
          handler: () => {
            this.OnDownload();
          }
        },
        open: {
          icon: "zmdi-open-in-new",
          text: "i18n:open",
          className: "as-open",
          handler: () => {
            this.OnOpen();
          }
        }
      }

      if (this.isEditable) {
        items.push(_.omit(itActions.select, "text"))
        if (this.hasPreview) {
          mores.push(itActions.download, itActions.open)
        }
      }
      // Readonly
      else if (this.hasPreview) {
        items.push(_.omit(itActions.open, "text"))
        mores.push(itActions.download)
      }

      // More actions
      if (_.isArray(this.actions)) {
        for (let at of this.actions) {
          let handler;
          if (_.isString(at.action)) {
            handler = () => {
              this.$notify(at.action, at.payload)
            }
          }
          if (_.isFunction(at.action)) {
            handler = () => {
              at.action(at.payload, this)
            }
          }
          mores.push({
            icon: at.icon,
            text: at.text,
            className: at.className,
            handler
          })
        }
      }

      if (!_.isEmpty(mores)) {
        items.push({
          icon: 'zmdi-more-vert',
          topHoverOpen: true,
          items: mores
        })
      }

      return items
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnMouseEnterPrefix() {
      this.mouseEnterPrefix = true
      console.log("enter", this.mouseEnterPrefix)
    },
    //--------------------------------------
    OnMouseLeaverPrefix() {
      this.mouseEnterPrefix = false
      console.log("leave", this.mouseEnterPrefix)
    },
    //--------------------------------------
    OnClickToEdit() {
      if (this.readonly) {
        this.$notify("open")
      } else {
        this.$refs.file.click()
      }
    },
    //--------------------------------------
    async OnDropFiles(files) {
      let file = _.get(files, 0)
      if (file && !this.readonly) {
        this.$notify("upload", file)
      }
    },
    //--------------------------------------
    async OnSelectLocalFilesToUpload(evt) {
      await this.OnDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------
    OnRemove() {
      this.$notify("remove")
    },
    //--------------------------------------
    OnOpen() {
      this.$notify("open")
    },
    //--------------------------------------
    OnExlink() {
      this.$notify("exlink")
    },
    //--------------------------------------
    OnDownload() {
      this.$notify("download")
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;