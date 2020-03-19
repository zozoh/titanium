export default {
  inheritAttrs : false,
  ////////////////////////////////////////////
  data : ()=>({
    myCom  : null,
    myComType : null,
    myComConf : null
  }),
  ////////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "content" : {
      type : String,
      default : null
    },
    "data" : {
      type : [Array, Object, Number, Boolean, String],
      default : null
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "fieldStatus" : {
      type : Object,
      default : ()=>({})
    }
  },
  ////////////////////////////////////////////
  computed : {
    //----------------------------------------
    ComChanged() {
      return _.get(this.myCom, "changed") || ".."
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods : {
    //----------------------------------------
    OnChanged(val) {
      this.setDataValue(val)
    },
    //----------------------------------------
    setDataValue(val) {
      if(".." == this.ComChanged) {
        if(_.isDate(val)) {
          val = Ti.Types.formatDateTime(val)
        }
        Ti.App(this).dispatch("current/changeContent", val)
      } else {
        let da = _.cloneDeep(this.data)
        _.set(da, this.ComChanged, val)
        Ti.App(this).dispatch("current/changeContent", da)
      }
    },
    //----------------------------------------
    evalMyCom() {
      this.myComType = _.get(this.myCom, "comType")
      let comConf = _.get(this.myCom, "comConf")
      let theConf = Ti.Util.explainObj(this, comConf)
      this.myComConf = theConf
    },
    //----------------------------------------
    async reloadMyCom() {
      let aph = _.get(this.meta, "com")
      if(aph) {
        let com = await Wn.Io.loadMeta(aph)
        this.myCom = await Wn.Io.loadContent(com, {as:"json"})
        this.evalMyCom()
      }
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  watch : {
    "meta" : {
      handler : "reloadMyCom",
      immediate : true
    },
    "data" : {
      handler : "evalMyCom",
      immediate : true
    }
  },
  ////////////////////////////////////////////
  mounted : function(){
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "com-test-case",
      everythingOk : ()=>{
        return !this.status.changed
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:no-saved", "warn")
      }
    })
    //----------------------------------------
  },
  ////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("com-test-case")
  }
}