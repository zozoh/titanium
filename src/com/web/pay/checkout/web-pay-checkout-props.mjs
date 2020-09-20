export default {
  "tipIcon": {
    type: String,
    default: "fas-clipboard-check"
  },
  "tipText": {
    type: String,
    default: "i18n:pay-checkout-tip"
  },
  /**
   * Items Array should like:
   * {
   *   id: "xxx",      // Item ID
   *   title: "xxx",   // Item display name
   *   price: 34,      // Item price
   *   amount: 2,      // Buy number
   *   thumbSrc        // [optional] Item preview src
   *   href            // [optional] Item link
   * }
   */
  "items" : {
    type : Array,
    default : ()=>[]
  },
  "currency": {
    type: String,
    default: "RMB"
  },
  "orderType": {
    type: String,
    default: "A"
  },
  "addresses": {
    type: Array,
    default: ()=>[]
  },
  // The country map
  "countries" : {
    type: Object,
    default: undefined
  }
}