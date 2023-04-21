export default {
  ////////////////////////////////////////////////////
  props: {
    "data": {
      type: Array,
      default: () => []
    },
    "itemIcon": {
      type: String,
      default: null
    },
    "pathIcon": {
      type: String,
      default: "zmdi-chevron-right"
    },
    "cancelItemBubble": {
      type: Boolean,
      default: true
    },
    "startIndex": {
      type: Number,
      default: 0
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //------------------------------------------------
    ItemList() {
      let list = [];
      if (_.isArray(this.data)) {
        _.forEach(this.data, (val, index) => {
          if (index >= this.startIndex) {
            list.push(
              _.assign(
                {
                  icon: this.itemIcon
                },
                val,
                { index, atLast: index == this.data.length - 1 }
              )
            );
          }
        });
      }
      return list;
    }
    //------------------------------------------------
    // theDataValues() {
    //   let list = []
    //   for(let it of this.theData) {
    //     list.push(Ti.Util.fallback(it.value, null))
    //   }
    //   return list
    // }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
  // methods : {
  //   //------------------------------------------------
  //   onItemFired({index=-1}={}) {
  //     if(index >= 0) {
  //       let it = _.nth(this.theData, index)
  //       if(it) {
  //         this.$notify("item:actived", it)
  //       }
  //     }
  //   }
  //   //------------------------------------------------
  // }
  ////////////////////////////////////////////////////
};
