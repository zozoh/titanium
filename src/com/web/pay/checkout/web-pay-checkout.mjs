const _M = {
  //////////////////////////////////////////
  data: ()=>({
    showAddrCanList : false
  }),
  //////////////////////////////////////////
  props : {
    "currentAddr": {
      type: Object,
      default: undefined
    },
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    isEmpty() {
      return _.isEmpty(this.items)
    },
    //--------------------------------------
    CurrencyChar(){
      return Ti.Bank.getCurrencyChar(this.currency)
    },
    //--------------------------------------
    TheItems() {
      let list = []
      _.forEach(this.items, it=>{
        list.push({
          ... it,
          subtotal: Ti.Num.precise(it.price * it.amount)
        })
      })
      return list
    },
    //--------------------------------------
    TotalFee() {
      let fee = 0;
      _.forEach(this.TheItems, it=>fee+=(it.price*it.amount))
      return Ti.Num.precise(fee)
    },
    //--------------------------------------
    AddrCanList() {
      return {
        data : this.addresses,
        blankAs : {
          "className" : "ti-fill-parent",
          "icon": "fas-map",
          "text": "i18n:address-empty-list"
        },
        comType : "WebTileAddress",
        comConf : {
          value : "=..",
          countries: this.countries,
          can: {
            remove: false,
            edit: false,
            select: false,
            default: false
          },
          selectable : true,
          currentId: _.get(this.currentAddr, "id")
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnShowProduct({id}={}) {
      this.$notify("show:product", id)
    },
    //--------------------------------------
    OnChooseAddr() {
      this.showAddrCanList = true
    },
    //--------------------------------------
    OnHideAddrCanList() {
      this.showAddrCanList = false
    },
    //--------------------------------------
    OnAddAddr() {
      this.$notify("add:address")
    },
    //--------------------------------------
    OnSelectAddr(addr) {
      this.showAddrCanList = false
      this.$emit("change", {
        address: addr
      })
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;