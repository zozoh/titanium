export default {
  "watchUser" : {
    type : String,
    default : null
  },
  "qrcodeSize": {
    type: [String, Number],
    default: 200
  },
  "getOrder": {
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
  }
}