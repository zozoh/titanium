const _M = {
  /////////////////////////////////////////
  data: () => ({
    myArea: 0,
    myActionsWidth: 0,
    showMoreActions: false
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
    "previewType": {
      type: String,
      default: "obj",
      validator: (v) => /^(obj|link)$/.test(v)
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
    "prefixHoverIcon": {
      type: String,
      default: "zmdi-close-circle"
    },
    "actionLimit": {
      type: Number,
      default: 3
    },
    "areaSize": {
      type: Object,
      default: () => ({
        //xl: (800 * 800),
        xs: 100 * 100,
        sm: 200 * 200,
        md: 400 * 400,
        lg: 600 * 600
      })
    },
    //------------------------------------------------
    // Measure
    //------------------------------------------------
    "maxWidth": {
      type: [String, Number],
      default: undefined
    },
    "maxHeight": {
      type: [String, Number],
      default: undefined
    },
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
      return this.getTopClass(`is-area-${this.AreaType}`, {
        "is-readonly": this.readonly,
        "no-readonly": !this.readonly
      });
    },
    //--------------------------------------
    AreaType() {
      let AS = this.areaSize;
      let ar = this.myArea;
      if (ar <= 0) {
        return "nil";
      }
      if (_.inRange(ar, 0, AS.xs + 1)) return "xs";
      if (_.inRange(ar, AS.xs, AS.sm + 1)) return "sm";
      if (_.inRange(ar, AS.sm, AS.md + 1)) return "md";
      if (_.inRange(ar, AS.md, AS.lg + 1)) return "lg";

      return "xl";
    },
    //--------------------------------------
    ThumbStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height,
        maxWidth: this.maxWidth,
        maxHeight: this.maxHeight
      });
    },
    //--------------------------------------
    ActionsStyle() {
      if (/^(xs|sm)$/.test(this.AreaType)) {
        return {
          right: Ti.Css.toSize(this.myActionsWidth * -1)
        };
      }
    },
    //--------------------------------------
    hasPreview() {
      return this.preview ? true : false;
    },
    //--------------------------------------
    isShowActions() {
      return !_.isEmpty(this.ActionItems);
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
        });
      }
      if (this.isShowOpenIcon) {
        items.push({
          icon: "zmdi-open-in-new",
          text: "i18n:open",
          className: "as-open",
          handler: () => {
            this.OnOpen();
          }
        });
      }
      if (this.isShowExlink) {
        items.push({
          icon: "fas-link",
          text: "i18n:link",
          className: "as-exlink",
          handler: () => {
            this.OnExlink();
          }
        });
      }
      if (this.isShowDownloadIcon) {
        items.push({
          icon: "zmdi-cloud-download",
          text: "i18n:download",
          className: "as-download",
          handler: () => {
            this.OnDownload();
          }
        });
      }
      if (_.isArray(this.actions)) {
        for (let at of this.actions) {
          let handler;
          if (_.isString(at.action)) {
            handler = () => {
              this.$notify(at.action, at.payload);
            };
          }
          if (_.isFunction(at.action)) {
            handler = () => {
              at.action(at.payload, this);
            };
          }
          items.push({
            icon: at.icon,
            text: at.text,
            className: at.className,
            handler
          });
        }
      }

      return items;
    },
    //--------------------------------------
    TopActionItems() {
      let items = this.ActionItems;
      let N = this.actionLimit;
      if (items.length > N) {
        let I = N - 1;
        let list = items.slice(0, I);
        list.push({
          icon: "zmdi-settings",
          text: "i18n:more",
          hoverMore: true
        });
        return list;
      }
      return items;
    },
    //--------------------------------------
    MoreActionItems() {
      let items = this.ActionItems;
      let N = this.actionLimit;
      if (items.length > N) {
        let I = N - 1;
        return items.slice(I);
      }
    },
    //--------------------------------------
    isShowRemoveIcon() {
      if (!this.uploadFile && this.hasPreview && !this.readonly) {
        return true;
      }
      return false;
    },
    //--------------------------------------
    isShowOpenIcon() {
      return this.openable && this.hasPreview;
    },
    //--------------------------------------
    isShowDownloadIcon() {
      return this.downloadable && this.hasPreview;
    },
    //--------------------------------------
    isShowExlink() {
      return this.exlink && !this.hasPreview;
    },
    //--------------------------------------
    PreviewIcon() {
      if (this.uploadFile) {
        return { type: "localFile", value: this.uploadFile };
      }
      // Normal image
      if (this.preview) {
        return this.preview;
      }
      // Show Icon
      return "zmdi-plus";
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnMouseEnter({ hoverMore } = {}) {
      if (!hoverMore) {
        return;
      }
      this.showMoreActions = true;
      this.$nextTick(() => {});
    },
    //--------------------------------------
    OnClickToEdit() {
      if ("link" == this.previewType) {
        this.$notify("exlink");
      } else if (this.readonly) {
        this.$notify("open");
      } else {
        this.$refs.file.click();
      }
    },
    //--------------------------------------
    async OnDropFiles(files) {
      let file = _.get(files, 0);
      if (file && !this.readonly) {
        this.$notify("upload", file);
      }
    },
    //--------------------------------------
    async OnSelectLocalFilesToUpload(evt) {
      await this.OnDropFiles(evt.target.files);
      this.$refs.file.value = "";
    },
    //--------------------------------------
    OnRemove() {
      this.$notify("remove");
    },
    //--------------------------------------
    OnOpen() {
      this.$notify("open");
    },
    //--------------------------------------
    OnExlink() {
      this.$notify("exlink");
    },
    //--------------------------------------
    OnDownload() {
      this.$notify("download");
    },
    //--------------------------------------
    recountArea() {
      let rect = Ti.Rects.createBy(this.$refs.thumb);
      if (_.isEmpty(rect)) return;
      this.myArea = rect.width * rect.height;
      if (this.$refs.actions) {
        this.myActionsWidth = this.$refs.actions.getBoundingClientRect().width;
      } else {
        this.myActionsWidth = 0;
      }
    },
    //--------------------------------------
    shouldRecountArea() {
      _.delay(() => {
        this.recountArea();
      }, 10);
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "preview": "shouldRecountArea",
    "width": "shouldRecountArea",
    "height": "shouldRecountArea",
    "removable": "shouldRecountArea",
    "areaSize": "shouldRecountArea"
  },
  //////////////////////////////////////////
  created: function () {
    Ti.Viewport.watch(this, {
      resize: () => {
        this.recountArea();
      }
    });
  },
  //////////////////////////////////////////
  mounted: function () {
    this.$nextTick(() => this.recountArea());
  },
  //////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this);
  }
  //////////////////////////////////////////
};
export default _M;
