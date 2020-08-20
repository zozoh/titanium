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
    },
    "href": {
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
    OrderId() {
      let orId = this.Order.id;
      if(orId) {
        let pos = orId.indexOf(':')
        if(pos > 0) {
          return _.trim(orId.substring(pos+1))
        }
      }
      return '- unknown -'
    },
    //--------------------------------------
    OrderStatus() {
      return `or-st-${_.toLower(this.Order.or_st)}`
    },
    //--------------------------------------
    OrderHref() {
      if(this.href) {
        return Ti.S.renderBy(this.href, this.Order)
      }
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
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickOrder() {
      if(this.Order.id)
        this.$notify("show:order", this.Order.id)
    },
    //--------------------------------------
    OnClickProduct({id}) {
      if(id) {
        this.$notify("open:product", id);
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;