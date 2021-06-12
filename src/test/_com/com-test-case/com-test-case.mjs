const _M = {
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
    },
    //----------------------------------------
    ComType() {
      return _.get(this.myCom, "comType")
    },
    //----------------------------------------
    ComConf() {
      let conf = _.get(this.myCom, "comConf")
      return Ti.Util.explainObj(this, conf)
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods : {
    //----------------------------------------
    OnChanged(val) {
      console.log("Com Test Case:", val)
      this.setDataValue(val)
    },
    //----------------------------------------
    setDataValue(val) {
      if(".." == this.ComChanged) {
        if(_.isDate(val)) {
          val = Ti.Types.formatDateTime(val)
        }
        Ti.App(this).dispatch("main/changeContent", val)
      } else {
        let da = _.cloneDeep(this.data)
        _.set(da, this.ComChanged, val)
        Ti.App(this).dispatch("main/changeContent", da)
      }
    },
    //----------------------------------------
    // evalMyCom() {
    //   this.myComType = null
    //   this.myComConf = {}
      
    //   this.$nextTick(()=>{
    //     this.myComType = _.get(this.myCom, "comType")
    //     let comConf = _.get(this.myCom, "comConf")
    //     let theConf = Ti.Util.explainObj(this, comConf)
    //     this.myComConf = theConf
    //   })
    // },
    //----------------------------------------
    async reloadMyCom() {
      let aph = _.get(this.meta, "com")
      this.myCom = {
        comType : "TiLoading",
        comConf : {}
      }
      if(aph) {
        // console.log("haha", JSON.stringify({
        //   metaId: this.meta.id,
        //   data  : JSON.stringify(this.data)
        // }))
        console.log("reloadMyCom", aph)
        let com = await Wn.Io.loadMeta(aph)
        let comInfo = await Wn.Io.loadContent(com, {as:"json"})
        if(comInfo.comPath) {
          await Ti.App(this).loadView({
            comType    : comInfo.comPath,
            components : comInfo.components
          })
        }
        this.myCom = comInfo
      }
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  watch : {
    "meta" : {
      handler : function(newVal, oldVal) {
        if(!_.isEqual(newVal, oldVal)) {
          if(!newVal || !oldVal || newVal.com != oldVal.com) {
            this.reloadMyCom()
          }
        }
      },
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
export default _M;