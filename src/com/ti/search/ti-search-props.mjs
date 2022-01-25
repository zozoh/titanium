export default {
  //------------------------------------------------
  // Data
  //------------------------------------------------
  "filter": {
    type: Object,
    default: () => ({})
  },
  "sorter": {
    type: Object,
    default: () => ({ ct: -1 })
  },
  "pager": {
    type: Object,
    default: () => ({
      pn: 1,
      pgsz: 50,
      pageNumber: 1,
      pageSize: 50
    })
  },
  "pagerValueType": {
    type: String,
    default: "shortName"
  },
  // REGEX to limit the output WnObj keys
  "objKeys": {
    type: String,
    default: undefined
  },
  //------------------------------------------------
  // Behavior
  //------------------------------------------------
  "majors": {
    type: Array,
    default: () => []
  },
  "matchKeywords": {
    type: Array,
    default: () => []
  },
  "advanceForm": {
    type: Object
  },
  "advanceComponents": {
    type: Array,
    default: () => []
  },
  "sorterConf": {
    type: Object
  },
  "listComType": {
    type: String,
    default: "TiList"
  },
  "listComConf": {
    type: Object,
    default: () => ({})
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder": {
    type: String,
    default: "i18n:search"
  },
  "dialog": {
    type: Object
  },
  "filterTags": {
    type: Object
  }
}