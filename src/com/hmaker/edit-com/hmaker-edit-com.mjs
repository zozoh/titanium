export default {
  //////////////////////////////////////////
  data: ()=>({
    $dict: null,
    myCom: null
  }),
  //////////////////////////////////////////
  props : {
    "comType" : {
      type : String,
      default : undefined
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    ComTypeComboInput() {
      return {
        options : "@Dict:hMakerComponents",
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
    EditComType() {
      return _.get(this.myCom, "editComType")
    },
    //--------------------------------------
    EditComConf() {
      let conf = _.get(this.myCom, "editComConf")
      return Ti.Util.explainObj(this, conf)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async OnComTypeChange(comType) {
      this.myCom = await this.$dict.getItem(comType)
      this.notifyChange({
        comType,
        comConf: this.comConf
      })
    },
    //--------------------------------------
    OnComConfChange(comConf={}) {
      this.notifyChange({
        comType: this.comType,
        comConf
      })
    },
    //--------------------------------------
    notifyChange(payload={}) {
      this.$notify("change", payload)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  created: async function() {
    this.$dict = Wn.Dict.hMakerComponents()
    if(this.comType) {
      this.myCom = await this.$dict.getItem(this.comType)
    }
  }
  //////////////////////////////////////////
}