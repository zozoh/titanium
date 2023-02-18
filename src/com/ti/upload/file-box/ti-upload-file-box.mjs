const _M = {
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
    "previewType": {
      type: String,
      default: "obj",
      validator: v => /^(obj|link)$/.test(v)
    },
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
    "areaSize": {
      type: Object,
      default: () => ({
        //xl: (800 * 800),
        xs: (100 * 100),
        sm: (200 * 200),
        md: (400 * 400),
        lg: (600 * 600),
      })
    },
    //------------------------------------------------
    // Measure
    //------------------------------------------------
    // Display width
    "width": {
      type: [String, Number],
      default: 120
    },
    // Display height
    "height": {
      type: [String, Number],
      default: 120
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasPreview() {
      return this.preview ? true : false
    },
    //--------------------------------------
    isShowActions() {
      return !_.isEmpty(this.ActionItems)
    },
    //--------------------------------------
    ActionItems() {
      let items = [];
      if (this.isShowRemoveIcon) {
        items.push({
          icon: "zmdi-delete",
          text: "i18n:clear",
          className: "as-del",
          handler: () => {
            this.OnRemove();
          }
        })
      }
      if (this.isShowOpenIcon) {
        items.push({
          icon: "zmdi-open-in-new",
          text: "i18n:open",
          className: "as-open",
          handler: () => {
            this.OnOpen();
          }
        })
      }
      if (this.isShowExlink) {
        items.push({
          icon: "fas-link",
          text: "i18n:link",
          className: "as-exlink",
          handler: () => {
            this.OnExlink();
          }
        })
      }
      if (this.isShowDownloadIcon) {
        items.push({
          icon: "zmdi-cloud-download",
          text: "i18n:download",
          className: "as-download",
          handler: () => {
            this.OnDownload();
          }
        })
      }
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
          items.push({
            icon: at.icon,
            text: at.text,
            className: at.className,
            handler
          })
        }
      }


      return items;
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
    MoreActionItems() {
      let items = this.ActionItems;
      let N = this.actionLimit
      if (items.length > N) {
        let I = N - 1;
        return items.slice(I)
      }

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
      // Normal image
      if (this.preview) {
        return this.preview
      }
      // Show Icon
      return "zmdi-plus"
    },
    //--------------------------------------
    LabelConfig() {
      return {
        prefixIcon: this.PreviewIcon,
        placeholder: this.placeholder
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
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