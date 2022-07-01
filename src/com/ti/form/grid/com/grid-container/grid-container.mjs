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
          let li = _.omit(fld, "com", "display", "className")
          li.comType = fld.com.comType
          li.comConf = fld.com.comConf
          li.className = Ti.Css.mergeClassName(fld.className)
          // Field Style
          if (fld.colSpan > 1 || fld.rowSpan > 1) {
            li.style = _.assign({}, fld.style, {
              "grid-column-end": fld.colSpan > 1
                ? `span ${Math.min(fld.colSpan, this.gridColumnCount)}`
                : null,
              "grid-row-end": fld.rowSpan > 1
                ? `span ${fld.rowSpan}`
                : null
            })
          }
          // Name class
          if (fld.nameClass) {
            li.nameClass = Ti.Css.mergeClassName(fld.nameClass)
          }
          // Name style
          if (this.fieldNameWidth) {
            li.nameStyle = _.assign({}, fld.nameStyle, {
              width: Ti.Css.toSize(this.fieldNameWidth)
            })
          }
          // Status
          // ...
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
    "status": "tryEvalFields",
    "gridColumnCount": "tryEvalFields",
    "fieldNameWidth": "tryEvalFields"
  },
  //////////////////////////////////////////////////////
  mounted() {
    this.evalFields()
  }
  //////////////////////////////////////////////////////
}
export default _M;