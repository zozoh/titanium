export default {
  "watchUser" : {
    type : String,
    default : null
  },
  "qrcodeSize": {
    type: [String, Number],
    default: 200
  },
  "checkPaymentInterval": {
    type: Number,
    default: 3000
  },
  "fetchOrder": {
    type: Function,
    default: undefined
  },
  "payOrder": {
    type: Function,
    default: undefined
  },
  "createOrder": {
    type: Function,
    default: undefined
  },
  "checkOrder": {
    type: Function,
    default: undefined
  },
  "returnUrl": {
    type: String,
    default: undefined
  },
  "orderTitle": {
    type: String,
    default: undefined
  },
  "orderType": {
    type: String,
    default: "A"
  }
}