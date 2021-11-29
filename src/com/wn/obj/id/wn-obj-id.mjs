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
      return Wn.Io.OID(this.value)
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
    },
    //-----------------------------------------------
    OnCopyAll(evt) {
      let $ta = Ti.Dom.find("table", this.$el)
      let ids = _.concat(_.get(this.OID, "homeId"), _.get(this.OID, "myId"))
      this.__copy(ids.join(":"), $ta)
    },
    //-----------------------------------------------
    OnCopyHomeId(evt) {
      let $ta = Ti.Dom.find(".is-home-id td:nth-child(2)", this.$el)
      this.__copy(_.get(this.OID, "homeId"), $ta)
    },
    //-----------------------------------------------
    OnCopyMyId(evt) {
      let $ta = Ti.Dom.find(".is-my-id td:nth-child(2)", this.$el)
      this.__copy(_.get(this.OID, "myId"), $ta)
    },
    //-----------------------------------------------
    __copy(str, $ta) {
      Ti.Be.BlinkIt($ta)
      //console.log(str)
      Ti.Be.writeToClipboard(str)
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}