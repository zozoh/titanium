const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myCurrentIndex: 0
  }),
  //////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data" : {
      type : Array,
      default : ()=>[]
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "previewComType" : {
      type: String,
      default : "WebMedia"
    },
    "previewComConf" : {
      type : Object,
      default : ()=>({
        value : "=.."
      })
    },
    "itemComConf" : {
      type : Object,
      default : ()=>({})
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "scrollerClass" : {
      type : [Object, String, Array],
      default : "btn-at-inner btn-as-circle"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasNext() {
      return this.data && this.myCurrentIndex < (this.data.length - 1)
    },
    //--------------------------------------
    hasPrev() {
      return this.myCurrentIndex > 0
    },
    //--------------------------------------
    CurrentPreviewData() {
      return _.nth(this.data, this.myCurrentIndex)
    },
    //--------------------------------------
    CurrentPreviewComConf() {
      return Ti.Util.explainObj({
        data: this.CurrentPreviewData,
        hasNext : this.hasNext,
        hasPrev : this.hasPrev
      }, this.previewComConf)
    },
    //--------------------------------------
    ScrollerComConf() {
      return {
        cols : 0,
        data : this.data,
        currentIndex : this.myCurrentIndex,
        comType : "WebMediaImage",
        comConf : this.itemComConf,
        clickItem : ({index})=>{
          this.myCurrentIndex = index
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnGoPrev() {
      if(this.hasPrev) {
        this.myCurrentIndex --;
      }
    },
    //--------------------------------------
    OnGoNext() {
      if(this.hasNext) {
        this.myCurrentIndex ++
      }
    },
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;