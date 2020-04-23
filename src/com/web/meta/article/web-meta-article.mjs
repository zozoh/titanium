export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "titleKey" : {
      type : String,
      default : "title"
    },
    "briefKey" : {
      type : String,
      default : "brief"
    },
    "dateKey" : {
      type : String,
      default : "date"
    },
    "dateFormat" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "authorKey" : {
      type : String,
      default : "author"
    },
    "bottomLine" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    title() {
      if(this.titleKey) {
        return this.meta[this.titleKey]
      }
      return "NoTitle"
    },
    //......................................
    brief() {
      if(this.briefKey) {
        return this.meta[this.briefKey]
      }
    },
    //......................................
    hasDateOrAuthor() {
      return (this.date || this.author) ? true : false
    },
    //......................................
    date() {
      if(this.dateKey) {
        let ds = this.meta[this.dateKey]
        if(ds) {
          try {
            return Ti.Types.formatDate(ds, this.dateFormat)
          }catch(E){}
        }
      }
    },
    //......................................
    author() {
      if(this.authorKey) {
        return this.meta[this.authorKey]
      }
    }
    //......................................
  }
  //////////////////////////////////////////
}