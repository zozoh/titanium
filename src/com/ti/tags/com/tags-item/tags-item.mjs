export default {
  inheritAttrs: false,
  ////////////////////////////////////////////////////
  data: () => ({
    // null / top / del
    mouseEnter: null,
    // collapse / extended
    status: "collapse"
  }),
  ////////////////////////////////////////////////////
  props: {
    "index": {
      type: Number,
      default: -1
    },
    "atLast": {
      type: Boolean,
      default: false
    },
    "icon": {
      type: [String, Object],
      default: null
    },
    "text": {
      type: [String, Number],
      default: null
    },
    "href": {
      type: String,
      default: null
    },
    "value": {
      type: [String, Number, Boolean, Object],
      default: null
    },
    /***
     * Show drop list for changing the piece value
     *
     * ```js
     * [{
     *   icon  : "zmdi-card-giftcard",
     *   text  : "随便什么礼物",
     *   value : "Gift"
     * }, {
     *   icon  : "zmdi-cocktail",
     *   text  : "鸡尾酒会",
     *   value : "Cocktail"
     * }, {
     *   icon  : "zmdi-nature-people",
     *   text  : "人在树下；雨在天空",
     *   value : "NaturePeople"
     * }]
     * ```
     */
    "options": {
      type: Array,
      default: () => []
    },
    "optionDefaultIcon": {
      type: String,
      default: null
    },
    "cancelBubble": {
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
    "removeIcon": {
      type: String,
      default: null
    },
    "statusIcons": {
      type: Object,
      default: () => ({
        collapse: "zmdi-chevron-down",
        extended: "zmdi-chevron-up"
      })
    },
    "maxWidth": {
      type: [String, Number],
      default: undefined
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return Ti.Css.mergeClassName(
        {
          "has-options": this.hasOptions,
          "is-enter-top": "top" == this.mouseEnter && this.hasOptions,
          "is-enter-del": "del" == this.mouseEnter,
          "has-max-width": this.maxWidth ? true : false
        },
        this.className
      );
    },
    //------------------------------------------------
    TopStyle() {
      let css = {};
      if (this.maxWidth) {
        css.maxWidth = Ti.Css.toSize(this.maxWidth);
      }
      return css;
    },
    //------------------------------------------------
    TextClass() {
      return {
        "without-icon": !this.hasIcon && !this.removable,
        "without-options": !this.hasOptions
      };
    },
    //------------------------------------------------
    hasIcon() {
      return this.icon ? true : false;
    },
    //------------------------------------------------
    hasOptions() {
      return _.isArray(this.options) && this.options.length > 0;
    },
    //------------------------------------------------
    /***
     * @return The objects list like:
     *
     * ```js
     * [{
     *   icon  : "zmdi-phone",
     *   text  : "i18n:xxx",
     *   value : 100,
     *   options : [{icon,text,value}...]
     * }]
     * ```
     */
    theOptions() {
      let list = _.filter(_.concat(this.options), (v) => !Ti.Util.isNil(v));
      let tags = [];
      _.forEach(list, (li, index) => {
        let tag;
        // Object
        if (_.isPlainObject(li)) {
          tag = _.assign({ icon: this.optionDefaultIcon }, li, { index });
        }
        // String or simple value
        else {
          tag = {
            index: index,
            icon: this.optionDefaultIcon,
            text: Ti.Types.toStr(li),
            value: li
          };
        }
        // Join to
        if (!_.isEqual(tag.value, this.value)) {
          tags.push(tag);
        }
      });
      return tags;
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status];
    },
    //------------------------------------------------
    theData() {
      return {
        index: this.index,
        icon: this.icon,
        text: this.text,
        value: this.value,
        href: this.href,
        atLast: this.atLast,
        asterisk: this.asterisk
      };
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnClickDel() {
      if (this.readonly || !this.removable) {
        return;
      }
      this.$notify("remove", this.theData);
    },
    //------------------------------------------------
    OnClickOption({ value, text, icon } = {}) {
      if (this.readonly) {
        return;
      }
      this.$notify("change", {
        value,
        text,
        icon,
        index: this.index
      });
      this.closeDrop();
    },
    //------------------------------------------------
    OnClickTop($event) {
      if (this.readonly) {
        return;
      }
      // Show Drop Down
      if (this.hasOptions) {
        $event.stopPropagation();
        this.openDrop();
      }
      // Stop Bubble Up
      else if (this.cancelBubble) {
        $event.stopPropagation();
      }
      // Emit event
      if (this.href) {
        this.$notify("fire", this.theData);
      }
    },
    //------------------------------------------------
    openDrop() {
      if (this.hasOptions) {
        this.status = "extended";
        this.$nextTick(() => {
          this.dockDrop();
        });
      }
    },
    //------------------------------------------------
    closeDrop() {
      this.status = "collapse";
      this.mouseEnter = null;
    },
    //------------------------------------------------
    dockDrop() {
      let $drop = this.$refs.drop;
      let $box = this.$el;
      // Guard the elements
      if (!_.isElement($drop) || !_.isElement($box)) {
        return;
      }
      // If drop opened, make the box position fixed
      // to at the top of mask
      if ("extended" == this.status) {
        let r_box = Ti.Rects.createBy($box);
        //..........................................
        // Make drop same width with box
        Ti.Dom.setStyle($drop, {
          "min-width": `${r_box.width}px`
        });
        //..........................................
        // Dock drop to box
        Ti.Dom.dockTo($drop, $box, {
          space: { y: 2 },
          posListX: ["left", "right"]
        });
        //..........................................
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    this.dockDrop();
  }
  ////////////////////////////////////////////////////
};
