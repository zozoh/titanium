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

      await Wn.Sys.exec(this.value, {
        vars : this.vars,
        eachLine : (line)=>{
          this.lines.push(line)
        }
      })

      this.lines.push("---------------------------------")
      this.lines.push("> " + this.value)
      this.lines.push(Ti.I18n.get("run-finished"))
      this.lines.push("---------------------------------")
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : {
      handler: "runCommand",
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}
export default _M;