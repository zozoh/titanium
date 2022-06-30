const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    myFields: []
  }),
  //////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data": Object,
    "fields": Array,
    "status": Object,
    "lang": String,
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "fieldBorder": String,
    //-----------------------------------
    // Measure
    //-----------------------------------
    "fieldNameWidth": [Number, String],
    "gridColumnCount": Number,
  },
  //////////////////////////////////////////////////////
  computed: {
    //--------------------------------------------------
    TopStyle() {
      return {
        "grid-template-columns": _.repeat("1fr ", this.gridColumnCount)
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    OnFldChange(fld, value) {
      this.$emit("field:change", {
        name: fld.name,
        value
      })
    },
    //--------------------------------------------------
    evalFields(fields = this.fields) {
      //console.log("evalFields", fields)
      let list = []
      if (_.isArray(fields)) {
        for (let fld of fields) {
          let li = _.omit(fld, "com", "display")
          li.comType = fld.com.comType
          li.comConf = fld.com.comConf
          // Name style
          if (this.fieldNameWidth) {
            li.nameStyle = fld.nameStyle || {}
            li.nameStyle.width = Ti.Css.toSize(this.fieldNameWidth)
          }
          // Status
          // Add to list
          list.push(li)
        }
      }
      this.myFields = list
    },
    //--------------------------------------------------
    tryEvalFields(newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.evalFields()
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch: {
    "fields": "tryEvalFields",
    "status": "tryEvalFields"
  },
  //////////////////////////////////////////////////////
  mounted() {
    this.evalFields()
  }
  //////////////////////////////////////////////////////
}
export default _M;