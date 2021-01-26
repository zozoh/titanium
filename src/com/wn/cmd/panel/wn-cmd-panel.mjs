const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    lines : []
  }),
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : String,
      default : undefined
    },
    "tipText" : {
      type : String,
      default : undefined
    },
    "tipIcon" : {
      type : String,
      default : undefined
    },
    "vars" : {
      type : Object,
      default: undefined
    },
    "as": {
      type : String,
      default: "text"
    },
    "emitName": {
      type : String,
      default: undefined
    },
    "emitPayload" : undefined,
    "input" : {
      type : String,
      default: undefined
    },
    "forceFlushBuffer" : {
      type : Boolean,
      default: true
    },
    "showRunTip" : {
      type : Boolean,
      default : true
    },
    "afterRunCommand" : {
      type : Function,
      default : undefined
    }
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
      let re = await this.exec(this.value)

      if(_.isFunction(this.afterRunCommand)) {
        await this.afterRunCommand(re)
      }

      if(this.emitName) {
        this.$notify(this.emitName, this.emitPayload || re)
      }
    },
    //------------------------------------------------
    async exec(cmdText, options={}) {
      cmdText = Ti.S.renderBy(cmdText, this.vars)
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

      if(this.showRunTip || options.showRunTip) {
        this.printHR()
        this.lines.push("> " + cmdText)
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