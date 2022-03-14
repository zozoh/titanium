export default {
  ////////////////////////////////////////////////////
  data: () => ({
    myDisplayList: []
  }),
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: Array,
      default: () => []
    },
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    "dialog": {
      type: Object
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "itemIcon": {
      type: String,
      default: "zmdi-play-circle-outline"
    },
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-mid-tip align-center",
        text: "i18n:react-action-empty",
        icon: "zmdi-flash-auto"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    isEmpty() {
      return _.isEmpty(this.value)
    },
    //------------------------------------------------
    ReactTypes() {
      let types = ["thing_create",
        "thing_update",
        "thing_delete",
        "thing_clear",
        "obj_create",
        "obj_update",
        "obj_delete",
        "obj_clear",
        "exec",
        "jsc"]
      let re = []
      for (let value of types) {
        re.push({
          value,
          text: `i18n:hmr-t-${value}`
        })
      }
      return re
    },
    //------------------------------------------------
    FormFields() {
      return [
        {
          title: 'i18n:type',
          name: "type",
          comType: "TiDroplist",
          comConf: {
            options: this.ReactTypes
          }
        },
        {
          title: 'i18n:path',
          name: "path",
          comType: "TiInput"
        },
        {
          title: 'i18n:target-id',
          name: "targetId",
          visible: {
            type: "^((obj|thing)_(delete|update))$"
          },
          comType: "TiInput"
        },
        {
          title: 'i18n:query',
          name: "query",
          type: "Object",
          visible: {
            type: "^(thing_update|(obj|thing)_clear)$"
          },
          comType: "TiInputPair"
        },
        {
          title: 'i18n:params',
          name: "params",
          type: "Object",
          visible: {
            type: "^(jsc|thing_(create|delete|update|clear))$"
          },
          comType: "TiInputPair"
        },
        {
          title: 'i18n:meta',
          name: "meta",
          type: "Object",
          visible: {
            type: "^((obj|thing)_(create|update))$"
          },
          comType: "TiInputPair"
        },
        {
          title: 'i18n:sort',
          name: "sort",
          type: "Object",
          visible: {
            type: "^(thing_(create|update))$"
          },
          comType: "TiInputPair"
        },
        {
          title: 'i18n:input',
          name: "input",
          visible: {
            type: "^(exec)$"
          },
          comType: "TiInputText",
          comConf: {
            height: "10em"
          }
        },
        {
          title: 'i18n:skip',
          name: "skip",
          type: "Integer",
          visible: {
            type: "^((thing|obj)_clear)$"
          },
          comType: "TiInputNum"
        },
        {
          title: 'i18n:limit',
          name: "limit",
          type: "Integer",
          visible: {
            type: "^((thing|obj)_clear)$"
          },
          comType: "TiInputNum"
        }
      ]
    },
    //------------------------------------------------
    ActionSetup() {
      return [
        {
          text: "i18n:react-action-add",
          icon: "zmdi-plus",
          className: "min-width-8",
          handler: () => {
            this.OnAddAction()
          }
        },
        {
          icon: "zmdi-code",
          className: "is-chip",
          handler: () => {
            this.OnViewSourceCode()
          }
        }
      ]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async OnEditAction({ index, data, icon }) {
      let reo = await this.OpenEditForm({ data, icon })

      // User cancel
      if (!reo) {
        return
      }

      // Put the new item
      let list = _.cloneDeep(this.value)
      list[index] = reo
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    async OnAddAction() {
      let reo = await this.OpenEditForm({
        data: { type: "jsc" },
        icon: 'zmdi-plus'
      })

      // User cancel
      if (!reo) {
        return
      }

      // Put the new item
      let list = _.cloneDeep(this.value)
      list.push(reo)
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    async OpenEditForm({ data, icon }) {
      console.log("OpenEditForm", { data, icon })
      return await Ti.App.Open(_.assign({
        icon,
        title: 'i18n:edit',
        width: "6.4rem",
        height: "96%",
      }, this.dialog, {
        model: { event: "change", prop: "data" },
        result: data,
        comType: "TiForm",
        comConf: {
          spacing: "tiny",
          fields: this.FormFields
        }
      }))
    },
    //------------------------------------------------
    async OnViewSourceCode() {
      let json = JSON.stringify(this.value, null, '   ')
      let re = await Ti.App.Open({
        title: "i18n:edit",
        position: "top",
        width: "6.4rem",
        height: "90%",
        result: json,
        mainStyle: {
          padding: "2px"
        },
        comType: "TiInputText",
        comConf: {
          height: "100%"
        }
      })

      // User Cancel
      if (_.isUndefined(re)) {
        return
      }

      // Parse JSON
      let data = JSON.parse(_.trim(re) || "{}")
      this.tryNotifyChange(data)
    },
    //------------------------------------------------
    OnRemoveAction({ index }) {
      let list = _.cloneDeep(this.value)
      list = _.filter(list, (_, i) => i != index)
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    OnMovePrev({ index }) {
      // Guard
      if (index <= 0) {
        return
      }
      let list = _.cloneDeep(this.value)
      Ti.Util.moveInArray(list, index, index - 1);
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    OnMoveNext({ index }) {
      // Guard
      if (_.isArray(this.value) && index >= (this.value.length - 1)) {
        return
      }
      let list = _.cloneDeep(this.value)
      Ti.Util.moveInArray(list, index, index + 1);
      this.tryNotifyChange(list)
    },
    //------------------------------------------------
    tryNotifyChange(data) {
      if (!_.isEqual(data, this.value)) {
        this.$notify("change", data)
      }
    },
    //------------------------------------------------
    evalDisplayList() {
      //....................................
      const explain_val = (val) => {
        // Nil
        if (Ti.Util.isNil(val)) {
          return
        }
        // String || Boolean
        if (_.isString(val) || _.isNumber(val)) {
          return val
        }
        // Boolean
        if (_.isBoolean(val)) {
          return ['i18n:no', 'i18n:yes'][val]
        }
        // Array
        if (_.isArray(val)) {
          let re = []
          for (let v of val) {
            let v2 = explain_val(v)
            re.push(v2)
          }
          return re.join(", ")
        }
        // Object
        if (_.isPlainObject(val)) {
          let re = []
          _.forEach(val, (v, k) => {
            re.push(`${k}(${v || '<null>'})`)
          })
          return re.join("; ")
        }
        // Other just to String
        return Ti.Types.toStr(val)
      }
      //....................................
      const try_join_text = (it, fields, name) => {
        let val = _.get(it, name)
        if (Ti.Util.isNil(val)) {
          return
        }
        let text = explain_val(val);
        if (Ti.Util.isNil(text)) {
          return
        }

        fields.push({
          name: `i18n:${_.kebabCase(name)}`, text
        })
      }
      //....................................
      let list = []
      if (_.isArray(this.value)) {
        let len = this.value.length
        let lastI = len - 1
        for (let i = 0; i < len; i++) {
          let it = this.value[i]
          let atFirst = 0 == i
          let atLast = lastI == i
          let li = {
            index: i,
            atFirst,
            atLast,
            className: {
              "at-first": atFirst,
              "at-last": atLast
            },
            icon: it.icon || this.itemIcon,
            type: it.type,
            typeText: `i18n:hmr-t-${it.type}`,
            fields: [],
            data: it
          }
          try_join_text(it, li.fields, "path")
          try_join_text(it, li.fields, "query")
          try_join_text(it, li.fields, "params")
          try_join_text(it, li.fields, "targetId")
          try_join_text(it, li.fields, "meta")
          try_join_text(it, li.fields, "input")
          try_join_text(it, li.fields, "skip")
          try_join_text(it, li.fields, "limit")
          list.push(li)
        }
      }
      //....................................
      this.myDisplayList = list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value": "evalDisplayList"
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    this.evalDisplayList()
  }
  ////////////////////////////////////////////////////
}