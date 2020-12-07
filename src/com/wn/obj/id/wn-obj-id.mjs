/////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  data : ()=>({
    showDetail : "hide"
  }),
  ///////////////////////////////////////////////////
  props : {
    // icon string
    "value" : {
      type : String,
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass({
        'is-none' : !this.value,
        'is-simple' : !this.OID.homeId,
        'is-two-stage' : this.OID.homeId
      }, `is-detail-${this.showDetail}`)
    },
    //-----------------------------------------------
    OID() {
      if(!this.value) {
        return {}
      }
      // One stage ID
      let str = _.trim(this.value)
      let pos = str.indexOf(':');
      if (pos < 0) {
          return {
            id : str,
            myId : str
          }
      }
      // Two stage ID
      return {
        id: str,
        homeId : str.substring(0, pos).trim(),
        myId : str.substring(pos + 1).trim()
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnMouseEnter() {
      if(!this.value) {
        return
      }
      this.showDetail = "show"
      this.$nextTick(()=>{
        Ti.Dom.dockTo(this.$refs.detail, this.$refs.box, {
          mode : "V"
        })
        this.showDetail = "ready"
      })
    },
    //-----------------------------------------------
    OnMouseLeave() {
      this.showDetail = "hide"
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}