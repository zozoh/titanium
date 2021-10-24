export default {
  /////////////////////////////////////////
  props: {
    // The items appeared at the head
    "headItems": {
      type: Array,
      default: () => []
    },
    // The items appeared at the tail
    "tailItems": {
      type: Array,
      default: () => []
    },
    /*
    {text, icon, href, newtab, path, payload}
    */
    "items": {
      type: Array,
      default: () => []
    },
    "translateHead": {
      type: Boolean,
      default: false
    },
    "translateTail": {
      type: Boolean,
      default: false
    },
    "mapping": {
      type: [Object, Function],
      default: undefined
    },
    "idBy": {
      type: String,
      default: "=id"
    },
    "childrenBy": {
      type: String,
      default: "items"
    },
    "sortBy": {
      type: [Function, String],
      default: undefined
    },
    "notifyName": {
      type: String
    },
    // Store current array
    // could be Array<Object> Or Object or String
    "currentIds": {
      type: [Array, Object, String]
    },
    "base": {
      type: String,
      default: undefined
    },
    // for highlight
    "value": String,
    // for highlight
    "path": String,
    "params": [Object, String, Number, Array]
  },
  /////////////////////////////////////////
  computed: {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    CurrentIdMap() {
      let cids = _.concat(this.currentIds)
      let re = {}
      for (let cid of cids) {
        if (!cid) {
          continue;
        }
        if (_.isString(cid)) {
          re[cid] = true
        } else {
          cid = Ti.Util.explainObj(cid, this.idBy);
          re[cid] = true
        }
      }
      return re;
    },
    //------------------------------------
    TheItems() {
      //
      // Head
      //
      let itHead = this.headItems
      if (this.translateHead) {
        itHead = this.ItemMapping(itHead)
      }
      //
      // Items
      //
      let its = _.cloneDeep(this.items)
      const SortItems = items => {
        if (this.SortItemsBy) {
          let list = _.sortBy(items, this.SortItemsBy)
          for (let li of list) {
            let subs = _.get(li, this.childrenBy)
            if (_.isArray(subs)) {
              let subs2 = SortItems(subs)
              _.set(li, this.childrenBy, subs2)
            }
          }
          return list
        }
        return items
      }
      // Sorting 
      its = SortItems(its)
      // Mapping items
      const MappingItems = (items, parents = []) => {
        let list = []
        for (let i = 0; i < items.length; i++) {
          let it = items[i];
          let it2 = this.ItemMappingBy(it, {
            index: i,
            parents,
            items,
            base: this.base
          })
          it2.rawData = it
          let subs = _.get(it, this.childrenBy)
          if (_.isArray(subs)) {
            let pAxis = _.concat(parents, it)
            subs = MappingItems(subs, pAxis)
            it2.items = subs
          }
          list.push(it2)
        }
        return list
      }
      // Mapping
      let itList = MappingItems(its)
      //
      // Tail
      //
      let itTail = this.tailItems
      if (this.translateTail) {
        itTail = this.ItemMapping(itTail)
      }
      //
      // Concat
      //
      let list = _.concat(itHead, itList, itTail)
      return this.evalItems(list)
    },
    //------------------------------------
    SortItemsBy() {
      if (_.isString(this.sortBy)) {
        return it => _.get(it, this.sortBy)
      }
      if (_.isFunction(this.sortBy)) {
        return it => this.sortBy(it)
      }
    },
    //------------------------------------
    ItemMappingBy() {
      if (_.isFunction(this.mapping)) {
        return this.mapping
      }

      if (this.mapping) {
        return item => {
          return Ti.Util.explainObjs(item, this.mapping)
        }
      }

      return item => item
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods: {
    //------------------------------------
    OnClickLink(evt, linkInfo) {
      // Guard
      if(!evt || !_.isFunction(evt.stopPropagation)) {
        return
      }
      evt.stopPropagation();
      let { type, value } = linkInfo
      if (/^(page|action|invoke|mutation)$/.test(type)) {
        evt.preventDefault()
        //console.log("onClickLink", "nav:to", {type,value})
        if (value) {
          let notiName = this.notifyName || "nav:to"
          this.$notify(notiName, linkInfo)
        }
      } else if (this.notifyName) {
        this.$notify(this.notifyName, linkInfo)
      }
    },
    //------------------------------------
    evalItems(items, depth = 0) {
      // Explain first
      return Ti.WWW.explainNavigation(items, {
        depth,
        base: this.base,
        idBy: this.idBy,
        value: this.value,
        iteratee: (li) => {
          //if(this.path || this.value) {
          li.highlight = li.highlightBy(this)
          //}
          //........................................
          // Children highlight cause the parent focused
          let current = this.CurrentIdMap[li.id]
          if (!current && !_.isEmpty(li.items)) {
            for (let it of li.items) {
              if (it.current || it.highlight) {
                current = true
                break
              }
            }
          }
          li.current = current
          return li
        }
      })
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}