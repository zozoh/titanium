export default {
  //////////////////////////////////////////
  data: () => ({
    isInFullScreen: false,
    isShowInfo: false,
    isFloatInfo: false,
    uploading: 0,
    uploadedTimestamp: undefined
  }),
  //////////////////////////////////////////
  props: {
    "meta": {
      type: Object,
      default: () => ({})
    },
    "status": {
      type: Object,
      default: () => ({})
    },
    "blankAs": {
      type: Object,
      default: () => ({
        icon: "fas-braille",
        text: "i18n:empty"
      })
    },
    "blankClass": {
      type: String,
      default: "as-big",
      validator: v => /^as-(big|hug|big-mask|mid-tip)$/.test(v)
    },
    "actions": {
      type: Array,
      default: () => ["fullscreen", "newtab", "download", "info"]
    },
    "writable": {
      type: Boolean,
      default: false
    },
    "browserBuiltIn": {
      type: [String, RegExp, Function, Object, Array],
      default: () => /^(application\/pdf)$/
    },
    "showInfo": {
      type: Boolean,
      default: false
    },
    "floatInfo": {
      type: Boolean,
      default: false
    },
    "editInfoBy": {
      type: [Function, String],
      default: null
    },
    "infoPosition": {
      type: String,
      default: "bottom",
      validator: (val) => /^(bottom|left)$/.test(val)
    },
    "infoNameWidth": {
      type: [String, Number],
      default: 50
    },
    "infoValueWidth": {
      type: [String, Number],
      default: 200
    },
    "infoFields": {
      type: Array,
      default: () => ["nm", "tp", "mime", "width", "height", "len", "duration"]
    },
    // Store the status in Local
    "stateLocalKey": {
      type: String,
      default: null
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    hasMeta() {
      return _.isEmpty(this.meta) ? false : true
    },
    //--------------------------------------
    MetaId() {
      return _.get(this.meta, "id")
    },
    //--------------------------------------
    MetaMime() {
      return _.get(this.meta, "mime")
    },
    //--------------------------------------
    TopClass() {
      return {
        "is-fullscreen": this.isInFullScreen,
        "is-show-info": this.isShowInfo,
        "is-float-info": this.isFloatInfo,
        [`is-info-at-${this.infoPosition}`]: true
      }
    },
    //--------------------------------------
    DataSource() {
      if (!this.meta)
        return ""
      let link = Wn.Util.getDownloadLink(this.meta, {
        mode: "auto",
        timestamp: this.uploadedTimestamp
      })
      return link.toString();
    },
    //--------------------------------------
    DataIcon() {
      return Wn.Util.getIconObj(this.meta)
    },
    //--------------------------------------
    DataTitle() {
      return Wn.Util.getObjDisplayName(this.meta)
    },
    //--------------------------------------
    BrowserCanPreviewBuiltin() {
      if (this.browserBuiltIn) {
        let fn = Ti.AutoMatch.parse(this.browserBuiltIn)
        let bbf = this.browserBuiltIn
        if (_.isString(bbf) || _.isRegExp(bbf)) {
          return (o) => {
            return fn(o.mime)
          }
        }
        return fn
      }
      return () => false
    },
    //--------------------------------------
    PreviewCom() {
      if (this.meta) {
        // File
        let mime = this.MetaMime
        let m = /^(video|audio|image)\/.+$/.exec(mime)
        // Video/Audio/Image
        if (m) {
          return {
            comType: `ti-media-${m[1]}`,
            comConf: {
              src: this.DataSource
            }
          }
        }
        // Browser built-in preview
        if (this.BrowserCanPreviewBuiltin(this.meta)) {
          return {
            comType: 'WebWidgetFrame',
            comConf: {
              src: `/o/content?str=id:${this.meta.id}&d=raw`,
              width: "100%",
              height: "100%"
            }
          }
        }
        // Pure text 
        if (/^text\//.test(mime)) {
          return {
            comType: "WnObjText",
            comConf: {
              meta: this.meta
            }
          }
        }
        // Youtube
        if ("youtube" == this.meta.tp && this.meta.yt_video_id) {
          let thumbUrl;
          let preview = Wn.Util.genPreviewObj(this.meta)
          if ("image" == preview.type) {
            thumbUrl = preview.value
          }
          return {
            comType: "NetYoutubePlayer",
            comConf: {
              value: {
                id: this.meta.yt_video_id,
                thumbUrl
              }
            }
          }
        }
        // Binary
        return {
          comType: "ti-media-binary",
          comConf: {
            src: this.DataSource,
            icon: this.DataIcon,
            title: this.DataTitle,
            download: this.meta.race == 'FILE'
          }
        }
      }
    },
    //--------------------------------------
    PreviewInfoPinIcon() {
      return this.isFloatInfo
        ? 'fas-thumbtack'
        : 'zmdi-layers'
    },
    //--------------------------------------
    PrevewInfoFields() {
      return Wn.Obj.evalFields(this.meta, this.infoFields, (fld) => {
        if (fld.quickName && _.isUndefined(fld.value)) {
          return
        }
        if ("Group" == fld.type) {
          return fld
        }
        return _.defaults(fld, {
          nameWidth: this.infoNameWidth,
          valueWidth: this.infoValueWidth
        })
      })
    },
    //--------------------------------------
    TheActions() {
      let list = []
      if (this.hasMeta) {
        _.forEach(this.actions, (it) => {
          //..........................
          // full screen
          if ("fullscreen" == it) {
            if (!this.isInFullScreen) {
              list.push({
                icon: "zmdi-fullscreen",
                text: "i18n:wop-fullscreen-enter",
                action: () => this.enterFullscreen()
              })
            }
            // Exit FullScreen
            else {
              list.push({
                icon: "zmdi-fullscreen-exit",
                text: "i18n:wop-fullscreen-quit",
                action: () => this.exitFullscreen()
              })
            }
          }
          //..........................
          // Open
          else if ("newtab" == it) {
            list.push({
              icon: "zmdi-open-in-new",
              text: "i18n:open-newtab",
              action: () => this.openInNewTab()
            })
          }
          //..........................
          // Download
          else if ("download" == it) {
            list.push({
              icon: "zmdi-download",
              text: "i18n:download-to-local",
              action: () => this.download()
            })
          }
          //..........................
          // Toggle Info
          else if ("info" == it) {
            if (!this.isShowInfo) {
              list.push({
                icon: "zmdi-info",
                text: "i18n:info",
                action: () => this.doShowInfo()
              })
            }
            // Show Info
            else {
              list.push({
                icon: "zmdi-info-outline",
                text: "i18n:info",
                action: () => this.doHideInfo()
              })
            }
          }
          //..........................
          else if (_.isPlainObject(it) && it.action) {
            list.push(it)
          }
          //..........................
        })
      }
      //................................
      return list
    },
    //--------------------------------------
    UploadDragAndDropHandler() {
      if (this.writable) {
        return this.OnDropFile
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnClipBoardPoste({ clipboardData } = {}) {
      // Guard
      if (!/^image\//.test(this.MetaMime)) {
        return
      }
      //console.log("OnClipBoardPoste", clipboardData)
      let imgF = Ti.Dom.getImageDataFromClipBoard(clipboardData)
      if (imgF) {
        this.OnDropFile([imgF])
      }
    },
    //--------------------------------------
    OnAction(action) {
      // Exec command
      if (_.isString(action)) {
        Ti.App(this).exec(actionName)
      }
      // Call function
      else if (_.isFunction(action)) {
        action()
      }
    },
    //--------------------------------------
    OnEditInfo() {
      if (this.meta) {
        // Command
        if (_.isString(this.editInfoBy)) {
          Ti.App(this).exec(this.editInfoBy, this.meta)
        }
        // Function Invoking
        else if (_.isFunction(this.editInfoBy)) {
          this.editInfoBy(this.meta)
        }
        // Default to open the dialog
        else {
          Wn.EditObjMeta(this.meta)
        }
      }
    },
    //--------------------------------------
    async OnDropFile(files) {
      // console.log("OnDropFiles", files)
      if (!this.writable || !this.MetaId)
        return

      // It will upload the first file
      let file = _.first(files)
      let total = file.size
      //console.log("Drop file", file)

      let needConvImg = false
      if (!file || this.MetaMime != file.type) {
        let vars = { newType: file.type, oldType: this.MetaMime }
        needConvImg = /^image\//.test(this.MetaMime)
        // Maybe I can auto-covert image for user ...
        if (needConvImg) {
          if (!(await Ti.Confirm("i18n:wn-o-type-miss-match-convimg", {
            vars, type: "warn"
          }))) {
            return
          }
        }
        // not image, can not auto-convert
        else {
          return await Ti.Toast.Open("i18n:wn-o-type-miss-match", {
            vars, type: "warn"
          });
        }
      }

      let { ok, data } = await Wn.Io.uploadFile(file, {
        target: `id:${this.MetaId}`,
        mode: "s",
        progress: ({ loaded = 0 } = {}) => {
          this.uploading = loaded / total
          console.log(this.uploading)
        }
      })

      if (ok) {
        // Auto covert image
        if (needConvImg) {
          let oph = `id:${this.meta.id}`
          let ofmt = this.meta.tp || "jpeg"
          let cmdText = `imagic ${oph} -format ${ofmt} -out inplace; o ${oph} @json -cqn`
          data = await Wn.Sys.exec2(cmdText, { as: "json" })
        }

        // Notify change
        this.$notify("obj:write", data)
        this.uploading = 0
        this.uploadedTimestamp = Date.now()
      }
    },
    //--------------------------------------
    async OnSelectLocalFilesToUpload(evt) {
      await this.OnDropFile(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------
    openLocalFileSelectdDialog() {
      this.$refs.file.click()
    },
    //--------------------------------------
    enterFullscreen() {
      this.isInFullScreen = true
      this.resizeMediaViewport()
    },
    //--------------------------------------
    exitFullscreen() {
      this.isInFullScreen = false
      this.resizeMediaViewport()
    },
    //--------------------------------------
    doShowInfo() {
      this.isShowInfo = true
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    doHideInfo() {
      this.isShowInfo = false
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    toggleInfoFloat() {
      this.isFloatInfo = !this.isFloatInfo
      this.saveStateToLocal()
      this.resizeMediaViewport()
    },
    //--------------------------------------
    resizeMediaViewport() {
      for (let $child of this.$children) {
        if (_.isFunction($child.onResizeViewport)) {
          this.$nextTick(() => {
            $child.onResizeViewport()
          })
        }
      }
    },
    //--------------------------------------
    openInNewTab() {
      let link = Wn.Util.getAppLink(this.meta)
      Ti.Be.OpenLink(link)
    },
    //--------------------------------------
    download() {
      let link = Wn.Util.getDownloadLink(this.meta)
      Ti.Be.OpenLink(link)
    },
    //--------------------------------------
    saveStateToLocal() {
      if (this.stateLocalKey) {
        Ti.Storage.session.mergeObject(this.stateLocalKey, {
          isShowInfo: this.isShowInfo,
          isFloatInfo: this.isFloatInfo
        })
        // let state = Ti.Storage.session.getObject(this.stateLocalKey)
        // console.log("-> saveStateToLocal", state)
      }
    },
    //--------------------------------------
    loadStateFromLocal() {
      if (this.stateLocalKey) {
        let state = Ti.Storage.session.getObject(this.stateLocalKey)
        //console.log("<- loadStateFromLocal", state)
        _.defaults(state, {
          isShowInfo: this.isShowInfo,
          isFloatInfo: this.isFloatInfo
        })
        this.isShowInfo = state.isShowInfo
        this.isFloatInfo = state.isFloatInfo
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "showInfo": function (val) {
      //console.log("showInfo watched")
      this.isShowInfo = val
    },
    "floatInfo": function (val) {
      //console.log("floatInfo watched")
      this.isFloatInfo = val
    }
  },
  //////////////////////////////////////////
  created: function () {
    this.OnPaste = evt => {
      this.OnClipBoardPoste(evt)
    }
  },
  //////////////////////////////////////////
  mounted: function () {
    this.isShowInfo = this.showInfo
    this.isFloatInfo = this.floatInfo
    this.$nextTick(() => {
      this.loadStateFromLocal()
    })
    // Watch the clipboard
    window.addEventListener("paste", this.OnPaste)
  },
  //////////////////////////////////////////
  beforeDestroy: function () {
    window.removeEventListener("paste", this.OnPaste)
  }
  //////////////////////////////////////////
}