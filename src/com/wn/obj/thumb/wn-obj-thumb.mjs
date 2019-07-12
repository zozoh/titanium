export default {
  /////////////////////////////////////////
  data : ()=>({
    "oImage" : null
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type : String,
      default : null
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : 400
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : 400
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
      required: true,
      default : null
    },
    // which type supported to upload
    // nulllor empty array will support any types
    "supportTypes" : {
      type : [String, Array],
      default : ()=>["png","jpg","jpeg","gif"]
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
    // Display image for <ti-thumb>
    imageSrc() {
      if(this.oImage) {
        return `/o/content?str=id:${this.oImage.id}`
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    async reload() {
      this.oImage = await Wn.Io.loadMeta(this.value)
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : async function() {
      await this.reload()
    }
  },
  //////////////////////////////////////////
  mounted : async function(){
    await this.reload()
  }
  //////////////////////////////////////////
}