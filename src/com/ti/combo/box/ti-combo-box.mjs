export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    box : {
      "position" : null,
      "width"  : null,
      "height" : null,
      "top"    : null,
      "left"   : null
    },
    drop : {
      "position" : "fixed",
      "width"  : null,
      "height" : null
    }
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    "dropHeight" : {
      type : [Number, String],
      default : null
    },
    "status" : {
      type : String,
      default : "collapse",
      validator : (st)=>/^(collapse|extended)$/.test(st)
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      let klass = [`is-${this.status}`]
      if(this.className) {
        klass.push(this.className)
      }
      return klass
    },
    //------------------------------------------------
    boxStyle() {
      return Ti.Css.toStyle(this.box)
    },
    //------------------------------------------------
    dropStyle() {
      return Ti.Css.toStyle(this.drop)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    notifyCollapse() {
      this.$emit("collapse")
    },
    //------------------------------------------------
    dockDrop() {
      let $drop  = this.$refs.drop
      let $box   = this.$refs.box
      // Guard the elements
      if(!_.isElement($drop) || !_.isElement($box)){
        return
      }
      //............................................
      // If drop opened, make the box position fixed
      // to at the top of mask
      if("extended" == this.status) {
        let r_box  = Ti.Rects.createBy($box)
        //..........................................
        // Mark parent to hold the place
        Ti.Dom.setStyle(this.$el, {
          width  : r_box.width,
          height : r_box.height
        })
        //..........................................
        // Mark box to fixed position
        _.assign(this.box, {position:"fixed"}, r_box.raw())
        //..........................................
        // Make drop same width with box
        _.assign(this.drop, {
          width  : "box"==this.dropWidth ? r_box.width : this.dropWidth,
          height : this.dropHeight
        })
        //..........................................
        // Dock drop to box
        this.$nextTick(()=>{
          Ti.Dom.dockTo($drop, $box, {
            space:{y:2}, posListX:["left", "right"]
          })
        })
        //..........................................
      }
      //............................................
    },
    //------------------------------------------------
    resetBoxStyle() {
      // Recover the $el width/height
      Ti.Dom.setStyle(this.$el, {width: "", height: ""})
      // Recover the $box width/height
      _.assign(this.box, {
        position:null, top:null, left:null, 
        width: this.width, height: this.height
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "status" : function(sta){
      this.$nextTick(()=>{
        // If collapse, it should clean the box styles
        if("collapse" == sta) {
          this.resetBoxStyle()
        }
        // try docking
        this.dockDrop()
      })
    }
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    this.dropOpened = this.autoOpenDrop
    this.box.width  = this.width
    this.box.height = this.height

    this.dockDrop()

    Ti.Viewport.watch(this, {
      scroll:()=>this.notifyCollapse(),
      resize:()=>this.notifyCollapse()
    })
  },
  ////////////////////////////////////////////////////
  beforeDestroy : function() {
    Ti.Viewport.unwatch(this)
  }
  ////////////////////////////////////////////////////
}