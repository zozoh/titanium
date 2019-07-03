export default {
  /////////////////////////////////////////
  props : {
    "base" : {
      type : String,
      default : "/"
    },
    "data" : {
      type : Array,
      default : ()=>[]
    }
  },
  /////////////////////////////////////////
  computed : {
    links() {
      let list = []
      for(let it of this.data) {
        let li = {
          type : "page",
          ...it
        }
        // Link to Site Page
        if('page' == li.type) {
          li.href = this.joinHrefParams(
            this.base + li.value, li.params, li.anchor
          )
          if(li.newTab)
            li.target = "_blank"
        }
        // Link to URL
        else if('href' == li.type) {
          li.href = this.joinHrefParams(
            li.value, li.params, li.anchor
          )
          if(li.newTab)
            li.target = "_blank"
        }
        // Dispatch action
        else {
          li.href = "javascript:void(0)"
        }
        // Join to list
        list.push(li)
      }
      return list
    }
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    onClickLink(evt, it) {
      if(/^(page|action)$/.test(it.type)) {
        evt.preventDefault()
        this.$emit("nav:to", it)
      }
    },
    //------------------------------------
    joinHrefParams(href, params, anchor) {
      if(!href)
        return href
      //...........................
      let query
      if(!_.isEmpty(params)) {
        query = []
        _.forEach(params, (val, key)=>{
          let v2 = encodeURIComponent(val)
          query.push(`${key}=${v2}`)
        })
        if(query.length > 0) {
          href = href + '?' + query.join("&")
        }
      }
      //...........................
      if(anchor) {
        if(anchor.startsWith("#")) {
          href += anchor
        } else {
          href += "#" + anchor
        }
      }
      //...........................
      return href
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}