export default {
  //////////////////////////////////////////
  data: ()=>({
    myCom: null
  }),
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //------------------------------------------------
    Dict() {
      return Wn.Dict.hMakerComponents()
    },
    //--------------------------------------
    ComTypeComboInput() {
      return {
        options : this.Dict,
        placeholder : "i18n:hmaker-com-type-blank",
        autoI18n : true,
        mustInList : true,
        autoCollapse : true,
        dropDisplay : ["<icon:im-plugin>", "title|name"]
      }
    },
    //--------------------------------------
    hasEditCom() {
      return this.myCom ? true : false
    },
    //--------------------------------------
    ComType() {
      return _.get(this.value, "comType")
    },
    //--------------------------------------
    ComConf() {
      return _.get(this.value, "comConf")
    },
    //--------------------------------------
    EditComType() {
      return _.get(this.myCom, "editComType")
    },
    //--------------------------------------
    EditComConf() {
      let conf = _.get(this.myCom, "editComConf")
      return Ti.Util.explainObj(this.value, conf)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async OnComTypeChange(comType) {
      this.myCom = await this.Dict.getItem(comType)
      this.notifyChange({
        comType,
        comConf: this.ComConf
      })
    },
    //--------------------------------------
    OnComConfChange(comConf={}) {
      this.notifyChange({
        comType: this.ComType,
        comConf
      })
    },
    //--------------------------------------
    notifyChange(payload={}) {
      this.$notify("change", payload)
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
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "value" : {
      handler: "reloadMyCom",
      immediate : true
    }
  }
  //////////////////////////////////////////
}