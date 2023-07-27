// edit Object {a,b} => Input [a] - [b]
const _M = {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: Object
    },
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    // [
    //  {key:"abc", comType:"TiInput", comConf:{...}}
    //  {key:"abc", placeholder:"..."}
    // ]
    "fields": {
      type: Array,
      default: () => [
        {
          comType: "TiInput",
          comConf: {}
        }
      ]
    },
    "readonly": {
      type: Boolean
    },
    "showCleaner": {
      type: Boolean,
      default: false
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "sepChar": {
      type: String,
      default: "-"
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //------------------------------------------------
    hasFields() {
      return this.GroupFields.length > 0;
    },
    //------------------------------------------------
    GroupFields() {
      let re = [];
      _.forEach(this.fields, (fld, index) => {
        let val = _.get(this.value, fld.key);
        val = Ti.Util.fallback(val, fld.defaultAs, null);
        let field = _.omit(fld, "key");
        let comType = "TiInput";
        let comConf = {};
        if (field.comType || field.comConf) {
          comType = field.comType || comType;
          _.assign(comConf, field.comConf);
        } else {
          _.assign(comConf, field);
        }
        if (this.readonly) {
          comConf.readonly = readonly;
        }
        re.push({
          index,
          key: fld.key,
          value: val,
          comType,
          comConf,
          sepChar: index > 0 ? this.sepChar : null
        });
      });
      return re;
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnInputChange({ key }, val) {
      console.log(key, val);
      let data = _.cloneDeep(this.value || {});
      _.set(data, key, val);
      this.tryNotifyChange(data);
    },
    //------------------------------------------------
    OnClear() {
      let data = {};
      _.forEach(this.GroupFields, ({ key }) => {
        data[key] = null;
      });
      this.tryNotifyChange(data);
    },
    //------------------------------------------------
    tryNotifyChange(data) {
      if (!_.isEqual(data, this.value)) {
        this.$notify("change", data);
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
};
export default _M;
