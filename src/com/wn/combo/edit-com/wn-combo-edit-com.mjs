export default {
  ////////////////////////////////////////////////////
  data : ()=>({
    myCom: null
  }),
  ////////////////////////////////////////////////////
  // props 
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "placeholder" : {
      type: String,
      default: "i18n:wn-edit-com-nil"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    Dict() {
      return Wn.Dict.hMakerComponents()
    },
    //------------------------------------------------
    ComIcon() {
      return _.get(this.myCom, "icon")
    },
    //------------------------------------------------
    ComTitle() {
      return _.get(this.myCom, "title")
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async OnClickValue() {
      //console.log("click", this.value)
      let com = await Wn.EditTiComponent(this.value)
      if(com) {
        this.notifyChange(com)
      }
    },
    //--------------------------------------
    OnClickSuffixIcon() {
      this.notifyChange({})
    },
    //--------------------------------------
    notifyChange(com={}) {
      if(!com.comType) {
        com.comType = undefined
        com.comConf = undefined
      }
      this.$notify("change", com)
    },
    //--------------------------------------
    async reloadMyCom() {
      if(!_.isEmpty(this.value)) {
        let {comType} = this.value
        this.myCom = await this.Dict.getItem(comType)
      }
      // Empty
      else {
        this.myCom = null
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value" : {
      handler: "reloadMyCom",
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}