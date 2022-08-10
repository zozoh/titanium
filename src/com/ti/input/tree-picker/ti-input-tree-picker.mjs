const _M = {
  /////////////////////////////////////////
  data: () => ({
    isPicking: false,
    // single/multi
    myInputValue: undefined,
    // single only
    myInputSuffix: undefined,
    // single only
    myInputIcon: undefined
  }),
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    InputSuffixIcon() {
      if (this.isPicking) {
        return this.pickingIcon
      }
      if (!this.readonly) {
        return this.suffixIcon
      }
    },
    //--------------------------------------
    InputSuffixText() {
      if (this.isPicking) {
        return this.pickingText
      }
      if (!this.readonly) {
        return this.myInputSuffix
      }
    },
    //--------------------------------------
    hasVars() {
      return !_.isEmpty(this.vars)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnClickSuffixIcon() {
      // Guard: Picking
      if (this.isPicking || this.readonly) {
        return
      }
      // Mark: Picking
      this.isPicking = true

      // Eval the tree data
      let treeData = await this.getTreeData();

      // Get checkedIds
      let checkedIds = {}
      _.forEach(_.concat(this.value), v => {
        if (v) {
          checkedIds[v] = true
        }
      })

      // Open the dialog
      let reo = await Ti.App.Open(_.assign(
        {
          title: "i18n:select",
          position: "top",
          width: "6.4rem",
          height: "96%",
        },
        this.dialog,
        {
          model: { event: "select" },
          events: {
            open: function () {
              this.close(this.result)
            }
          },
          comType: "TiTree",
          comConf: _.assign(
            {
              data: treeData,
              checkedIds,
              display: [
                "<icon>",
                "title|text|name|nm|abbr",
                "value|id|nm::as-tip-block align-right"
              ],
              multi: this.multi,
              checkable: this.multi,
              defaultOpenDepth: this.defaultOpenDepth,
              nodeSelectable: (node) => {
                if (this.onlyLeaf) {
                  return node.leaf ? true : false
                }
                return true;
              },
              nodeCheckable: (node) => {
                if (!this.multi) {
                  return false
                }
                if (this.onlyLeaf) {
                  return node.leaf ? true : false
                }
                return true;
              },
              border: "row"
            },
            this.tree
          ),
          components: [
            "@com:ti/tree"
          ],
          beforeClosed: () => {
            this.isPicking = false
          }
        }
      ))

      // User cancel
      if (!reo) {
        return
      }

      // Get selections
      let vals = Ti.Util.truthyKeys(reo.checkedIds)
      this.tryNotifyChange(vals)
    },
    //--------------------------------------
    tryNotifyChange(vals = []) {
      if(this.readonly) {
        return
      }
      let v2;
      if (this.multi) {
        v2 = vals
      } else {
        v2 = _.first(vals)
      }
      if (!_.isEqual(this.value, v2)) {
        this.$notify("change", v2)
      }
    },
    //--------------------------------------
    async getTreeData() {
      if (_.isFunction(this.options)) {
        let args = []
        if (this.hasVars) {
          args.push(this.vars)
        }
        return await this.options.apply(this, args)
      }
      // Static data
      let td = _.isString(this.options)
        ? JSON.parse(this.options)
        : _.cloneDeep(this.options);

      // Explain
      if (this.hasVars) {
        return Ti.Util.explain(this.vars, td)
      }
      // Pure tree data
      return td
    },
    //--------------------------------------
    async evalValue() {
      // Multi
      if (this.multi) {
        if (_.isArray(this.value)) {
          this.myInputValue = this.value
        } else {
          this.myInputValue = [this.value]
        }
      }
      // Single, shoudl eval the display value
      else {
        let val;
        if (_.isArray(this.value)) {
          val = _.first(this.value)
        } else {
          val = this.value
        }
        let $d;
        // Translate by Dict
        if (this.dict) {
          $d = Ti.DictFactory.CheckDict(this.dict)
          this.myInputValue = await $d.getItemText(val)
          this.myInputSuffix = val
          this.myInputIcon = (await $d.getItemIcon(val)) || this.prefixIcon
        }
        // Translate by format function
        else if (_.isFunction(this.format)) {
          let { value, suffix, icon } = await this.format(val, this.vars)
          this.myInputValue = Ti.Util.fallback(value, val)
          this.myInputSuffix = Ti.Util.fallback(suffix, value, val)
          this.myInputIcon = Ti.Util.fallback(icon, this.prefixIcon)
        }
        // show value directly
        else {
          this.myInputValue = val
          this.myInputIcon = this.prefixIcon
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "value": {
      handler: "evalValue",
      immediate: true
    }
  }
  //////////////////////////////////////////
}
export default _M;