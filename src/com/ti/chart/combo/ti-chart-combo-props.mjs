export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data": {
    type: Array,
    default: () => []
  },
  "name": {
    type: String,
    default: undefined
  },
  "type": {
    type: String,
    default: undefined
  },
  "date": {
    type: [Number, String, Date],
    default: undefined
  },
  "span": {
    type: String,
    default: "7d"
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  // array -> droplist
  // object/string -> single title
  "nameList": {
    type: Array,
    default: () => []
  },
  "maxDate": {
    type: [Number, String, Date],
    default: undefined
  },
  "spanOptions": {
    type: Array,
    default: () => [{
      text: "7",
      value: "7d"
    }, {
      text: "30",
      value: "30d"
    }, {
      text: "60",
      value: "60d"
    }, {
      text: "90",
      value: "90d"
    }, {
      text: "180",
      value: "180d"
    }, {
      text: "360",
      value: "360d"
    }]
  },
  "chartDefines": {
    type: Object,
    default: undefined
  },
  "chartTypes": {
    type: [Array, String],
    default: "pie,bar,line"
  },
  // {pie:{..}, bar:{..}, line:{..}  ...}
  "chartOptions": {
    type: Object,
    default: () => ({})
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------

  //-----------------------------------
  // Measure
  //-----------------------------------
  "nameListWidth": {
    type: [String, Number],
    default: "2rem"
  }
}