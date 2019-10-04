export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "base" : {
      type : String,
      default : "/"
    },
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "currentPath" : {
      type : String,
      default : null
    },
    // "left | center | right"
    "align" : {
      type : String,
      default : "left"
    },
    // "tiny | comfort | loose"
    "space" : {
      type : String,
      default : "comfort"
    },
    // "solid | dashed | dotted"
    // null will hide the border
    "border" : {
      type : String,
      default : "solid"
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    links() {
      return Ti.WWW.explainNavigation(this.data, this.base)
    },
    //------------------------------------
    displayLinks() {
      let list = []
      for(let it of this.links) {
        let li = _.pick(it, [
          "icon", "title", "type",
          "href", "target", "value"])
        if(this.currentPath) {
          li.isHighlight = it.highlightBy(this.currentPath)
        }
        if(li.isHighlight) {
          li.className = "is-highlight"
        }
        list.push(li)
      }
      return list
    },
    //------------------------------------
    topClass() {
      return {
        "is-align-left"     : "left"    == this.align,
        "is-align-center"   : "center"  == this.align,
        "is-align-right"    : "right"   == this.align,
        "is-space-tiny"     : "tiny"    == this.space,
        "is-space-comfort"  : "comfort" == this.space,
        "is-space-loose"    : "loose"   == this.space,
        "is-border-solid"   : "solid"   == this.border,
        "is-border-dashed"  : "dashed"  == this.border,
        "is-border-dotted"  : "dotted"  == this.border
      }
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    onClickLink(evt, it) {
      if(/^(page|action)$/.test(it.type)) {
        evt.preventDefault()
        console.log("onClickLink", "nav:to", it)
        this.$emit("nav:to", it)
      }
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}