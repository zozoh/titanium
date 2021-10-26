const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    lines : []
  }),
  ////////////////////////////////////////////////////
  props : {
    "value" : String,
    "tipText" : String,
    "tipIcon" : String,
    "vars" : Object,
    "as": {
      type : String,
      default: "text"
    },
    "emitName": String,
    "emitPayload" : undefined,
    "emitSuccess": String,
    "emitError": String,
    "input" : String,
    "forceFlushBuffer" : {
      type : Boolean,
      default: true
    },
    "showRunTip" : {
      type : Boolean,
      default : true
    },
    "showTailRunTip": {
      type : Boolean,
      default : undefined
    },
    //
    // Callback
    // 
    "afterRunCommand" : Function,
    "whenSuccess" : Function,
    "whenError" : Function
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    clear() {
      this.lines = []
    },
    //------------------------------------------------
    async runCommand() {
      if(!this.value)
        return
      
      if(this.showRunTip) {
        this.printHR()
        this.lines.push(Ti.I18n.get("run-welcome"))
      }

      // let re = await Wn.Sys.exec(this.value, {
      //   as : this.as,
      //   vars : this.vars,
      //   input : this.input, 
      //   forceFlushBuffer : this.forceFlushBuffer,
      //   eachLine : (line)=>{
      //     this.lines.push(line)
      //   }
      // })
      let re ;
      try{
        re = await this.exec(this.value)
        if(/^e\./.test(re)) {
          throw re
        }
        // Success
        if(_.isFunction(this.whenSuccess)) {
          await this.whenSuccess(re, {$panel:this})
        }
        if(this.emitSuccess) {
          this.$notify(this.emitSuccess, this.emitPayload || re)  
        }
      }
      // Fail
      catch(err) {
        if(_.isFunction(this.whenError)) {
          await this.whenError(err, {$panel:this})
        }
        if(this.emitError) {
          this.$notify(this.emitError, this.emitPayload || err)  
        }
      }

      //
      // Always 
      //
      if(_.isFunction(this.afterRunCommand)) {
        await this.afterRunCommand(re, {$panel:this})
      }
      if(this.emitName) {
        this.$notify(this.emitName, this.emitPayload || re)
      }
    },
    //------------------------------------------------
    async exec(cmdText, options={}) {
      if(this.vars) {
        cmdText = Ti.S.renderBy(cmdText, this.vars)
      }
      if(this.showRunTip || options.showRunTip) {
        this.printHR()
        this.lines.push("> " + cmdText)
        this.printHR()
      }

      let re = await Wn.Sys.exec(cmdText, {
        //...............................
        as : this.as,
        input : this.input, 
        forceFlushBuffer : this.forceFlushBuffer,
        //...............................
        ... options,
        //...............................
        eachLine : (line)=>{
          this.lines.push(line)
        }
      })
      let showTailRunTip = Ti.Util.fallback(
        this.showTailRunTip, options.showTailRunTip,
        this.showRunTip, options.showRunTip
      )
      if(showTailRunTip) {
        this.printHR()
        this.lines.push("--> " + cmdText)
        this.printHR()
        this.lines.push(Ti.I18n.get("run-finished"))
      }

      return re
    },
    //------------------------------------------------
    println(str, vars) {
      if(!_.isEmpty(vars)) {
        str = Ti.S.renderBy(str, vars)
      }
      this.lines.push(str)
    },
    //------------------------------------------------
    printHR(c="-") {
      let hr = _.repeat(c, 40)
      this.lines.push(hr)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : {
      handler: "runCommand",
      immediate : true
    }, 
    "lines" : function() {
      this.$nextTick(()=>{
        this.$refs.lines.scrollTop = this.$refs.lines.scrollHeight * 2
      })
    }
  }
  ////////////////////////////////////////////////////
}
export default _M;