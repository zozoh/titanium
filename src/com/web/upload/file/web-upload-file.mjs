const _M = {
  /////////////////////////////////////////
  data: () => ({
    srcAsUrl: false,
    src_ts: null,
    previewIcon: null,
    uploadFile: null,
    progress: -1
  }),
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: [String, Object],
      default: null
    },
    // raw value is WnObj
    // If declare the valueType
    // It will transform the WnObj
    // to relaitve value mode
    "valueType": {
      type: String,
      default: "obj",
      validator: v => /^(obj|idPath|id)$/.test(v)
    },
    "transObj": {
      type: [Function, Array],
      default: () => ['id', 'nm', 'thumb', 'title', 'mime', 'tp', 'sha1', 'len']
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    // Input a image link directly
    "exlink": {
      type: Boolean,
      default: false
    },
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
      default: undefined
    },
    // Display height
    "height": {
      type: [String, Number],
      default: undefined
    },
    // support remove the objects
    "removable": {
      type: Boolean,
      default: true
    },
    // which type supported to upload
    // nulll or empty array will support any types
    "supportTypes": {
      type: [String, Array],
      default: () => []
      //default : ()=>["png","jpg","jpeg","gif"]
    },
    "minFileSize": {
      type: Number,
      default: 0
    },
    "maxFileSize": {
      type: Number,
      default: 0
    },
    // which mime supported to upload
    // nulll or empty array will support any mimes
    "supportMimes": {
      type: [String, Array],
      default: () => []
      //default : ()=>["image/png","image/jpeg","image/gif"]
    },
    "uploadUrl": {
      type: String,
      default: "/api/thing/file/add"
    },
    "uploadParams": {
      type: Object,
      default: () => ({})
    },
    // Load the file meta when value is String
    "getFilePreview": {
      type: Function,
      default: undefined
    },
    "defaultPreviewIcon": {
      type: [String, Object],
      default: "far-file"
    },
    "getFileDownloadLink": {
      type: [Function, Object]
    },
    "uploadedBy": {
      type: [Function, String],
      default: "change"
    },
    "removeBy": {
      type: [Function, String],
      default: "remove:file"
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    AcceptTypes() {
      if (_.isString(this.supportTypes))
        return this.supportTypes.split(",")
      return this.supportTypes
    },
    //--------------------------------------
    AcceptMimes() {
      if (_.isString(this.supportMimes))
        return this.supportMimes.split(",")
      return this.supportMimes
    },
    //--------------------------------------
    // Display image for <ti-thumb>
    PreviewIcon() {
      if (this.srcAsUrl) {
        return {
          type: "image", value: this.value
        }
      }
      //....................................
      if (this.oFile) {
        //..................................
        // Image
        if (Wn.Obj.isMime(this.oFile, /^(image\/)/)) {
          let ss = ["/o/content?str=id:", this.oFile.id]
          if (this.src_ts) {
            ss.push("&_t=")
            ss.push(this.src_ts)
          }
          return {
            type: "image", value: ss.join("")
          }
        }
        //..................................
        // Video
        if (Wn.Obj.isMime(this.oFile, /^(video\/)/)) {
          let ss = ["/o/content?str=id:", this.oFile.video_cover]
          if (this.src_ts) {
            ss.push("&_t=")
            ss.push(this.src_ts)
          }
          return {
            type: "image", value: ss.join("")
          }
        }
        //..................................
        // Others just get the icon font
        return Wn.Util.getObjIcon(this.oFile)
      }
    },
    //--------------------------------------
    PreviewType() {
      return this.srcAsUrl ? "link" : "obj"
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async assertListHas(list, str, invalidMsg, vars) {
      if (!_.isEmpty(list)) {
        let invalid = true
        for (let li of list) {
          if (li == str) {
            invalid = false
            break
          }
        }
        if (invalid) {
          await Ti.Alert(invalidMsg, {
            type: "warn",
            icon: "zmdi-alert-triangle",
            vars
          })
          return false
        }
      }
      return true
    },
    //--------------------------------------
    async OnExlink() {
      let value = this.srcAsUrl ? this.value : undefined
      let src = _.trim(await Ti.Prompt("i18n:exlink-tip-img", {
        width: "80%",
        value
      }))
      // User cancel
      if (!src)
        return

      this.$notify("change", src)
    },
    //--------------------------------------
    async OnOpen() {
      if (this.srcAsUrl) {
        await Ti.Be.Open(this.value)
      }
      // remove the thumb file
      else if (this.previewIcon) {
        let link;
        // Render by template
        if (_.isFunction(this.getFileDownloadLink)) {
          link = this.getFileDownloadLink(this.value)
        }
        // Customized link
        else if (this.getFileDownloadLink) {
          link = Ti.Util.explainObj(this.value, this.getFileDownloadLink)
        }

        // Guard
        if (!link) {
          return await Ti.Alert("Download link without defined!", { type: "warn" })
        }
        //console.log("it will open ", link)
        await Ti.Be.Open(link)
      }
    },
    //--------------------------------------
    async OnRemove() {
      // Guard
      if (!this.removeBy) {
        return await Ti.Alert("Remove action without defined!", { type: "warn" })
      }
      // Customized
      if (_.isFunction(this.removeBy)) {
        await this.removeBy(this.value)
      }
      // Emit message
      if (_.isString(this.removeBy)) {
        this.$notify(this.removeBy, this.value)
      }
    },
    //--------------------------------------
    async OnUpload(file) {
      //console.log("it will upload ", file)
      //................................
      // Check file size
      let fileSize = file.size
      if (this.minFileSize > 0 && fileSize < this.minFileSize) {
        return await Ti.Alert("i18n:wn-invalid-fsize-min", {
          type: "warn",
          icon: "zmdi-alert-triangle",
          vars: {
            minSize: Ti.S.sizeText(this.minFileSize),
            fileSize: Ti.S.sizeText(fileSize)
          }
        })
      }
      if (this.maxFileSize > 0 && fileSize >= this.maxFileSize) {
        return await Ti.Alert("i18n:wn-invalid-fsize-max", {
          type: "warn",
          icon: "zmdi-alert-triangle",
          vars: {
            maxSize: Ti.S.sizeText(this.maxFileSize),
            fileSize: Ti.S.sizeText(fileSize)
          }
        })
      }
      //................................
      // Check for support Types
      let type = Ti.Util.getSuffixName(file.name, true)
      if (!await this.assertListHas(
        this.AcceptTypes, type,
        'i18n:wn-invalid-types',
        { current: type, supports: this.AcceptTypes.join(", ") })
      ) {
        return
      }
      if (!await this.assertListHas(
        this.AcceptMimes, file.type,
        'i18n:wn-invalid-mimes',
        { current: file.type, supports: this.AcceptMimes.join(", ") })
      ) {
        return
      }
      //................................
      // Upload file to destination
      this.uploadFile = file
      this.progress = 0
      let url = this.uploadUrl
      let params = Ti.Util.explainObj(file, this.uploadParams)


      let reo = await Ti.Http.post(url, {
        file,
        progress: (pe) => {
          this.progress = pe.loaded / pe.total
        },
        params: params,
        as: "json"
      })

      //................................
      // Reset upload
      this.uploadFile = null
      this.progress = -1

      //................................
      // Fail to upload
      // if (!ok) {
      //   await Ti.Alert(`i18n:${msg}`, { type: "warn", icon: "zmdi-alert-triangle" })
      //   return
      // }

      //................................
      // done
      this.src_ts = Date.now()

      //................................
      // Transform value
      let vTrans = ({
        idPath: (obj) => `id:${obj.id}`,
        id: (obj) => obj.id,
        nm: (obj) => obj.nm,
        obj: (obj) => {
          if (_.isFunction(this.transObj)) {
            return this.transObj(obj)
          }
          return _.pick(obj, this.transObj)
        },
        wnobj: (obj) => obj
      })[this.valueType]

      let val = vTrans(reo)

      //................................
      if (_.isFunction(this.uploadedBy)) {
        this.uploadedBy(val)
      }
      // Emit event
      else if (this.uploadedBy) {
        this.$notify(this.uploadedBy, val)
      }
    },
    //--------------------------------------
    async reload() {
      // Guard
      if (!this.value) {
        this.srcAsUrl = false
        this.previewIcon = null
        return
      }

      // Ex-link image src
      this.srcAsUrl = /^https?:\/\//.test(this.value)
      if (this.srcAsUrl) {
        this.previewIcon = {
          type: "image", value: this.value
        }
        return
      }

      // Customzied preview icon
      if (_.isFunction(this.getFilePreview)) {
        this.previewIcon = await this.getFilePreview(this.value, {
          timestamp: this.src_ts
        })
      }
      // Default preview icon
      else {
        this.previewIcon = this.defaultPreviewIcon
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "value": function () {
      this.reload()
    }
  },
  //////////////////////////////////////////
  mounted: async function () {
    await this.reload()
  }
  //////////////////////////////////////////
}
export default _M;