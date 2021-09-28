export default {
  ////////////////////////////////////////////////////
  props: {
    "icon": {
      type: String,
      default: "fas-exclamation-triangle"
    },
    "text": {
      type: String,
      default: null
    },
    /**
     * {icon,text,href,newtab}
     */
    "links": {
      type: [Object, Array],
      default: () => []
    }
  },
  /////////////////////////////////////////////////////
  computed: {
    //-------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-------------------------------------------------
    hasLinks() {
      return !_.isEmpty(this.links)
    },
    //-------------------------------------------------
    TheLinks() {
      if (!this.hasLinks) {
        return []
      }
      let links = _.concat(this.links)
      let list = []
      _.forEach(links, li => {
        let it = _.cloneDeep(li)
        it.target = li.newtab ? "_blank" : null
        list.push(it)
      })
      return list;
    }
    //-------------------------------------------------
  }
  /////////////////////////////////////////////////////
}