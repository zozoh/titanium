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
    myDropDockReady : false
  }),
  ////////////////////////////////////////////////////
  props : {
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
    "dropOverflow" : {
      type : [String, Array],
      default : "auto",
      validator : (v)=>{
        if(Ti.Util.isNil(v)) {
          return true
        }
        if(_.isString(v)) {
          v = v.split(" ")
        }
        if(_.isArray(v)) {
          if(v.length > 2 || v.length == 0) {
            return false
          }
          for(let s of v) {
            if(!/^(auto|hidden|visible|scroll)$/.test(s)) {
              return false
            }
          }
          return true
        }
        return false
      }
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
      return this.getTopClass(`is-${this.status}`)
    },
    //------------------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        //width  : this.box.width,
        height : this.box.height
      })
    },
    //------------------------------------------------
    theBoxStyle() {
      return Ti.Css.toStyle(this.box)
    },
    //------------------------------------------------
    theDropStyle() {
      return Ti.Css.toStyle({
        "overflow" : this.dropOverflow,
        "visibility" : this.myDropDockReady ? "visible" : "hidden"
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    notifyCollapse(escaped=false) {
      this.$emit("collapse", {escaped})
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
        // Mark box to fixed position
        _.assign(this.box, {position:"fixed"}, r_box.raw())
        //..........................................
        // Make drop same width with box
        let dropStyle = {}
        if("box" == this.dropWidth) {
          dropStyle.width = r_box.width
        }
        else if(!Ti.Util.isNil(this.dropWidth)) {
          dropStyle.width = this.dropWidth
        }
        if(!Ti.Util.isNil(this.dropHeight)) {
          dropStyle.height = this.dropHeight
        }
        //..........................................S
        Ti.Dom.setStyle($drop, Ti.Css.toStyle(dropStyle))      
        //..........................................
        // Dock drop to box
        this.$nextTick(()=>{
          // Count dock
          Ti.Dom.dockTo($drop, $box, {
            space:{y:2}, posListX:["left", "right"]
          })
          // Make drop visible
          _.delay(()=>{
            this.myDropDockReady = true
          }, 1)
        })
        //..........................................
      }
      //............................................
    },
    //------------------------------------------------
    reDockDrop() {
      this.resetBoxStyle()
      this.$nextTick(()=>{
        this.dockDrop()
      })
    },
    //------------------------------------------------
    resetBoxStyle() {
      // Recover the $box width/height
      _.assign(this.box, {
        position:null, top:null, left:null, 
        width: this.width, height: this.height
      })
      this.myDropDockReady = false
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
          // Unwatch
          Ti.App(this).unwatchShortcut(this)
        }
        // try docking
        else {
          this.dockDrop()
          Ti.App(this).watchShortcut(this, {
            "shortcut" : "ESCAPE",
            "action"   : ()=>this.notifyCollapse(true)
          })
        }
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
    Ti.App(this).unwatchShortcut(this)
    Ti.Viewport.unwatch(this)
  }
  ////////////////////////////////////////////////////
}