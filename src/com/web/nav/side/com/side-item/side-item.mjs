const _M = {
  ///////////////////////////////////////////////////////
  props : {
    "openedIcons" : undefined
  },
  ///////////////////////////////////////////////////////
  computed : {
    OpenStatusIcon() {
      return this.isOpened
        ? this.openedIcons.opened
        : this.openedIcons.closed
    }
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    OnTransBeforeEnter($con) {
      // console.log("before enter")
      Ti.Dom.setStyle($con, {height: 0, overflow: "hidden"})
    },
    OnTransEnter($con) {
      // console.log("enter")
      Ti.Dom.setStyle($con, {height: $con.scrollHeight - 4})
    },
    OnTransAfterEnter($con) {
      // console.log("after enter")
      _.delay(()=>{
        Ti.Dom.setStyle($con, {height: "", overflow: ""})
      })
    },
    //---------------------------------------------------
    OnTransBeforeLeave($con) {
      //console.log("before leave", height)
      Ti.Dom.setStyle($con, {height: $con.scrollHeight, overflow: "hidden"})
    },
    OnTransLeave($con) {
      //console.log("leave", $con.scrollHeight)
      _.delay(()=>{
        Ti.Dom.setStyle($con, {height: 0})
      })
    },
    OnTransAfterLeave($con) {
      //console.log("after leave")
      _.delay(()=>{
        Ti.Dom.setStyle($con, {height: "", overflow: ""})
      })
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
export default _M;