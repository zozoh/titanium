export default {
  props : {
    "types" : {
      type : Array,
      default : ()=>[]
    },
    "value" : {
      type : Object,
      default : ()=>({
        name : "",
        type : "",
        race : ""
      })
    },
    "trimed" : {
      type : Boolean,
      default : true
    },
    "freeCreate" : {
      type : Boolean,
      default : false
    }
  },
  computed : {
    hasTypes() {
      return !_.isEmpty(this.types)
    },
    currentIsDir(){
      return 'DIR' == this.value.race
    },
    hasCurrentType() {
      return this.value.type && this.value.race
    },
    currentType() {
      for(let tp of this.types) {
        if(tp.name == this.value.type){
          return tp
        }
      }
    }
  },
  methods : {
    isCurrent(tp) {
      return this.value.type == tp.name
    },
    getTypeItemClassName(tp) {
      if(this.isCurrent(tp)){
        return "as-current"
      }
      return ""
    },
    setCurrentType(tp){
      if(tp) {
        this.value.type = tp.name
        this.value.race = tp.race
      } else {
        this.value.type = ""
        this.value.race = ""
      }
      this.$notify("change", this.value)
    },
    onChange() {
      let name = this.$refs.input.value
      if(this.trimed) {
        name = _.trim(name)
      }
      this.value.name = name

      if('DIR'!=this.value.race 
        && this.value.type
        && this.value.name){
        let suffix = `.${this.value.type}`
        if(!this.value.name.endsWith(suffix)){
          let majorName = Ti.Util.getMajorName(this.value.name)
          this.value.name = majorName + suffix
        }
      }

      this.$notify("change", this.value)
    }
  },
  mounted : function(){
    if(this.hasTypes) {
      this.setCurrentType(this.types[0])
    }
    this.$refs.input.focus()
  }
}