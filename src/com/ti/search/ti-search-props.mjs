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
  "filterComType": {
    type: String,
    default: "TiFilterbar"
  },
  "filterComConf": {
    type: Object,
    default: () => ({})
  },
  "listComType": {
    type: String,
    default: "TiList"
  },
  "listComConf": {
    type: Object,
    default: () => ({})
  },
  "multi": {
    type: Boolean,
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