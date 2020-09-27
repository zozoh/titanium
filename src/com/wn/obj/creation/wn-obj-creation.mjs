export default {
  /////////////////////////////////////////
  data : ()=>({
    myCurrentType: undefined
  }),
  /////////////////////////////////////////
  props : {
    "types" : {
      type : Array,
      default : ()=>[]
    },
    "value" : {
      type : Object,
      default : ()=>({
        // name : "xxxx",
        // type : "txt",
        // race : "FILE",
        // mime : "text/plain"
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
  /////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasTypes() {
      return !_.isEmpty(this.types)
    },
    //--------------------------------------
    CurrentTypeName() {
      let tp = this.myCurrentType || this.value.type
      if(!tp && !this.freeCreate){
        return _.get(_.first(this.types), "name")
      }
      return tp
    },
    //--------------------------------------
    TypeList() {
      let list = []
      if(this.freeCreate) {
        let currentIsNull = Ti.Util.isNil(this.CurrentTypeName)
        list.push({
          name : null,
          text : "i18n:wn-oc-auto-type",
          type : null,
          icon  : "far-file",
          thumb : "far-file",
          suffix : "*.*",
          current : currentIsNull,
          className : {
            "is-current" : currentIsNull
          },
          race : "FILE",
          mime : "text/plain"
        })
      }
      _.forEach(this.types, type => {
        let li = _.cloneDeep(type)
        li.thumb = li.thumb || li.icon
        li.suffix = `*.${li.name}`
        li.current = li.name == this.CurrentTypeName
        li.className = {
          "is-current" : li.current
        }
        list.push(li)
      })
      return list
    },
    //--------------------------------------
    CurrentType() {
      return _.find(this.TypeList, li=>li.current)
    },
    //--------------------------------------
    CurrentIsDIR(){
      return 'DIR' == _.get(this.CurrentType, "race")
    },
    //--------------------------------------
    hasCurrentType() {
      return this.CurrentType ? true : false
    }
    //--------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //--------------------------------------
    setCurrentType(name){
      this.myCurrentType = name
    },
    //--------------------------------------
    OnInputChange() {
      let name = this.$refs.input.value
      if(this.trimed) {
        name = _.trim(name)
      }
      
      let type = _.assign({
        name : "txt",
        mime : "text/plain",
        race : "FILE"
      }, this.CurrentType)

      // Try to find suffix name in type list
      if(Ti.Util.isNil(type.name)) {
        let typeName = Ti.Util.getSuffixName(name)
        if(typeName) {
          for(let li of this.types) {
            if(typeName == li.name) {
              type = li
              break
            }
          }
        }
      }

      this.$notify("change", {
        name,
        type : type.name,
        mime : type.mime,
        race : type.race
      })
    }
    //--------------------------------------
  }
  /////////////////////////////////////////
}