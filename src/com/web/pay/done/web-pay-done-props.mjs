export default {
  "okIcon": {
    type : String,
    default : "im-check-mark-circle"
  },
  "okText": {
    type : String,
    default : "i18n:pay-re-ok"
  },
  // [{icon, text, href(for newTab), path(for navTo)}]
  "okLinks": {
    type: Array,
    default: ()=>[]
  },
  "failIcon": {
    type : String,
    default : "im-warning"
  },
  "failText": {
    type : String,
    default : "i18n:pay-re-fail"
  },
  // [{icon, text, href(for newTab), path(for navTo)}]
  "failLinks": {
    type: Array,
    default: ()=>[]
  },
  // [{icon, text, href(for newTab), path(for navTo)}]
  "doneLinks": {
    type: Array,
    default: ()=>[]
  },
}