const _M = {
  /////////////////////////////////////////
  data: () => ({

  }),
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    hasVars() {
      return !_.isEmpty(this.vars)
    },
    //--------------------------------------
    TheValue() {
      if (_.isArray(this.value)) {
        return this.value
      }
      return [this.value]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnClickSuffixIcon() {
      // Eval the tree data
      let treeData = await this.getTreeData();

      // Prepare customized selectable function
      let selectabl = (node) => {
        if (this.onlyLeaf) {
          return node.leaf ? true : false
        }
        return true;
      }

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
              display: [
                "<icon>",
                "title|text|name|nm|abbr",
                "value|id|nm::as-tip-block align-right"
              ],
              multi: this.multi,
              checkable: this.multi,
              defaultOpenDepth: this.defaultOpenDepth,
              nodeSelectable: selectabl,
              nodeCheckable: selectabl,
              border: "row"
            },
            this.tree
          ),
          components: [
            "@com:ti/tree"
          ]
        }
      ))

      // User cancel
      console.log(reo)
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
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;