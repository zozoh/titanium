const _M = {
  ///////////////////////////////////////////////////////
  data: ()=>({
    myDockReady : false,
    myDockShow  : false,
  }),
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    dockSub: function() {
      // let $sub = Ti.Dom.find(".sub-items", this.$el)
      // // Guard
      // if(!$sub) {
      //   return
      // }
      // // Ready to dock
      // let $an = $sub.parentNode
      // let rAn = Ti.Rects.createBy($an)
      // let rSub = Ti.Rects.createBy($sub)
      // let css = Ti.Css.toStyle({
      //   top  : rAn.height,
      //   left : (rAn.width - rSub.width)/2
      // })
      // Ti.Dom.setStyle($sub, css)
      let $con = this.$refs.con
      if(!_.isElement($con))
        return

      let mode = "V";
      let space = {x:-1};
      if(this.isTop) {
        mode = "H"
        space = {y:-1}
      }
      Ti.Dom.dockTo($con, this.$el, {
        mode, space, coord: "target"
      })
      this.myDockReady = true
      _.delay(()=>{
        this.myDockShow = true
      }, 10)
    },
    //---------------------------------------------------
    dockSubDelay: function() {
      if(!this.isOpened) {
        this.myDockReady = false
        this.myDockShow  = false
        return
      }

      _.delay(()=>{
        if(!this.$refs.con) {
          this.dockSubDelay()
        } else {
          this.dockSub()
        }
      }, 10)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "isOpened" : "dockSubDelay"
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    Ti.Viewport.watch(this, {
      scroll : ()=> {
        if(this.isOpened) {
          this.notifyGroupOpenStatus(false)
        }
      }
    })
  },
  ///////////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////////
}
export default _M;