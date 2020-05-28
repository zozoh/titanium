const _M = {
  /////////////////////////////////////////
  data : ()=>({
    "src_ts" : null,
    "oFile"     : null,
    "uploadFile" : null,
    "progress"   : -1
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type : String,
      default : null
    },
    // raw value is WnObj
    // If declare the valueType
    // It will transform the WnObj
    // to relaitve value mode
    "valueType": {
      type: String,
      default: "obj",
      validator: v => /^(obj|path|fullPath|idPath|id)$/.test(v)
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : undefined
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : undefined
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    },
    // Indicate the upload target when upload new value
    // Of cause, if the `value` exists, replace it
    // The `target` must be a path to a image object,
    // it will auto transfrom the image format by `cmd_imagic`
    "target" : {
      type : String,
      default : null
    },
    // which type supported to upload
    // nulll or empty array will support any types
    "supportTypes" : {
      type : [String, Array],
      default : ()=>[]
      //default : ()=>["png","jpg","jpeg","gif"]
    },
    // which mime supported to upload
    // nulll or empty array will support any mimes
    "supportMimes" : {
      type : [String, Array],
      default : ()=>[]
      //default : ()=>["image/png","image/jpeg","image/gif"]
    },
    // Image object only: it will auto apply image filter
    // just like clip the image size etc..
    // @see cmd_imagic for more detail about the filter
    "filter" : {
      type : [Array, String],
      default : null
    },
    // Image object only: if `>0 and <=1` mean output quality
    // if not match the range, will depends on the `cmd_imagic` default
    "quality" : {
      type : Number,
      default : 0
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    AcceptTypes() {
      if(_.isString(this.supportTypes))
        return this.supportTypes.split(",")
      return this.supportTypes
    },
    //--------------------------------------
    AcceptMimes() {
      if(_.isString(this.supportMimes))
        return this.supportMimes.split(",")
      return this.supportMimes
    },
    //--------------------------------------
    ImageFilter() {
      if(!this.filter)
        return []
      return [].concat(this.filter)
    },
    //--------------------------------------
    // Display image for <ti-thumb>
    PreviewIcon() {
      //....................................
      if(this.oFile) {
        //..................................
        // Image
        if(Wn.Obj.isMime(this.oFile, /^(image\/)/)) {
          let ss = ["/o/content?str=id:", this.oFile.id]
          if(this.src_ts) {
            ss.push("&_t=")
            ss.push(this.src_ts)
          }          
          return {
            type: "image", value: ss.join("")
          }
        }
        //..................................
        // Video
        if(Wn.Obj.isMime(this.oFile, /^(video\/)/)) {
          let ss = ["/o/content?str=id:", this.oFile.video_cover]
          if(this.src_ts) {
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
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async assertListHas(list, str, invalidMsg, vars) {
      if(!_.isEmpty(list)) {
        let invalid  = true
        for(let li of list) {
          if(li == str) {
            invalid = false
            break
          }
        }
        if(invalid) {
          console.log("haha")
          await Ti.Alert(invalidMsg, {
            type:"warn",
            icon:"zmdi-alert-triangle",
            vars
          })
          return false
        }
      }
      return true
    },
    //--------------------------------------
    async onOpen() {
      // remove the thumb file
      if(this.oFile) {
        let link = Wn.Util.getAppLink(this.oFile)
        //console.log("it will open ", link)
        await Ti.Be.Open(link.url, {params:link.params})
      }
    },
    //--------------------------------------
    async onRemove() {
      // remove the thumb file
      if(this.oFile) {
        await Wn.Sys.exec2(`rm id:${this.oFile.id}`)
      }
      // Notify the change
      this.$notify("change", null)
    },
    //--------------------------------------
    async onUpload(file) {
      //console.log("it will upload ", file)

      //................................
      // Check for support Types
      let type = Ti.Util.getSuffixName(file.name)
      if(!await this.assertListHas(
        this.AcceptTypes, type, 
        'i18n:wn-invalid-types',
        {current: type, supports: this.AcceptTypes.join(", ")})
      ) {
        return
      }
      if(!await this.assertListHas(
        this.AcceptMimes, file.type, 
        'i18n:wn-invalid-mimes',
        {current:file.type, supports:this.AcceptMimes.join(", ")})
      ) {
        return
      }

      //................................
      // Upload file to destination
      this.uploadFile = file
      this.progress = 0

      let {ok, msg, data} = await Wn.Io.uploadFile(file, {
        target : this.target,
        mode   : "r",
        progress : (pe)=> {
          this.progress = pe.loaded / pe.total
        }
      })

      //................................
      // Reset upload
      this.uploadFile = null
      this.progress = -1

      //................................
      // Fail to upload
      if(!ok) {
        await Ti.Alert(`i18n:${msg}`, {type:"warn", icon:"zmdi-alert-triangle"})
        return
      }

      //................................
      // do Filter
      if(!_.isEmpty(this.ImageFilter)) {
        let cmd = [
          "imagic", `id:${data.id}`, 
          `-filter "${this.ImageFilter.join(" ")}"`]       
        if(this.quality>0 && this.quality<=1) {
          cmd.push(`-qa ${this.quality}`)
        }
        cmd.push("-out inplace")
        let cmdText = cmd.join(" ")
        await Wn.Sys.exec2(cmdText)
      }

      //................................
      // done
      this.src_ts = Date.now()
      this.oFile = data

      //................................
      // Transform value
      let val = data
      if ("path" == this.valueType) {
        val = Wn.Io.getFormedPath(data)
      } else if ("fullPath" == this.valueType) {
        val = data.ph
      } else if ("idPath" == this.valueType) {
        val = `id:${data.id}` 
      } else if ("id" == this.valueType) {
        val = data.id
      }

      //................................
      this.$notify("change", val)
    },
    //--------------------------------------
    async reload() {
      if(this.value) {
        this.oFile = await Wn.Io.loadMeta(this.value)
      }
      // Reset
      else {
        this.oFile = null
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "value" : function() {
      this.reload()
    }
  },
  //////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
  //////////////////////////////////////////
}
export default _M;