export default {
  ////////////////////////////////////////////////////
  data: () => ({
    $sortable: undefined,
    dragging: false,
    myTags: [],
    myValues: []
  }),
  ////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: [Array, String],
      default: () => []
    },
    "dict": {
      type: [String, Ti.Dict],
      default: null
    },
    "keyBy": {
      type: [String, Function],
      default: "value"
    },
    "mapping": {
      type: Object,
      default: undefined
    },
    "explainMapping": {
      type: Boolean,
      default: false
    },
    "itemOptions": {
      type: Array,
      default: () => []
    },
    "placeholder": {
      type: String,
      default: "i18n:nil"
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "cancelItemBubble": {
      type: Boolean,
      default: false
    },
    "removable": {
      type: Boolean,
      default: false
    },
    "readonly": {
      type: Boolean,
      default: false
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "itemIconBy": {
      type: [String, Function],
      default: undefined
    },
    "optionDefaultIcon": {
      type: String,
      default: undefined
    },
    "itemDefaultIcon": {
      type: String,
      default: undefined
    },
    "itemMaxWidth": {
      type: [String, Number],
      default: undefined
    },
    "removeIcon": {
      type: String,
      default: "zmdi-close"
    },
    "statusIcons": {
      type: Object,
      default: () => ({
        collapse: "zmdi-chevron-down",
        extended: "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "has-items": this.hasItems,
        "nil-items": !this.hasItems
      });
    },
    //------------------------------------------------
    hasItems() {
      return !_.isEmpty(this.myTags);
    },
    //------------------------------------------------
    getTagItemKey() {
      if (_.isFunction(this.keyBy)) {
        return this.keyBy;
      }
      if (_.isString(this.keyBy)) {
        return (tag, index) => {
          let val = Ti.Util.getOrPick(tag, this.keyBy);
          if (_.isObject(val)) {
            return JSON.stringify(val).replace(/\s+/g, "");
          }
          // Simple value
          if (!Ti.Util.isNil(val)) {
            return val;
          }
          return `T${index}`;
        };
      }
      return (tag, index) => {
        return `T${index}`;
      };
    },
    //------------------------------------------------
    getTagItemIcon() {
      if (_.isFunction(this.itemIconBy)) {
        return (it) => this.itemIconBy(it);
      }
      if (_.isString(this.itemIconBy)) {
        return (it) => _.get(it, this.itemIconBy);
      }
      return (it) => null;
    },
    //--------------------------------------
    Dict() {
      if (this.dict) {
        // Already Dict
        if (this.dict instanceof Ti.Dict) {
          return this.dict;
        }
        // Get back
        let { name } = Ti.DictFactory.explainDictName(this.dict);
        return Ti.DictFactory.CheckDict(name);
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnItemChanged({ index, value } = {}) {
      if (index >= 0) {
        let values = this.getMyValues();
        values[index] = Ti.Util.fallback(value, null);
        this.$notify("change", values);
      }
    },
    //------------------------------------------------
    OnItemRemoved({ index } = {}) {
      if (index >= 0) {
        let values = this.getMyValues();
        _.pullAt(values, index);
        this.$notify("change", values);
      }
    },
    //------------------------------------------------
    OnItemFired({ index = -1 } = {}) {
      if (index >= 0) {
        let it = _.nth(this.theData, index);
        if (it) {
          this.$notify("item:actived", it);
        }
      }
    },
    //------------------------------------------------
    async evalMyData() {
      const tags = [];
      let list;
      if (_.isArray(this.value)) {
        list = this.value;
      } else if (_.isString(this.value)) {
        list = _.without(this.value.split(","), "");
      } else {
        list = [];
      }
      if (!_.isEmpty(list)) {
        const lastIndex = list.length - 1;
        for (let index = 0; index < list.length; index++) {
          let val = list[index];
          let tag;

          // Auto mapping plain object
          if (_.isPlainObject(val)) {
            if (this.mapping) {
              if (this.explainMapping) {
                tag = Ti.Util.explainObj(val, this.mapping);
              } else {
                tag = Ti.Util.translate(val, this.mapping);
              }
            } else {
              tag = _.cloneDeep(val);
            }
            // Customized the icon
            if (!tag.icon) {
              tag.icon = this.getTagItemIcon(val);
            }
          }
          // Lookup Dict
          else if (this.Dict) {
            let it = await this.Dict.getItem(val);
            tag = _.defaults({
              icon: this.Dict.getIcon(it),
              text: this.Dict.getText(it) || val,
              value: val
            });
          }
          // Auto gen object for simple value
          else {
            tag = { text: val, value: val };
          }

          // Complex value
          tag.key = this.getTagItemKey(tag, index);

          // Join default value
          _.defaults(tag, {
            index,
            icon: this.itemDefaultIcon,
            options: this.itemOptions,
            atLast: index == lastIndex
          });
          // Join to tags
          tags.push(tag);
        } // _.forEach
      }
      // assign the tags
      this.myTags = tags;
    },
    //------------------------------------------------
    getMyValues() {
      const vals = [];
      for (let tag of this.myTags) {
        vals.push(Ti.Util.fallback(tag.value, null));
      }
      return vals;
    },
    //--------------------------------------
    switchItem(fromIndex, toIndex) {
      if (fromIndex != toIndex) {
        let values = this.getMyValues();
        Ti.Util.moveInArray(values, fromIndex, toIndex);
        this.$notify("change", values);
      }
    },
    //--------------------------------------
    initSortable() {
      this.$sortable = new Sortable(this.$el, {
        animation: 300,
        filter: ".as-nil-tip",
        onStart: () => {
          this.dragging = true;
        },
        onEnd: ({ oldIndex, newIndex }) => {
          this.switchItem(oldIndex, newIndex);
          _.delay(() => {
            this.dragging = false;
          }, 100);
        }
      });
    },
    //------------------------------------------------
    tryInitSortable() {
      if (!this.readonly && this.removable && _.isElement(this.$el)) {
        if (!this.$sortable) {
          this.initSortable();
        }
      }
      // Destroy sortable: (com reused)
      else {
        if (this.$sortable) {
          this.$sortable.destroy();
          this.$sortable = undefined;
        }
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value": {
      handler: "evalMyData",
      immediate: true
    },
    "readonly": {
      handler: "tryInitSortable"
    }
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    this.tryInitSortable();
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    if (this.$sortable) {
      this.$sortable.destroy();
      this.$sortable = undefined;
    }
  }
  ////////////////////////////////////////////////////
};
