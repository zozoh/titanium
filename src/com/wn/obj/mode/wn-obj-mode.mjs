export default {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : [Number, String, Object],
      default : 0
    },
    "valueType" : {
      type : String,
      default : "decimal",
      validator : v => /^(obj|decimal|str|octal)$/.test(v)
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ModeObj() {
      return Wn.Obj.parseMode(this.value || 0)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnToggleItem(key) {
      let obj = _.cloneDeep(this.ModeObj)
      let val = _.get(obj, key)
      _.set(obj, key, val ? false : true)
      let md = Wn.Obj.modeFromObj(obj)

      let v = ({
        "obj" : (md)=>{
          return Wn.Obj.modeToObj(md)
        },
        "decimal" : (md)=>{
          return md
        },
        "str" : (md)=>{
          return Wn.Obj.modeToStr(md)
        },
        "octal" : (md)=>{
          return Wn.Obj.modeToOctal(md)
        }
      })[this.valueType](md)

      this.$notify("change", v)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}