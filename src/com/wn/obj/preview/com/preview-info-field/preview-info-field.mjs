/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data: ()=>({
    theValue : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "icon" : {
      type : String,
      default : null
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "type" : {
      type : String,
      default : "String"
    },
    "title" : {
      type : String,
      default : null
    },
    "name" : {
      type : String,
      default : null
    },
    "dict" : {
      type : String,
      default : null
    },
    "nameWidth" : {
      type : [String, Number],
      default : 50
    },
    "valueWidth" : {
      type : [String, Number],
      default : 200
    },
    "transformer" : {
      type : [String,Object,Function],
      default : null
    }
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : async function() {
      this.theValue = await this.evalTheValue()
    },
    "name" : async function() {
      this.theValue = await this.evalTheValue()
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    theTransformer() {
      return Ti.Types.getFuncBy(this, "transformer")
    },
    theNameStyle() {
      return Ti.Css.toStyle({
        "width" : this.nameWidth
      })
    },
    theValueStyle() {
      return Ti.Css.toStyle({
        "width" : this.valueWidth
      })
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    async evalTheValue() {
      let val = _.get(this.data, this.name)

      if(this.dict) {
        val = await wn.Dict.get(this.dict, val)
      }

      if(_.isFunction(this.theTransformer)) {
        val = this.theTransformer(val)
      }

      return val
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function(){
    this.theValue = await this.evalTheValue()
  }
  ///////////////////////////////////////////////////
}