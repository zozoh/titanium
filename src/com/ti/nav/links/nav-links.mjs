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
          li.href = this.base + li.value
          if(li.newTab)
            li.target = "_blank"
        }
        // Link to URL
        else if('href' == li.type) {
          li.href = li.value
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
    onClickLink(evt, it) {
      console.log(evt, it)
      if('page' == it.type) {
        evt.preventDefault()
        this.$emit("nav:page", it)
      }
    }
  }
  /////////////////////////////////////////
}