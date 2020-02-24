export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    explainDict : async function(value, dict){
      return await Wn.Dict.get(dict, value)
    }
  }),
  ///////////////////////////////////////////////////
  props : {
    "icon" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "display" : {
      type : String,
      default : "all"
    },
    "currentTab" : {
      type : Number,
      default : 0
    },
    "keepTabIndexBy" : {
      type : String,
      default : null
    },
    "config" : {
      type : Object,
      default : null
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    // "status" : {
    //   type : Object,
    //   default : null
    // },
    "fieldStatus" : {
      type : Object,
      default : ()=>({})
    },
    "autoShowBlank" : {
      type : Boolean,
      default : true
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        icon : "zmdi-alert-circle-o",
        text : "empty-data"
      })
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    //-------------------------------------------------
    topClass() {
      return this.className
    },
    //-------------------------------------------------
    theConfig() {
      return this.evalFormConfig(this.config);
    },
    //-------------------------------------------------
    hasData() {
      return !_.isEmpty(this.data)
    }
    //-------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods : {
    //-------------------------------------------------
    onChanged(payload) {
      this.$emit("changed", payload)
    },
    //-------------------------------------------------
    onInvalid(payload) {
      this.$emit("invalid", payload)
    },
    //-------------------------------------------------
    evalFormConfig(obj) {
      // Plain Object
      if(_.isPlainObject(obj)) {
        // Function call
        if(obj.method) {
          return this.evalFunctionCall(obj)
        }
        // Plain object
        return _.mapValues(obj, (val)=>{
          return this.evalFormConfig(val)
        })
      }
      // Array
      if(_.isArray(obj)) {
        return _.map(obj, (val)=>{
          return this.evalFormConfig(val)
        })
      }
      // Others
      return obj
    },
    //-------------------------------------------------
    evalFunctionCall({method, args=[]}={}) {
      if("Wn.Sys.exec" == method){
        return this.createWnSysExecCall(Wn.Sys.exec, args)
      }
      if("Wn.Sys.exec2" == method){
        return this.createWnSysExecCall(Wn.Sys.exec2, args)
      }
      if("Wn.Io.find" == method){
        return async function() {
          return await Wn.Io.find(...args)
        }
      }
      if("Wn.Io.findList" == method){
        return async function() {
          return await Wn.Io.findList(...args)
        }
      }
      if("Wn.Io.findInBy" == method){
        return async function(val) {
          return await Wn.Io.findInBy(val, ...args)
        }
      }
      if("Wn.Io.findListInBy" == method){
        return async function(val) {
          return await Wn.Io.findListInBy(val, ...args)
        }
      }
      if("Wn.Dict.getAll" == method){
        return async function(){
          return await Wn.Dict.getAll(...args)
        }
      }
      if("Wn.Dict.get" == method){
        return async function(val){
          return await Wn.Dict.get(...args, val)
        }
      }
    },
    //-------------------------------------------------
    createWnSysExecCall(func, args) {
      let cmdText, options
      // args like [$cmdText, {..options..}]
      if(_.isArray(args)) {
        cmdText = _.get(args, 0)
        options = _.get(args, 1) || {as:"json"}
      }
      // The args is just normalze string
      else {
        cmdText = args
        options = {as:"json"}
      }
      if(!cmdText)
        return
      /*
      ES template style template:
      ```
      obj -match 'nm:"${val}"' -l -json
      ``` 
      Use `${val}` to place the `interpolate`
       */
      //const cmdTmpl =  _.template(cmdText);
      return async function(val) {
        // let vars = _VARS(val)
        // let cmd = cmdTmpl(vars)
        let cmd = Ti.S.toStr(cmdText, val)
        return await func.apply(vm, [cmd, options])
      }
    }
    //-------------------------------------------------
  }
  //////////////////////////////////////////////////////
}