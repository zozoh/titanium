export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    theTreeData : []
  }),
  //////////////////////////////////////////
  props : {
    "className" : null,
    "data" : null,
    "mainWidth" : {
      type : [String, Number],
      default : 200
    },
    "border" : {
      type : String,
      default : "cell",
      validator : v => /^(row|column|cell|none)$/.test(v)
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theTreeDisplay() {
      return {
        key : "name",
        comType : "ti-label",
        comConf : (it)=>({
          className : _.kebabCase(`is-${it.nameType}`),
          editable  : 'Key' == it.nameType,
          format : 'Index' == it.nameType ? "[${val}]" : undefined,
        })
      }
    },
    //--------------------------------------
    theTreeFields() {
      return [{
        title : "i18n:value",
        display : {
          key : "value",
          ignoreNil : false,
          comType : "ti-obj-json-value",
          comConf : {
            valueType   : "${valueType}",
            valuePath   : "${=rowId}",
            showActions : "${=isCurrent}"
          }
        }
      }]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalTreeData() {
      let list = []
      // Join the top data
      this.joinTreeTableRow(list, this.data)
      // Set the data
      this.theTreeData = list
    },
    //--------------------------------------
    getJsValueType(val) {
      if(Ti.Util.isNil(val))
        return "Nil"

      if(_.isArray(val))
        return "Array"
      
      if(_.isNumber(val)) {
        if(val === parseInt(val)) {
          return "Integer"
        }
        return "Float"
      }

      return _.upperFirst(typeof val)
    },
    //--------------------------------------
    joinTreeTableRow(list=[], item, key) {
      let nameType;
      let valueType = this.getJsValueType(item)
      // Default itemKey is self-type
      // For top leval
      if(_.isUndefined(key)) {
          key = valueType
          nameType = "Label"
      }
      // Index key
      else if(_.isNumber(key)) {
        nameType = "Index"
      }
      // String key
      else {
        nameType = "Key"
      }
      //................................
      // undefined
      if(_.isUndefined(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : undefined
        })
      }
      //................................
      // null
      else if(_.isNull(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : null
        })
      }
      //................................
      // Array
      if(_.isArray(item)) {
        // Create self
        let node = {
          nameType, valueType: "Array",
          name  : key,
          value : item,
          children : []
        }
        // Join Children
        for(let i=0; i<item.length; i++) {
          let child = item[i]
          this.joinTreeTableRow(node.children, child, i)
        }
        // Join self
        list.push(node)
      }
      //................................
      // Object
      else if(_.isPlainObject(item)) {
        // Create self
        let node = {
          nameType, valueType: "Object",
          name  : key,
          value : item,
          children : []
        }
        // Join Children
        _.forEach(item, (v, k)=>{
          this.joinTreeTableRow(node.children, v, k)
        })
        // Join self
        list.push(node)
      }
      //................................
      // Boolean
      else if(_.isBoolean(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : item ? true : false
        })
      }
      //................................
      // Number 
      else if(_.isNumber(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : item * 1
        })
      }
      //................................
      // String
      else if(_.isString(item)) {
        list.push({
          nameType, valueType,
          name  : key,
          value : item + ""
        })
      }
    },
    //--------------------------------------
    onItemChanged({name, value, data, node}={}) {
      console.log({name,value, data, node})
      // Guard it
      if(!node.id) {
        return;
      }

      // Prepare the new Data
      let newData = _.cloneDeep(this.data)

      // Get the target JSON path
      let path = node.id.split("/")
      
      // Modify the Array/Object
      if(/^(Array|Object)$/.test(path[0])) {
        let keys = _.slice(path, 1).join(".")
        // Set the Key
        if("name" == name) {
          newData = Ti.Util.setKey(newData, keys, value)
        }
        // Set the Value
        else if("value" == name) {
          // Eval the value smartly
          let fn = ({
            "Integer" : (v)=> {
              let v2 = parseInt(v)
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Float" : (v)=> {
              let v2 = v * 1
              if(isNaN(v2)) {
                return v
              }
              return v2
            }
          })[data.valueType]
          let v2 = _.isFunction(fn) ? fn(value) : value
          
          // Set it to data
          _.set(newData, keys, v2)
        }
      }
      // Modify the top data
      else {
        newData = value
      }

      // Emit the change
      this.$emit("changed", newData)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : function(){
      this.evalTreeData()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.evalTreeData()
  }
  //////////////////////////////////////////
}