export default {
  //////////////////////////////////////////////////////
  props : {
    "config" : {
      type : Object,
      default : ()=>({
        serilizers   : {},
        transformers : {},
        validators   : {},
        statusIcons : {
          spinning : 'fas-spinner fa-spin',
          error    : 'zmdi-alert-polygon',
          warn     : 'zmdi-alert-triangle',
          ok       : 'zmdi-check-circle',
        },
        fields: []
      })
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({
        "changed"   : false,
        "saving"    : false,
        "reloading" : false
      })
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    fieldList() {
      let list = []
      for(let fld of this.config.fields) {
        let f2 = _.cloneDeep(fld)
        // serializer
        if(f2.serializer && _.isString(f2.serializer)){
          f2.serializer = this.meta.serilizers[f2.serializer]
        }
        // transfomer
        if(f2.transfomer && _.isString(f2.transfomer)){
          f2.transfomer = this.meta.transfomers[f2.transfomer]
        }
        // validator
        if(f2.validator && _.isString(f2.validator)){
          f2.validator = this.meta.validators[f2.validator]
        }
        // Add to list
        list.push(f2)
      }
      return list
    }
  },
  //////////////////////////////////////////////////////
  methods : {
    
  }
}