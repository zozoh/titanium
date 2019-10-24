export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    // null / top / del
    mouseEnter : null,
    // collapse / extended
    status : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    /***
     * Display mode
     * - box  : as label boxes
     * - path : as path like crumb
     */
    "mode" : {
      type : String,
      default : "box"
    },
    "index" : {
      type : Number,
      default : -1
    },
    "icon" : {
      type : String,
      default : null
    },
    "text" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Boolean, Object],
      default : null
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
    "options" : {
      type : Array,
      default : ()=>[]
    },
    "optionIcon" : {
      type : String,
      default : null
    },
    "removeIcon" : {
      type : String,
      default : null
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      let klass = [`as-${this.mode}`]
      // Customized
      if(this.className) {
        klass.push(this.className)
      }
      // Mouse Enter
      if(this.mouseEnter) {
        // Enter Top
        if('top' == this.mouseEnter && this.hasOptions) {
          klass.push("is-enter-top")
        }
        // Enter Icon
        else if('del' == this.mouseEnter) {
          klass.push("is-enter-del")
        }
      }
      return klass
    },
    //------------------------------------------------
    textClass() {
      return {
        "without-icon"    : !this.hasIcon && !this.removeIcon,
        "without-options" : !this.hasOptions
      }
    },
    //------------------------------------------------
    hasIcon() {
      return this.icon ? true : false
    },
    //------------------------------------------------
    hasOptions() {
      return _.isArray(this.options) && this.options.length > 0
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
      let list = _.filter(_.concat(this.options), (v)=>!Ti.Util.isNil(v))
      let tags = []
      _.forEach(list, (li, index)=>{
        let tag
        // Object
        if(_.isPlainObject(li)) {
          tag = _.assign({icon:this.optionIcon}, li, {index})
        }
        // String or simple value
        else {
          tag = {
            index : index,
            icon  : this.optionIcon,
            text  : Ti.Types.toStr(li),
            value : li
          }
        }
        // Join to
        if(!_.isEqual(tag.value, this.value)) {
          tags.push(tag)
        }
      })
      return tags
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onClickDel() {
      this.$emit("removed", {
        index : this.index,
        icon  : this.icon,
        text  : this.text,
        value : this.value
      })
    },
    //------------------------------------------------
    onClickOption({value,text,icon}={}) {
      this.$emit("changed", {
        value,text,icon,
        index: this.index
      })
      this.closeDrop()
    },
    //------------------------------------------------
    openDrop() {
      if(this.hasOptions) {
        this.status = "extended"
        this.$nextTick(()=>{
          this.dockDrop()
        })
      }
    },
    //------------------------------------------------
    closeDrop() {
      this.status = "collapse"
      this.mouseEnter = null
    },
    //------------------------------------------------
    dockDrop() {
      let $drop  = this.$refs.drop
      let $box   = this.$el
      // Guard the elements
      if(!_.isElement($drop) || !_.isElement($box)){
        return
      }
      // If drop opened, make the box position fixed
      // to at the top of mask
      if("extended" == this.status) {
        let r_box  = Ti.Rects.createBy($box)
        //..........................................
        // Make drop same width with box
        Ti.Dom.setStyle($drop, {
          "min-width" : `${r_box.width}px`
        })
        //..........................................
        // Dock drop to box
        Ti.Dom.dockTo($drop, $box, {
          space:{y:2}, posListX:["left", "right"]
        })
        //..........................................
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function(){
    this.dockDrop()
  }
  ////////////////////////////////////////////////////
}