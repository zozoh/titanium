const _M = {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": undefined,
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    "dialog": {
      type: Object
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------

  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-toggle": "Boolean" == this.DyVal.type
      })
    },
    //------------------------------------------------
    /*
    {
      //.................................
      // "Undefined": undefined
      // "Null"     : null
      // "Number"   : 23.6 or 89
      // "Boolean"  : true
      // "String"   : "xxx"
      // "Object"   : {...}
      // "Array"    : [...]
      // "Function" : {__function:true, name, args}
      // "Invoking" : {__invoke:true, name, args}
      // "Tmpl"     : "->xxxx"
      // "BoolVar"  : "==xxx"
      // "GetVar"   : "=xxx"
      type:"Number|Boolean|String...|Tmpl|BoolVar|GetVar",
      //.................................
      value: Any,
      //.................................
      // "Array" only
      list: [DyVal ..]
      // "Object" only
      fields: [{name,title,value:DyVal}]
      //.................................
      // "Var"
      dftVal: String,
      // "GetVar"
      dftAutoJs: true,
      // "BoolVar"
      isNot: false,
      //.................................
      // Var | Function | Invoking only
      name : "FuncName",
      // Function | Invoking only
      args : [
        DyVal, ...
      ],
      partial: "left"
    }
    */
    DyVal() {
      // Guard : parsed already
      if (this.value && this.value.$dynamic_parsed) {
        return this.value
      }
      //.......................................
      const wrapDyVal = (vo) => {
        vo.$dynamic_parsed = true
        return vo
      }
      //.......................................
      const parseVal = (anyValue) => {
        let theValue = anyValue
        //.....................................
        // Undefined
        if (_.isUndefined(theValue)) {
          return wrapDyVal({ type: "Undefined" })
        }
        //.....................................
        // Null
        if (_.isNull(theValue)) {
          return wrapDyVal({ type: "Null", value: null })
        }
        //.....................................
        // Number
        if (_.isNumber(theValue)) {
          return wrapDyVal({ type: "Number", value: theValue })
        }
        //.....................................
        // Boolean
        if (_.isBoolean(theValue)) {
          return wrapDyVal({ type: "Boolean", value: theValue })
        }
        //.....................................
        // String
        if (_.isString(theValue)) {
          let m_type, m_val, m_dft, dft_autoJs;
          // Match template or function call
          let m = /^(==>>?|=>>?|->)(.+)$/.exec(theValue)
          if (m) {
            m_type = m[1]
            m_val = _.trim(m[2])
          }
          // Match var value
          else {
            m = /^(==?|!=)([^?]+)(\?(.*))?$/.exec(theValue)
            if (m) {
              m_type = m[1]
              m_val = _.trim(m[2])
              m_dft = m[4]
              // starts with "=" auto covert to JS value
              if (/^=/.test(m_dft) || "==" == m_type) {
                m_dft = Ti.S.toJsValue(m_dft)
                dft_autoJs = true
              } else if (m_dft) {
                m_dft = _.trim(m_dft)
                dft_autoJs = false
              }
            }
          }

          //
          // Eval by type
          //
          // Matched
          if (m_type) {
            //................................
            let fn = ({
              // Just get function: partial left
              "==>": (val) => {
                let invoke = Ti.Util.parseInvoking(val)
                return {
                  type: "Function",
                  name: invoke.name,
                  args: invoke.args,
                  partial: "left"
                }
              },
              // Just get function: partial right
              "==>>": (val) => {
                let invoke = Ti.Util.parseInvoking(val)
                return {
                  type: "Function",
                  name: invoke.name,
                  args: invoke.args,
                  partial: "right"
                }
              },
              // ==xxx  # Get Boolean value now
              "==": (val) => {
                return {
                  type: "BoolVar",
                  name: val,
                  dftVal: Ti.Util.fallbackNil(m_dft, false),
                  dftAutoJs: dft_autoJs,
                  isNot: false
                }
              },
              // !=xxx  # Revert Boolean value now
              "!=": (val) => {
                return {
                  type: "BoolVar",
                  name: val,
                  dftVal: Ti.Util.fallbackNil(m_dft, true),
                  dftAutoJs: dft_autoJs,
                  isNot: true
                }
              },
              // =xxx   # Get Value Now
              "=": (val, dft) => {
                return {
                  type: "GetVar",
                  name: val,
                  dftVal: m_dft,
                  dftAutoJs: dft_autoJs
                }
              },
              // =>Ti.Types.toStr(meta)
              "=>>": (val) => {
                let invoke = Ti.Util.parseInvoking(val)
                return {
                  type: "Invoking",
                  name: invoke.name,
                  args: invoke.args,
                  partial: "right"
                }
              },
              // =>Ti.Types.toStr(meta)
              "=>": (val) => {
                let invoke = Ti.Util.parseInvoking(val)
                return {
                  type: "Invoking",
                  name: invoke.name,
                  args: invoke.args,
                  partial: "left"
                }
              },
              // Render template
              "->": (val) => {
                return {
                  type: "Tmpl"
                }
              }
            })[m_type]
            //................................
            // Check Function
            if (_.isFunction(fn)) {
              let rev = fn(m_val, m_dft)
              rev.value = m_val
              return wrapDyVal(rev)
            }
          } // Matched

          // Default as String
          return wrapDyVal({ type: "String", value: theValue })
        }
        //.....................................
        // Array
        if (_.isArray(theValue)) {
          let list = []
          for (let v of theValue) {
            let v2 = parseVal(v)
            list.push(v2)
          }
          return wrapDyVal({
            type: "Array",
            value: theValue,
            list
          })
        }
        //.....................................
        // Object
        if (_.isPlainObject(theValue)) {
          let type = "Object"
          // Invoking
          if (theValue.__invoke && theValue.name) {
            type = "Invoking"
          }
          // Function
          else if (theValue.__function && theValue.name) {
            type = "Function"
          }

          // Invoking || Function
          if (/^(Invoking|Function)$/.test(type)) {
            let { name, args } = theValue
            args = parseVal(Ti.Util.fallback(args || []))
            return wrapDyVal({ type, name, args })
          }

          // Plain Object
          let flds = []
          _.forEach(theValue, (v, k) => {
            let dv = parseVal(v)
            flds.push({
              name: k,
              title: k,
              value: dv
            })
          })
          return wrapDyVal({
            type: "Object",
            fields: flds
          })
        } // ~Object
        //.....................................
        // Default as String
        return wrapDyVal({
          type: "String",
          value: theValue
        })
      } // ~ parseVal
      return parseVal(this.value)
    },
    //------------------------------------------------
    InputValue() {
      return this.DyVal.value
    },
    //------------------------------------------------
    InputConf() {
      let dvType = this.DyVal.type
      //......................................
      let prefixIcon = ({
        "Number": "zmdi-n-2-square",
        "Boolean": "fas-toggle-on",
        "String": "zmdi-font",
        "Object": "zmdi-toys",
        "Array": "zmdi-format-list-numbered",
        "Function": "fas-fire-extinguisher",
        "Invoking": "fas-fire-alt",
        "Tmpl": "im-plugin",
        "BoolVar": "im-toggle",
        "GetVar": "zmdi-key"
      })[dvType]
      //......................................
      let prefixText = ({
        "Function": this.DyVal.partial == "right" ? ":==>>" : ":==>",
        "Invoking": this.DyVal.partial == "right" ? ":=>>" : ":=>",
        "Tmpl": ":->",
        "BoolVar": ":==",
        "GetVar": ":="
      })[dvType]
      //......................................
      let placeholder = ({
        "Undefined": "i18n:undefined",
        "Null": "i18n:null"
      })[dvType]
      //......................................
      let readonly = /^(Object|Array)$/.test(dvType)
      //......................................
      return {
        placeholder,
        prefixIcon,
        prefixText,
        readonly
      }
      //......................................
    },
    //------------------------------------------------
    ObjInfo() {
      if ("Object" == this.DyVal.type) {
        let ss = _.map(this.DyVal.fields, ({ name, title }) => title || name)
        return _.isEmpty(ss) ? Ti.I18n.get("empty") : ss.join(", ")
      }
    },
    //------------------------------------------------
    ArrayInfo() {
      if ("Array" == this.DyVal.type) {
        let ss = _.map(this.DyVal.list, ({ type }) => type)
        return _.isEmpty(ss) ? Ti.I18n.get("empty") : ss.join(", ")
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async OnOpenEditForm() {
      let reo = await Ti.App.Open(_.assign(
        {
          title: "i18n:edit",
          position: "top",
          width: "5.4rem",
          height: "61.8%",
        },
        this.dialog,
        {
          result: this.DyVal,
          model: { event: "change", prop: "data" },
          comType: "TiForm",
          comConf: {
            spacing: "tiny",
            omitHiddenFields: true,
            fields: [
              {
                title: "i18n:type",
                name: "type",
                defaultAs: "String",
                comType: "TiDroplist",
                comConf: {
                  options: "#HmValTypes",
                  suffixText: "${=value}"
                }
              },
              /*---------------------------*/
              {
                title: "i18n:value",
                name: "value",
                visible: {
                  type: "^(String|Tmpl)$"
                },
                comType: "TiInput"
              },
              {
                title: "i18n:value",
                name: "value",
                type: "Boolean",
                visible: {
                  type: "^(Boolean)$"
                },
                comType: "TiToggle"
              },
              {
                title: "i18n:value",
                name: "value",
                type: "Number",
                nanAs: 0,
                visible: {
                  type: "^(Number)$"
                },
                comType: "TiInput"
              },
              /*---------------------------*/
              {
                title: "i18n:name",
                name: "name",
                visible: {
                  type: "^((Bool|Get)Var|Function|Invoking)$"
                },
                comType: "TiInput"
              },
              /*---------------------------*/
              {
                title: "i18n:hm-args",
                name: "args",
                type: "Array",
                visible: {
                  type: "^(Function|Invoking)$"
                },
                comType: "TiInput"
              },
              {
                title: "i18n:hm-args-partial",
                name: "partial",
                visible: {
                  type: "^(Function|Invoking)$"
                },
                comType: "TiSwitcher",
                comConf: {
                  options: "#HmArgsPartials"
                }
              },
              /*---------------------------*/
              // Array, Object

              /*---------------------------*/
            ]
          }
        }
      )) // await Ti.App.Open

      // User cancel
      if (!reo) {
        return
      }

      // Update the value
      let fn = ({
        "Undefined": () => {
          return undefined
        },
        "Null": () => {
          return null
        },
        "Number": ({ value }) => {
          return value * 1
        },
        "Boolean": ({ value }) => {
          return value ? true : false
        },
        "String": ({ value }) => {
          return Ti.Types.toStr(value)
        },
        "Object": ({ value }) => {
          // TODO ...
          return value
        },
        "Array": ({ value }) => {
          // TODO ...
          return value
        },
        "Function": ({ name, args, partial }) => {
          if (_.isEmpty(args)) {
            return "right" == partial
              ? `==>>${name}`
              : `==>${name}`
          }
          return {
            __function: true,
            name, args, partial
          }
        },
        "Invoking": ({ name, args, partial }) => {
          if (_.isEmpty(args)) {
            return "right" == partial
              ? `=>>${name}`
              : `=>${name}`
          }
          return {
            __invoke: true,
            name, args, partial
          }
        },
        "Tmpl": ({ value }) => {
          return `->${value}`
        },
        "BoolVar": ({ name, dftVal, isNot }) => {
          let re = [isNot ? "!" : "=", "=", name]
          if (!Ti.Util.isNil(dftVal)) {
            re.push(`?${dftVal}`)
          }
          return re.join("")
        },
        "GetVar": ({ name, dftVal, dftAutoJs }) => {
          let re = ["=", name]
          if (!Ti.Util.isNil(dftVal)) {
            if (dftAutoJs) {
              re.push(`?=${dftVal}`)
            } else {
              re.push(`?${dftVal}`)
            }
          }
          return re.join("")
        }
      })[reo.type]

      if (_.isFunction(fn)) {
        let val = fn(reo)
        this.tryNotifyChange(val)
      }
    },
    //------------------------------------------------
    OnInputChange(val) {
      let dvType = this.DyVal.type
      // Update the value
      let v2, re, invoke;
      let dyVal = _.cloneDeep(this.DyVal)
      switch (dvType) {
        case "Undefined":
        case "Null":
        case "Number":
        case "Boolean":
        case "String":
          v2 = Ti.S.toJsValue(val);
          break;
        case "Object":
        case "Array":
          v2 = JSON.parse(val);
          break;
        case "Function":
          invoke = Ti.Util.parseInvoking(val)
          v2 = _.assign(dyVal, { __function: true }, invoke);
          break;
        case "Invoking":
          invoke = Ti.Util.parseInvoking(val)
          v2 = _.assign(dyVal, { __invoke: true }, invoke);
          break;
        case "Tmpl":
          v2 = `->${val}`;
          break;
        case "BoolVar":
          re = [dyVal.isNot ? "!" : "=", "=", dyVal.name]
          if (!Ti.Util.isNil(dyVal.dftVal)) {
            re.push(`?${dyVal.dftVal}`)
          }
          re.join("");
          break;
        case "GetVar":
          re = ["=", dyVal.name]
          if (!Ti.Util.isNil(dyVal.dftVal)) {
            if (dyVal.dftAutoJs) {
              re.push(`?=${dyVal.dftVal}`)
            } else {
              re.push(`?${dyVal.dftVal}`)
            }
          }
          re.join("");
          break;
      }


      // Try to notify
      this.tryNotifyChange(v2)
    },
    //------------------------------------------------
    tryNotifyChange(val) {
      if (!_.isEqual(this.value, val)) {
        this.$notify("change", val)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;