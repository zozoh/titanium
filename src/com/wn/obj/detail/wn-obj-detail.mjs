export default {
  /////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : undefined
    },
    "fields" : {
      type : Array,
      default : undefined
    },
    "preview" : {
      type : Object,
      default : ()=>({})
    },
    "form" : {
      type : Object,
      default : ()=>({})
    }
  },
  /////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    Layout() {
      return {
        type : "rows",
        border: true,
        blocks: [{
            size : "37%",
            body : "preview",
          }, {
            body : "form"
          }]
      }
    },
    //--------------------------------------
    Schema() {
      return {
        preview : {
          comType : "WnObjPreview",
          comConf : {
            ... this.preview,
            meta : this.value
          }
        },
        form : {
          comType : "WnObjForm",
          comConf : {
            spacing : "tiny",
            ... this.form,
            fields : this.fields,
            data : this.value
          }
        }
      }
    }
    //--------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //--------------------------------------
   
    //--------------------------------------
  }
  /////////////////////////////////////////
}