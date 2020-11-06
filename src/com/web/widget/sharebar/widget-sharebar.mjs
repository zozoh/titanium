export default {
  /////////////////////////////////////////
  props : {
    "title": {
      type: String,
      default: null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    TheItems() {
      return this.evalItems(this.items)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnClickItem({link, params}) {
      if(!link)
        return

      let url = window.location.href
      let title = window.document.title
      params = Ti.Util.explainObj({url, title}, params)
      console.log("haha", params)
      Ti.Be.Open(link, {params})
    },
    //------------------------------------
    evalItems(items) {
      let list = []
      _.forEach(items, (it, index)=>{
        //................................
        let li = ({
          //..............................
          "facebook": {
            iconClass: "fab fa-facebook-f",
            link : "https://www.facebook.com/sharer.php",
            params : {
              title : "=title",
              u     : "=url"
            }
          },
          //..............................
          "twitter": {
            iconClass: "fab fa-twitter",
            link : "https://twitter.com/share",
            params : {
              text : "=title",
              url  : "=url"
            }
          }
          //..............................
        })[it]
        //................................
        if(li)
          list.push(li)
        //................................
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}