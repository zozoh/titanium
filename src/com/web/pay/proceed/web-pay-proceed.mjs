const _M = {
  //////////////////////////////////////////////////
  data : ()=>({
    __WS : null,   // The handle of websocket
    myOrder: null,
    isChecking: false,
    myPaypalUrl: ""
  }),
  //////////////////////////////////////////////////
  props : {
    "payType" : {
      type : String,
      default : null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "orderId" : {
      type : String,
      default : undefined
    },
    "payOk" : {
      type : Boolean,
      default : undefined
    },
    "currency": {
      type: String,
      default: "RMB"
    },
    "address": {
      type: Object,
      default: undefined
    }
  },
  //////////////////////////////////////////////////
  computed : {
    TopClass() {
      return this.getTopClass({
        "has-paytype": this.hasPayType,
        "nil-paytype": !this.hasPayType
      }, `is-${this.PayTypeName}`)
    },
    //----------------------------------------------
    hasPayType() {
      return Ti.Bank.isValidPayType(this.payType)
    },
    //----------------------------------------------
    PayTypeName() {
      if(_.isString(this.payType)) {
        return this.payType.replace(".", "-");
      }
    },
    //----------------------------------------------
    PayTypeText() {
      return Ti.Bank.getPayTypeChooseI18nText(this.payType, {
        text:'pay-step-proceed-tip',
        nil:'pay-step-proceed-nil'
      })
    },
    //----------------------------------------------
    OrderLoadText() {
      return this.orderId
        ? "pay-step-proceed-fetch-order"
        : "pay-step-proceed-create-order"
    },
    //----------------------------------------------
    hasOrder() {
      return !_.isEmpty(this.myOrder)
    },
    //----------------------------------------------
    Payment() {
      return _.get(this.myOrder, "pay_re")
    },
    //----------------------------------------------
    PaymentId() {
      return _.get(this.Payment, "payObjId")
    },
    //----------------------------------------------
    PaymentStatus() {
      return _.get(this.Payment, "status")
    },
    //----------------------------------------------
    PaymentData() {
      return _.get(this.Payment, "data")
    },
    //----------------------------------------------
    PaymentDataType() {
      return _.get(this.Payment, "dataType")
    },
    //----------------------------------------------
    isPaymentCreated() {
      return _.get(this.Payment, "payObjId") ? true : false
    },
    //----------------------------------------------
    isQRCODE() {
      return "QRCODE" == this.PaymentDataType
    },
    //----------------------------------------------
    isIFRAME() {
      return "IFRAME" == this.PaymentDataType
    },
    //----------------------------------------------
    isLINK() {
      return "LINK" == this.PaymentDataType
    },
    //----------------------------------------------
    isJSON() {
      return "JSON" == this.PaymentDataType
    },
    //----------------------------------------------
    isTEXT() {
      return "TEXT" == this.PaymentDataType
    },
    //----------------------------------------------
    PaymentDataAsQrcodeUrl() {
      return `/gu/qrcode?d=${this.PaymentData}&s=${this.qrcodeSize}&_=${Date.now()}`
    },
    //----------------------------------------------
    PayPalLinksMap() {
      let map = {}
      if(this.hasOrder 
        && "paypal" == this.myOrder.pay_tp) {
        _.forEach(this.PaymentData.links, li=> {
          map[li.rel] = li
        })
      }
      return map;
    },
    //----------------------------------------------
    QrcodeImageStyle() {
      return Ti.Css.toStyleRem100({
        width: this.qrcodeSize,
        height: this.qrcodeSize
      })
    },
    //----------------------------------------------
    CheckBtnIcon(){
      if(this.isChecking) {
        return "fas-spinner fa-spin"
      }
      return "zmdi-assignment-check"
    },
    //----------------------------------------------
    CheckBtnText(){
      if(this.isChecking)
        return "i18n:pay-proceed-ing"
      return "i18n:pay-proceed-check"
    }
    //----------------------------------------------
  },
  //////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    async OnClickCheckBtn() {
      if(_.isFunction(this.checkOrder)) {
        this.isChecking = true
        this.myOrder = await this.checkOrder(this.orderId)
        this.isChecking = false
      }
    },
    //----------------------------------------------
    // Wait for payment be created
    // Maybe the processing still in the MessageQueue
    async checkPayment() {
      if(!this.Payment) {
        _.delay(async ()=>{
          this.myOrder = await this.fetchOrder(this.orderId)
          
          this.$nextTick(()=>{
            this.checkPayment()
          })

        }, this.checkPaymentInterval)
      }
      // With payment, do something special for PayPal
      else {
        this.tryEvalPayPal()
      }
    },
    //----------------------------------------------
    async checkOrCreateOrder() {
      if(this.hasOrder) {
        return await this.checkPayment()
      }
      // Get Back
      if(this.orderId) {
        if(_.isFunction(this.fetchOrder)) {
          this.myOrder = await this.payOrder(this.orderId, this.payType)
        }
      }
      // Create new one
      else {
        if(_.isFunction(this.createOrder)) {
          let payItems = _.map(this.items, it=>({
            id: it.id,
            amount: it.amount || 1,
            title: it.title,
            price: it.price
          }))
          let order = await this.createOrder({
            payType: this.payType,
            items: payItems,
            orderType: this.orderType,
            orderTitle: this.orderTitle,
            address: this.address,
            fail: (msg)=>{
              this.$emit("change", {
                payOk  : false,
                errMsg : msg
              })
              this.$notify("step:change", "@next")
            }
          })
          this.$emit("change", {orderId: _.get(order, "id")})
          this.myOrder = order
        }
      }

      // If without payment, check it by remote
      return await this.checkPayment()

      // Finally watch the payment change
      //this.watchPaymentChanged();
    },
    //----------------------------------------------
    // PayPal need open a new link
    async tryEvalPayPal() {
      // Open Link for PayPal approve
      if("paypal" == this.payType && this.isPaymentCreated) {
        let href = _.get(this.PayPalLinksMap, "approve.href")
        let link = Ti.Util.parseHref(href)
        let url = `${link.protocol}://${link.host}${link.path}`
        console.log("🤳", {href, link, url})

        if(this.returnUrl) {
          link.params.returnurl = this.returnUrl
        }

        this.myPaypalUrl = link.toString()

        await Ti.Be.Open(url, {
          // params: _.assign({
          //     returnurl: "http://onchina.local.io:8080/page/shop/payok.html"
          //   },link.params),
          params: link.params,
          delay: 1000
        })
      }
    },
    //----------------------------------------------
    watchPaymentChanged() {
      // Guard
      if(this.__WS 
        || !this.watchUser 
        || !this.hasOrder
        || !this.isPaymentCreated) {
        return
      }
      // Watch Remote
      console.log("【🦅】watchPaymentChanged")
      this.__WS = Ti.Websocket.listenRemote({
        watchTo : {
          method : "watch",
          user   : this.watchUser,
          match  : {
            id : this.PaymentId
          }
        },
        received : (wso)=>{
          console.log("【🦅】websocket", wso)
          this.OnClickCheckBtn()
        },
        closed : ()=>{
          this.unwatchPaymentChanged()
        }
      })
    },
    //----------------------------------------------
    unwatchPaymentChanged() {
      if(this.__WS) {
        this.__WS.close();
      }
    }
    //----------------------------------------------
  },
  //////////////////////////////////////////////////
  watch: {
    "PaymentStatus": function(status) {
      // Fail
      if("FAIL" == status) {
        this.$emit("change", {
          payOk: false,
          errMsg: JSON.stringify(this.PaymentData)
        })
        this.$notify("step:change", "@next")
      }
      // OK
      else if("OK" == status) {
        this.$emit("change", {
          payOk: true
        })
        this.$notify("step:change", "@next")
      }
    }
  },
  //////////////////////////////////////////////////
  mounted : function() {
    this.$notify("change:title", this.PayTypeText)
    this.$nextTick(()=>{
      this.checkOrCreateOrder()
    })
  },
  //////////////////////////////////////////////////
  beforeDestroy : function(){
    this.unwatchPaymentChanged()
  }
  //////////////////////////////////////////////////
}
export default _M;