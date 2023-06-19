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
    // [{placeholder:"xxx", toCase:"upper",key:"abc",width:".5rem"}]
    "fields": {
      type: Array,
      default: "TiInput"
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
    GroupFields() {
      let re = [];
      _.forEach(this.fields, (fld, index) => {
        let val = _.get(this.value, fld.key);
        val = Ti.Util.fallback(val, fld.defaultAs, null);
        let inputConfig = _.omit(fld, "key");
        re.push({
          index,
          key: fld.key,
          input: inputConfig,
          value: val,
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
