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
    "input" : {
      type : String,
      default: undefined
    },
    "forceFlushBuffer" : {
      type : Boolean,
      default: true
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
      
      this.lines.push("---------------------------------")
      this.lines.push(Ti.I18n.get("run-welcome"))
      this.lines.push("> " + this.value)
      this.lines.push("---------------------------------")

      let re = await Wn.Sys.exec(this.value, {
        as : this.as,
        vars : this.vars,
        input : this.input, 
        forceFlushBuffer : this.forceFlushBuffer,
        eachLine : (line)=>{
          this.lines.push(line)
        }
      })

      this.lines.push("---------------------------------")
      this.lines.push("> " + this.value)
      this.lines.push(Ti.I18n.get("run-finished"))
      this.lines.push("---------------------------------")

      if(this.emitName) {
        this.$notify(this.emitName, re)
      }
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