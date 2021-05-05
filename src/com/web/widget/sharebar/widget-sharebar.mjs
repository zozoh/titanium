export default {
  /////////////////////////////////////////
  data: ()=>({
    qrcodeImgSrc: undefined
  }),
  /////////////////////////////////////////
  props : {
    "title": {
      type: String,
      default: null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "apiBase" : {
      type : String,
      default : "/"
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
    },
    //------------------------------------
    ShareTargets() {
      return {
        //..............................
        "facebook": {
          iconClass: "fab fa-facebook-f",
          link : "https://www.facebook.com/sharer.php",
          params : {
            u     : "=url",
            title : "=title"
          }
        },
        //..............................
        "twitter": {
          iconClass: "fab fa-twitter",
          link : "https://twitter.com/share",
          params : {
            url  : "=url",
            text : "=title"
          }
        },
        //..............................
        "mix": {
          iconClass: "fab fa-mix",
          link : "https://mix.com/mixit",
          params : {
            url  : "=url"
          }
        },
        //..............................
        "linkedin": {
          iconClass: "fab fa-linkedin-in",
          link : "https://www.linkedin.com/cws/share",
          params : {
            url  : "=url"
          }
        },
        //..............................
        "wechat": {
          iconClass: "fab fa-weixin",
          link : ({url})=>{
            let src = `${this.apiBase}qrcode?s=${url}`
            this.qrcodeImgSrc = src
          },
          params : {
            url  : "=url"
          }
        }
        //..............................
      }
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
      //console.log("haha", params)
      if(_.isString(link)) {
        Ti.Be.Open(link, {params})
      } else if(_.isFunction(link)) {
        link(params)
      }
    },
    //------------------------------------
    evalItems(items) {
      let list = []
      _.forEach(items, (it, index)=>{
        //................................
        let li = _.get(this.ShareTargets, it)
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