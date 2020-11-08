export default {
  /////////////////////////////////////////
  data: ()=>({
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type: [String, Object],
      default: undefined
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    MainData() {
      if(_.isString(this.value)) {
        return JSON.parse(this.value)
      }
      return _.cloneDeep(this.value)
    },
    //------------------------------------
    MainCom() {
      // Nil
      if(!this.MainData) {
        return {
          comType : 'TiLoading',
          comConf : {
            className : "as-big",
            icon: "zmdi-arrow-left",
            text: "i18n:nil-detail"
          }
        }
      }
      // Dao Mapping
      if(this.MainData.dao && _.isArray(this.MainData.fields)) {
        return {
          comType : 'HmakerConfigIoIxDao',
          comConf : {
            value : this.MainData
          }
        }
      }
      // Default as JSON
      return {
        comType : "TiTextJson",
        comConf : {
          value : this.MainData
        }
      }
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    
    //------------------------------------
  },
  /////////////////////////////////////////
  watch : {
    
  }
  /////////////////////////////////////////
}