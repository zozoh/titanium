export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    
  }),
  //////////////////////////////////////////
  props : {
    "value" : null,
    "valueType" : {
      type : String,
      default : "Nil"
    },
    "valuePath" : {
      type : [String, Array],
      default : ()=>[]
    },
    "showActions" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    isLabel() {
      return /^(Array|Object)$/.test(this.valueType)
    },
    //--------------------------------------
    isTop() {
      return this.theValuePath.length <= 1
    },
    //--------------------------------------
    theLabelDisplayText() {
      if('Array' == this.valueType) {
        return '[..]'
      }
      if('Object' == this.valueType) {
        return '{..}'
      }
      return '???'
    },
    //--------------------------------------
    theValuePath() {
      if(_.isArray(this.valuePath)) {
        return this.valuePath
      }
      if(_.isString(this.valuePath)) {
        return _.without(this.valuePath.split(/[\/.]/g), "")
      }
      return []
    },
    //--------------------------------------
    theValueClassName() {
      return _.kebabCase(`is${this.valueType}`)
    },
    //--------------------------------------
    theValueFormat() {
      if('String' == this.valueType) {
        return function(val) {
          if(val) {
            return `"${val}"`
          }
          return '""'
        }
      }
    },
    //--------------------------------------
    theActionMenuData() {
      //................................
      // Add
      let menuData = [{
        key  : "jv-add",
        type : "action",
        icon : "zmdi-plus",
        action : ()=>{
          console.log("add", this)
        }
      }]
      //................................
      // Remove : If not the top
      if(!this.isTop) {
        menuData.push({
          type : "line"
        })
        menuData.push({
          key  : "jv-remove",
          type : "action",
          icon : "zmdi-delete",
          action : ()=>{
            console.log("delete", this)
          }
        })
      }
      //................................
      // More: Change Type
      menuData.push({
        type : "line"
      })
      menuData.push({
        key  : "jv-types",
        type : "group",
        icon : "zmdi-more",
        items : [{
          key   : "jvTypeBoolean",
          text  : "i18n:json-Boolean",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            console.log("to-> Boolean")
          }
        }, {
          key   : "jvTypeInteger",
          text  : "i18n:json-Integer",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            console.log("to-> Integer")
          }
        }, {
          key   : "jvTypeFloat",
          text  : "i18n:json-Float",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            console.log("to-> Float")
          }
        }, {
          key   : "jvTypeString",
          text  : "i18n:json-String",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            console.log("to-> String")
          }
        }, {
          key   : "jvTypeArray",
          text  : "i18n:json-Array",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            console.log("to-> Array")
          }
        }, {
          key   : "jvTypeObject",
          text  : "i18n:json-Object",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            console.log("to-> Object")
          }
        }, {
          key   : "jvTypeNil",
          text  : "i18n:json-Nil",
          type  : "action",
          altDisplay : {
            icon : "zmdi-check",
            capture : false
          },
          action : ()=>{
            console.log("to-> Nil")
          }
        }]
      })
      // Done
      return menuData
    },
    //--------------------------------------
    theActionMenuStatus() {
      return {
        jvTypeBoolean : "Boolean" == this.valueType,
        jvTypeInteger : "Integer" == this.valueType,
        jvTypeFloat   : "Float"   == this.valueType,
        jvTypeNumber  : "Number"  == this.valueType,
        jvTypeString  : "String"  == this.valueType,
        jvTypeArray   : "Array"   == this.valueType,
        jvTypeObject  : "Object"  == this.valueType,
        jvTypeNil     : "Nil"     == this.valueType
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    
  },
  //////////////////////////////////////////
  mounted : function() {
    
  }
  //////////////////////////////////////////
}