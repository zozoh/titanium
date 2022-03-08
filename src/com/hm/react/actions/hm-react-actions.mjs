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
          title: 'i18n:query',
          name: "query"
        },
        {
          title: 'i18n:target-id',
          name: "targetId",
          comType: "TiInput"
        },
        {
          title: 'i18n:meta',
          name: "meta"
        },
        {
          title: 'i18n:sort',
          name: "sort"
        },
        {
          title: 'i18n:input',
          name: "input",
          comType: "TiInputText",
          comConf: {
            height: "10em"
          }
        },
        {
          title: 'i18n:skip',
          name: "skip",
          type: "Integer",
          comType: "TiInputNum"
        },
        {
          title: 'i18n:limit',
          name: "limit",
          type: "Integer",
          comType: "TiInputNum"
        }
      ]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async OnEditAction({ index, data, icon }) {
      let reo = await Ti.App.Open(_.assign({
        icon, title: 'i18n:edit',
        width: "6.4rem",
        height: "96%",
      }, this.dialog, {
        comType: "TiForm",
        comConf: {
          data,
          spacing: "tiny",
          fields: this.FormFields
        }
      }))
      console.log(reo)

      // User cancel
      if(!reo) {
        return
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
          name: `i18n:${name}`, text
        })
      }
      //....................................
      let list = []
      if (_.isArray(this.value)) {
        let len = this.value.length
        let lastI = len - 1
        for (let i = 0; i < len; i++) {
          let it = this.value[i]
          let li = {
            index: i,
            first: 0 == i,
            last: lastI == i,
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