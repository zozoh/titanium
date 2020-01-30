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
        return "Number"
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
          key = `i18n:json-${valueType}`
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
    async doAdd(data={}, path=[]) {
      // Looking for the target from data
      let target = _.isEmpty(path) ? data : _.get(data, path)
      //.....................................
      // Guard: Fail to find the target
      if(_.isUndefined(target)) {
        return
      }
      //.....................................
      // If Array
      if(_.isArray(target)) {
        // just append the nil at tail
        target.push(null)
      }
      //.....................................
      // If Object
      else if(_.isPlainObject(target)) {
        // ask the key
        let newKey = await Ti.Prompt("i18n:json-new-key")
        if(Ti.Util.isNil(newKey)) {
          return
        }
        // and insert nil at the tail
        target[newKey] = null
      }
      //.....................................
      // Other, it must be simple value
      else if(path.length > 0){
        //...................................
        // get the parent node
        let p_ph = path.slice(0, path.length-1);
        let parent = _.isEmpty(p_ph) ? data : _.get(data, p_ph);
        let keyOrIndex = _.last(path)
        //...................................
        // Prepare the new data
        let stub;
        //...................................
        // If array, insert nil after current
        if(_.isArray(parent)) {
          stub = []
          _.forEach(parent, (val, index)=>{
            stub.push(val)
            if(index == keyOrIndex) {
              stub.push(null)
            }
          })
        }
        //...................................
        // If Object
        else if(_.isPlainObject(parent)) {
          stub = {}
          // ask the key
          let newKey = await Ti.Prompt("i18n:json-new-key")
          if(Ti.Util.isNil(newKey)) {
            return
          }
          // and insert nil after current path
          _.forEach(parent, (val, key)=>{
            stub[key] = val
            if(key == keyOrIndex) {
              stub[newKey] = null
            }
          })
        }
        //...................................
        // If root, return the stub 
        if(p_ph.length == 0) {
          return stub
        }
        // Set stub
        _.set(data, p_ph, stub)
      }
      //.....................................
      return data
    },
    //--------------------------------------
    doRemove(data={}, path=[]) {
      // Forbid to remove the top
      if(_.isEmpty(path)) {
        return
      }
      //...................................
      // get the parent node
      let p_ph = path.slice(0, path.length-1);
      let parent = _.isEmpty(p_ph) ? data : _.get(data, p_ph);
      let keyOrIndex = _.last(path)
      //...................................
      // Prepare the new data
      let stub;
      //...................................
      // If array, insert nil after current
      if(_.isArray(parent)) {
        stub = []
        _.forEach(parent, (val, index)=>{
          if(index != keyOrIndex) {
            stub.push(val)
          }
        })
      }
      //...................................
      // If Object
      else if(_.isPlainObject(parent)) {
        stub = {}
        // and insert nil after current path
        _.forEach(parent, (val, key)=>{
          if(key != keyOrIndex) {
            stub[key] = val
          }
        })
      }
      //...................................
      // If root, return the stub 
      if(p_ph.length == 0) {
        return stub
      }
      // Set stub
      _.set(data, p_ph, stub)
      //.....................................
      return data
    },
    //--------------------------------------
    doChangeValueType(data={}, path=[], type) {
      // Get the source
      let isRoot = _.isEmpty(path);
      let src = isRoot ? data : _.get(data, path)
      //.....................................
      // Prepare converter
      let convert = ({
        //...................................
        "Boolean" : (src)=>{
          return src ? true : false
        },
        //...................................
        "Number" : (src)=>{
          let nb = src * 1
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "Integer" : (src)=>{
          let nb = parseInt(src)
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "Float" : (src)=>{
          let nb = src * 1
          return isNaN(nb) ? -1 : nb
        },
        //...................................
        "String" : (src)=>{
          // Array/Object
          if(_.isArray(src) || _.isObject(src)) {
            return JSON.stringify(src)
          }
          // Other value
          return src + ""
        },
        //...................................
        "Array" : (src)=>{
          // Array
          if(_.isArray(src)) {
            return
          }
          // Nil
          else if(Ti.Util.isNil(src)) {
            return []
          }
          // Wrap to array
          else {
            return [src]
          }
        },
        //...................................
        "Object" : (src)=>{
          // Array
          if(_.isArray(src)) {
            // Try array as pairs
            let pairs = _.fromPairs(src)
            let stub = {}
            _.forEach(pairs, (val, key)=>{
              if(!Ti.Util.isNil(key) && !_.isUndefined(val)) {
                stub[key] = val
              }
            })
            // Maybe merget it 
            if(_.isEmpty(stub) && !_.isEmpty(src)) {
              Ti.Util.merge(stub, src)
            }
            // Whatever return the object
            return stub
          }
          // Object
          else if(_.isPlainObject(src)) {
            return
          }
          // String try to JSON
          else if(_.isString(src)) {
            return Ti.Types.safeParseJson(src, {
              "value" : src
            })
          }
          // Other value, just wrap to Object
          return {"value": src}
        },
        //...................................
        "Nil" : (src)=>{
          return null
        }
        //...................................
      })[type]
      //.....................................
      // Do convert
      if(_.isFunction(convert)) {
        let stub = convert(src)
        // Canceled
        if(_.isUndefined(stub)) {
          return
        }
        // Root object, return directly
        if(isRoot) {
          return stub
        }
        // Update to main data
        _.set(data, path, stub)
        return data
      }
      //.....................................
      // Fail to find the converter, return undeinfed to cancel
    },
    //--------------------------------------
    async onItemChanged({name, value, data, node}={}) {
      console.log({name,value, data, node})
      //....................................
      // Guard it
      if(!node.id) {
        return;
      }
      //....................................
      // Prepare the new Data
      let newData = _.cloneDeep(this.data)
      //....................................
      // Get the target JSON path
      let path = node.id.split("/")
      //....................................
      // Mutate JSON structure
      if(value && value.jsonMutate) {
        let fn = ({
          Add             : this.doAdd,
          Remove          : this.doRemove,
          ChangeValueType : this.doChangeValueType
        })[value.jsonMutate]
        // Invoke it
        let keys = _.slice(path, 1)
        newData = await Ti.DoInvoke(fn, _.concat([newData, keys], value.args), this)

        // Canceled the mutation
        if(_.isUndefined(newData)) {
          return
        }
      }
      //....................................
      // Modify the Array/Object
      else if(/^(Array|Object)$/.test(path[0])) {
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
            },
            "Number" : (v)=> {
              let v2 = v * 1
              if(isNaN(v2)) {
                return v
              }
              return v2
            },
            "Nil" : (v)=> {
              return Ti.S.toJsValue(v, {
                autoDate : false
              })
            }
          })[data.valueType]
          let v2 = _.isFunction(fn) ? fn(value) : value
          
          // Set it to data
          _.set(newData, keys, v2)
        }
      }
      //....................................
      // Modify the top data
      else {
        newData = value
      }
      //....................................
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