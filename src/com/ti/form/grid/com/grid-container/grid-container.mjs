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
    "statusIcons": Object,
    //-----------------------------------
    // Measure
    //-----------------------------------
    "fieldNameMaxWidth": [Number, String],
    "gridColumnCount": Number,
  },
  //////////////////////////////////////////////////////
  computed: {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass(`is-field-border-${this.fieldBorder}`)
    },
    //--------------------------------------------------
    TopStyle() {
      if (this.gridColumnCount > 0) {
        return {
          "grid-template-columns": _.repeat("auto 1fr ", this.gridColumnCount)
        }
      }
      return {
        "grid-template-columns": "1fr"
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    OnFldChange(fld, value) {
      // Define how to apply field default value
      const __apply_fld_default = (val) => {
        let re = val;
        //console.log("evalInputValue", val)
        // apply default
        if (_.isUndefined(val)) {
          re = _.cloneDeep(
            Ti.Util.fallback(fld.undefinedAs, fld.defaultAs)
          )
        }
        else if (_.isNull(val)) {
          re = _.cloneDeep(
            Ti.Util.fallback(fld.nullAs, fld.defaultAs, null)
          )
        }
        else if (isNaN(val) && /^(Number|Integer|Float)$/.test(fld.type)) {
          re = _.cloneDeep(
            Ti.Util.fallback(fld.nanAs, fld.defaultAs, NaN)
          )
        }
        else if (
          !(_.isBoolean(val) || _.isNumber(val))
          && _.isEmpty(val)
        ) {
          if (_.isString(val)) {
            re = _.cloneDeep(
              Ti.Util.fallback(fld.emptyAs, fld.defaultAs, "")
            )
          } else {
            re = Ti.Util.fallback(fld.emptyAs, val)
          }
        }

        if ("~~undefined~~" == re)
          return
        return re
      }

      // Firstly apply the default
      let v1 = __apply_fld_default(value);

      // Serilizing
      try {
        //console.log("this.serializer(val):", v2)
        v1 = fld.serializer(v1)
        //console.log("field changed", val, v2)
      }
      // Invalid 
      catch (error) {
        this.$notify("invalid", {
          errMessage: "" + error,
          name: fld.name,
          value: value
        })
        return
      }

      // Apply again
      let v2 = __apply_fld_default(v1)

      // Compare the value
      let oldValue = _.get(fld.comConf, fld.autoValue)

      // Try to notify
      if (!fld.checkEquals || !_.isEqual(oldValue, v2)) {
        this.$emit("field:change", {
          name: fld.name,
          value: v2
        })
      }
    },
    //--------------------------------------------------
    cloneAssignFieldGrid(fields = this.fields) {
      let list = _.cloneDeep(fields) || []

      // Grid layout
      let realGridColCount = this.gridColumnCount * 2 || 1;

      let gridI = 0;   // Current grid col index
      for (let i = 0; i < list.length; i++) {
        let fld = list[i];

        // Show name
        fld.showName = (fld.icon || fld.title) ? true : false;
        fld.rowSpan = fld.rowSpan || 1

        let colSpan = fld.colSpan || 1
        let fldGridColSpan = Math.min(colSpan * 2, realGridColCount)

        // Remain grid
        let remainGrid = realGridColCount - gridI

        // Grid overflow
        if (fldGridColSpan > remainGrid) {
          // Wrap line
          gridI = 0
          // Assign remain grid to prev fldValue
          if (i > 0) {
            let prevFld = list[i - 1]
            prevFld.valueGridSpan += remainGrid
          }
        }

        // Label
        if ("Label" == fld.race) {
          fld.gridStart = 0
          fld.gridSpan = realGridColCount
          gridI = 0
          continue
        }

        // Grid with field name
        if (fld.showName) {
          fld.nameGridStart = gridI;
          fld.nameGridSpan = 1;
          fld.valueGridStart = gridI + 1;
          fld.valueGridSpan = fldGridColSpan - 1
        }
        // None name field
        else {
          fld.nameGridStart = 0;
          fld.nameGridSpan = 0;
          fld.valueGridStart = gridI;
          fld.valueGridSpan = fldGridColSpan
        }

        // Move grid and test wrap
        gridI = fld.valueGridStart + fld.valueGridSpan;
        if (gridI >= realGridColCount) {
          gridI = 0
        }

      }

      return list
    },
    //--------------------------------------------------
    evalFields(fields = this.fields) {
      //console.log("evalFields", fields)
      // if (fields.length > 0) {
      //   console.log("evalFields", fields)
      // }
      let list = this.cloneAssignFieldGrid(fields)

      // each fields
      for (let fld of list) {
        // Maybe race="Label"
        if (fld.com) {
          fld.comType = fld.com.comType
          fld.comConf = fld.com.comConf
        }

        let nmStyle, valStyle;

        // Label
        if ("Label" == fld.race) {
          nmStyle = {
            "grid-column-start": fld.gridStart + 1,
            "grid-column-end": `span ${fld.gridSpan}`
          }
        }
        // Normal field
        else {
          // Grid with field name
          if (fld.showName) {
            nmStyle = {
              //"grid-column-start": fld.nameGridStart + 1,
              "grid-column-end": `span ${fld.nameGridSpan}`,
              "grid-row-end": `span ${fld.rowSpan}`
            }
            if ("auto" == fld.nameAlign) {
              fld.nameAlign = this.gridColumnCount > 0
                ? "right"
                : "left";
            }

            if (this.gridColumnCount > 0 && this.fieldNameMaxWidth) {
              fld.nameTextStyle = {
                maxWidth: Ti.Css.toSize(this.fieldNameMaxWidth)
              }
            }
          }

          valStyle = {
            //"grid-column-start": fld.valueGridStart + 1,
            "grid-column-end": `span ${fld.valueGridSpan}`,
            "grid-row-end": `span ${fld.rowSpan}`
          }

          if (!Ti.Util.isNil(fld.width)) {
            let fldWidth = "full" == fld.width
              ? "100%"
              : Ti.Css.toSize(fld.width);
            fld.comStyle = _.assign({
              "width": fldWidth,
              "flex": "0 0 auto"
            }, fld.comStyle)
          }
        }

        // Update field name
        fld.nameStyle = _.assign({}, fld.nameStyle, nmStyle)
        fld.valueStyle = _.assign({}, fld.valueStyle, valStyle)

        // Name class
        if (fld.nameClass) {
          fld.nameClass = Ti.Css.mergeClassName(fld.nameClass)
        }

        // Status
        this.setFieldStatus(fld)
      } // for (let fld of fields) {

      this.myFields = list
    },
    //--------------------------------------------------
    setFieldStatus(fld = {}) {
      let { type, text } = _.get(this.status, fld.key) || {}
      if (type) {
        fld.statusIcon = _.get(this.statusIcons, type)
        fld.statusText = Ti.I18n.text(text)
        fld.className = Ti.Css.mergeClassName(fld.className, `is-${type}`)
      }
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