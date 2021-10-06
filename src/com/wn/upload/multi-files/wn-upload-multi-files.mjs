const _M = {
  /////////////////////////////////////////
  data: () => ({
    myFileObjs: {},
    myUploadFiles: [],
    myUploadProgress: {},
    myUploadDone: {}
  }),
  /////////////////////////////////////////
  props: {
    "value": {
      type: Array,
      default: () => []
    },
    // raw value is WnObj
    // If declare the valueType
    // It will transform the WnObj
    // to relaitve value mode
    "valueType": {
      type: String,
      default: "idPath",
      validator: v => /^(obj|path|fullPath|idPath|id)$/.test(v)
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
    // Indicate the upload target when upload new value
    // Of cause, if the `value` exists, replace it
    // The `target` must be a path to a image object,
    // it will auto transfrom the image format by `cmd_imagic`
    "target": {
      type: String,
      default: null
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
    // Image object only: it will auto apply image filter
    // just like clip the image size etc..
    // @see cmd_imagic for more detail about the filter
    "filter": {
      type: [Array, String],
      default: null
    },
    // Image object only: if `>0 and <=1` mean output quality
    // if not match the range, will depends on the `cmd_imagic` default
    "quality": {
      type: Number,
      default: 0
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "textBy": {
      type: [String, Function],
      default: "title|nm"
    },
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
    ImageFilter() {
      if (!this.filter)
        return []
      return [].concat(this.filter)
    },
    //--------------------------------------
    LocalFileFilter() {
      return (file) => {
        //................................
        // Check file size
        let fileSize = file.size
        if (this.minFileSize > 0 && fileSize < this.minFileSize) {
          return {
            ok: false,
            msg: Ti.I18n.getf("i18n:wn-invalid-fsize-min", {
              minSize: Ti.S.sizeText(this.minFileSize),
              fileSize: Ti.S.sizeText(fileSize)
            })
          }
        }
        if (this.maxFileSize > 0 && fileSize >= this.maxFileSize) {
          return {
            ok: false,
            msg: Ti.I18n.getf("i18n:wn-invalid-fsize-max", {
              maxSize: Ti.S.sizeText(this.maxFileSize),
              fileSize: Ti.S.sizeText(fileSize)
            })
          }
        }
        //................................
        // Check for support Types
        let type = Ti.Util.getSuffixName(file.name, true)
        let re = this.checkTypeInGivenList(
          this.AcceptTypes, type,
          'i18n:wn-invalid-types',
          {
            current: type,
            supports: this.AcceptTypes.join(", ")
          })
        if (!re.ok)
          return re;
        //................................
        // Check for support mimes
        return this.checkTypeInGivenList(
          this.AcceptMimes, file.type,
          'i18n:wn-invalid-mimes',
          {
            current: file.type,
            supports: this.AcceptMimes.join(", ")
          })
      }
    },
    //--------------------------------------
    GetObjText() {
      if (_.isFunction(this.textBy)) {
        return this.textBy
      }
      if (_.isString(this.textBy)) {
        return (obj) => {
          return Ti.Util.getOrPickNoBlank(obj, this.textBy)
        }
      }
      return (obj = {}) => {
        return obj.title || obj.nm || obj.id
      }
    },
    //--------------------------------------
    hasItems() {
      return !_.isEmpty(this.value)
    },
    //--------------------------------------
    // Display image for <ti-thumb>
    FileItems() {
      // Guard
      if (this.isEmpty) {
        return []
      }
      //
      // Join remote items
      //
      let list = []
      for (let val of this.value) {
        let obj = this.myFileObjs[val]
        let oid = _.get(obj, "id")
        let it = {
          id: oid,
          key: oid || val,
          value: val,
        }
        //..................................
        // Gone
        if (!obj) {
          it.icon = {
            type: "font",
            value: "fas-birthday-cake",
            opacity: 0.382,
            fontSize: ".16rem"
          }
        }
        //..................................
        // Image
        else if (Wn.Obj.isMime(obj, /^(image\/)/)) {
          let ss = ["/o/content?str=id:", obj.id]
          it.src = ss.join("")
        }
        //..................................
        // Video
        else if (Wn.Obj.isMime(obj, /^(video\/)/)) {
          let ss = ["/o/content?str=id:", obj.video_cover]
          it.src = ss.join("")
        }
        //..................................
        // Others just get the icon font
        else {
          it.icon = Wn.Util.getObjIcon(obj)
        }
        //..................................
        // Add link
        if (obj) {
          it.link = Wn.Util.getAppLink(obj)
          if (this.showItemText) {
            it.text = this.GetObjText(obj)
          }
        }
        //..................................
        // Join item
        list.push(it)
      }
      //
      // Uploaded item
      //
      list.push(...this.myUploadFiles)
      // Done
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnOpen({ link } = {}) {
      if (link) {
        await Ti.Be.Open(link)
      }
    },
    //--------------------------------------
    async OnRemove({ index, id } = {}) {
      //console.log("remove", index, id)
      // The value should obey the `valueType` prop
      // but it can indicate if the item is obj or just local
      if (id) {
        await Wn.Sys.exec2(`rm id:${id}`)
      }

      let val = _.filter(this.value, (it, i) => {
        return i != index
      })

      // Notify the change
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnClean() {
      let cmds = []
      _.forEach(this.FileItems, ({ id, value } = {}) => {
        if (value) {
          cmds.push(`rm id:${id}`)
        }
      })
      if (_.isEmpty(cmds)) {
        return
      }
      let cmdText = cmds.join(";")
      await Wn.Sys.exec2(cmdText)
      // Notify the Change
      this.$notify("change", null)
    },
    //--------------------------------------
    setFileObj(key, obj = null) {
      if (key && obj && obj.id) {
        let objs = _.cloneDeep(this.myFileObjs)
        objs[key] = obj
        this.myFileObjs = objs
      }
    },
    //--------------------------------------
    setUploadProgress(id, progress = 0) {
      let pr = _.cloneDeep(this.myUploadProgress)
      pr[id] = progress
      this.myUploadProgress = pr
    },
    //--------------------------------------
    setUploadDone(id, done = true) {
      let ud = _.cloneDeep(this.myUploadDone)
      ud[id] = done
      this.myUploadDone = ud
    },
    //--------------------------------------
    async OnUploadFiles(files = []) {
      // Guard
      if (!_.isEmpty(this.myUploadFiles)) {
        return await Ti.Toast.Open("file uploading, please try later!", "warn")
      }

      let list = _.map(files, f => f)

      // Add to upload list
      let uploadItems = []
      for (let i = 0; i < list.length; i++) {
        let li = list[i]
        uploadItems.push({
          id: `UP-${i}`,
          file: li,
          index: i
        })
      }

      this.myUploadFiles = uploadItems
      this.myUploadProgress = {}  // {"UP-0":.387, "UP-1": 1}
      this.myUploadDone = {}

      // Upload each file
      let newVals = []
      for (let it of uploadItems) {
        let val = await this.uploadOneFile(it)
        newVals.push(val)
      }

      // Clean
      this.myUploadFiles = []
      this.myUploadProgress = {}
      this.myUploadDone = {}

      // Notify Change
      let val = _.concat(this.value || [], newVals)
      this.$notify("change", val)
    },
    //--------------------------------------
    checkTypeInGivenList(list, str, invalidMsg, vars) {
      if (!_.isEmpty(list)) {
        let invalid = true
        for (let li of list) {
          if (li == str) {
            invalid = false
            break
          }
        }
        if (invalid) {
          return {
            ok: false,
            msg: Ti.I18n.textf(invalidMsg, vars)
          }
        }
      }
      return { ok: true }
    },
    //--------------------------------------
    async uploadOneFile(uploadItem = {}) {
      let { id, file } = uploadItem
      let uploadDone = _.get(this.myUploadDone, id)

      // Guard
      if (uploadDone) {
        return
      }
      //................................
      // Eval the target
      let type = Ti.Util.getSuffixName(file.name, true)
      let taPath = Ti.S.renderBy(this.target, {
        type,
        name: file.name,
        majorName: Ti.Util.getMajorName(file.name)
      })

      //................................
      // Upload file to destination
      this.setUploadProgress(id)

      let { ok, msg, data } = await Wn.Io.uploadFile(file, {
        target: taPath,
        mode: "r",
        progress: (pe) => {
          let progress = pe.loaded / pe.total
          this.setUploadProgress(id, progress)
        }
      })

      //................................
      // Mark done
      this.setUploadProgress(id, 100)

      //................................
      // Fail to upload
      if (!ok) {
        await Ti.Alert(`i18n:${msg}`, { type: "warn", icon: "zmdi-alert-triangle" })
        return
      }

      //................................
      // do Filter
      if (!_.isEmpty(this.ImageFilter)) {
        let cmd = [
          "imagic", `id:${data.id}`,
          `-filter "${this.ImageFilter.join(" ")}"`]
        if (this.quality > 0 && this.quality <= 1) {
          cmd.push(`-qa ${this.quality}`)
        }
        cmd.push("-out inplace")
        let cmdText = cmd.join(" ")
        await Wn.Sys.exec2(cmdText)
      }

      //................................
      // Transform value
      let val = Wn.Io.formatObjPath(data, this.valueType)

      //................................
      // Save obj
      this.setUploadDone(id, true)
      this.setFileObj(val, data)

      //................................
      return val
    },
    //--------------------------------------
    async reload() {
      // Guard
      if (_.isEmpty(this.value)) {
        return
      }
      // Load each obj
      let objs = {}
      for (let val of this.value) {
        let obj = await Wn.Io.loadObjAs(val, this.valueType)
        objs[val] = obj
      }
      this.myFileObjs = objs
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