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
      this.$el.scrollTop = this.$el.scrollHeight * 2
    }
  }
  ////////////////////////////////////////////////////
}
export default _M;