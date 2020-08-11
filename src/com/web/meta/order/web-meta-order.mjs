const _M = {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "proThumbSrc": {
      type : String,
      default : undefined
    },
    "proHref": {
      type : String,
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass(
        `is-${this.OrderStatus}`
      )
    },
    //--------------------------------------
    Order() {
      return this.value || {}
    },
    //--------------------------------------
    OrderStatus() {
      return `or-st-${_.toLower(this.Order.or_st)}`
    },
    //--------------------------------------
    CurrencyChar() {
      return Ti.Bank.getCurrencyChar(this.Order.currency||"RMB")
    },
    //--------------------------------------
    Products() {
      let list = []
      _.forEach(this.value.products, it=>{
        let pro = {...it}
        if(this.proThumbSrc) {
          pro.src = Ti.S.renderBy(this.proThumbSrc, it)
        }
        if(this.proHref) {
          pro.href = Ti.S.renderBy(this.proHref, it)
        }
        pro.subtotal = Ti.Num.precise(it.price * it.amount)
        list.push(pro)
      })
      return list
    },
    //--------------------------------------
    Timestamps() {
      let list = []
      list.push(this.genTimestampItem(
        "fas-file-invoice-dollar","i18n:or-st-nw", this.Order.ct))
      list.push(this.genTimestampLine(this.Order.ok_at))
      list.push(this.genTimestampItem(
        "far-credit-card","i18n:or-st-ok", this.Order.ok_at))
      list.push(this.genTimestampLine(this.Order.sp_at))
      list.push(this.genTimestampItem(
        "fas-shipping-fast","i18n:or-st-sp", this.Order.sp_at))
      list.push(this.genTimestampLine(this.Order.dn_at))
      list.push(this.genTimestampItem(
        "fas-clipboard-check","i18n:or-st-dn", this.Order.dn_at, true))
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickProduct({id}) {
      this.$notify("open:product", id)
    },
    //--------------------------------------
    genTimestampItem(icon, title, t, atLast=false) {
      let it = {type:"item", icon, title, time:t}
      let isOn = (t && t>0)
      it.className =  {
        "is-item": true,
        "is-on": isOn,
        "is-off": !isOn,
        "at-last": atLast
      }
      if(isOn) {
        it.dateText = Ti.DateTime.format(t, "yyyy-MM-dd")
        it.timeText = Ti.DateTime.format(t, "HH:mm:ss")
      }
      return it
    },
    //--------------------------------------
    genTimestampLine(t) {
      let isOn = (t && t>0)
      return {
        type:"line",
        isOn,
        icon: isOn
          ? "fas-chevron-right"
          : "fas-circle",
        className : {
          "is-line": true,
          "is-on": isOn,
          "is-off": !isOn
        }
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;