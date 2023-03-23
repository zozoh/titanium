const _M = {
  /////////////////////////////////////////
  props: {
    "statusStoreKey": {
      type: String,
      default: undefined
    },
    "items": {
      type: Array,
      default: null
    },
    "highlightItemId": {
      type: String,
      default: null
    },
    "highlightItemPath": {
      type: String,
      default: null
    },
    "hideIcon": {
      type: Number,
      default: 0
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //-------------------------------------
    TheItems() {
      let list = [];
      if (_.isArray(this.items)) {
        for (let it of this.items) {
          list.push(this.evalItem(it));
        }
      }
      return list;
    },
    //-------------------------------------
    theHighlightItemId() {
      let list = this.joinHighlightItems([], this.items);
      if (list.length > 0) {
        // Sort the list, 0->N, the first one should be the hightlight one
        list.sort((it0, it1) => it0.score - it1.score);
        // Get the first one
        return _.first(list).id;
      }
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //-------------------------------------
    evalItem(it = {}, depth = 1) {
      // Children
      let items = null;
      if (_.isArray(it.items)) {
        items = [];
        for (let subIt of it.items) {
          items.push(this.evalItem(subIt, depth + 1));
        }
      }
      // Store status
      let groupStatusStoreKey = undefined;
      if (this.statusStoreKey) {
        groupStatusStoreKey = this.statusStoreKey + "_" + it.key;
      }

      // Self
      let re = _.assign(
        _.pick(it, [
          "id",
          "key",
          "depth",
          "icon",
          "title",
          "tip",
          "path",
          "view"
        ]),
        {
          items,
          groupStatusStoreKey,
          highlightId: this.theHighlightItemId,
          href: it.id ? Wn.Util.getAppLink(it.id) + "" : null
        }
      );
      if (this.hideIcon > 0 && depth > this.hideIcon) {
        delete re.icon;
      }
      return re;
    },
    //-------------------------------------
    joinHighlightItems(list = [], items = []) {
      if (this.highlightItemId && _.isArray(items) && items.length > 0) {
        for (let it of items) {
          // Match the ID, 0
          if (it.id == this.highlightItemId) {
            list.push({ score: 0, id: it.id });
          }
          // Match the Path, 1 or more
          else if (
            it.path &&
            it.id &&
            this.highlightItemPath &&
            this.highlightItemPath.startsWith(it.path)
          ) {
            let diff = this.highlightItemPath.length - it.path.length;
            list.push({ score: 1 + diff, id: it.id });
          }
          // Join Children
          if (it.items) {
            this.joinHighlightItems(list, it.items);
          }
        }
      }
      // Return self
      return list;
    },
    //-------------------------------------
    async OnItemActived(payload = {}) {
      
      // Guard for fure
      let bombed = await Ti.Fuse.fire();
      console.log("OnItemActived", bombed)
      if (!bombed) {
        return;
      }
      this.$notify("item:active", payload);
    },
    //--------------------------------------
    scrollCurrentIntoView() {
      //console.log("scrollCurrentIntoView")
      if (this.theHighlightItemId) {
        let $view = this.$el;
        let $row = Ti.Dom.find(".side-nav-item.is-highlight", $view);
        Ti.Dom.scrollIntoView($view, $row, { to: "center", axis: "y" });
      }
    },
    //-------------------------------------
    delayScrollCurrentIntoView(delay = 500) {
      _.delay(() => {
        this.scrollCurrentIntoView();
      }, delay);
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "theHighlightItemId": "delayScrollCurrentIntoView"
  },
  //////////////////////////////////////////
  mounted() {
    this.$nextTick(() => {
      this.delayScrollCurrentIntoView(0);
      this.delayScrollCurrentIntoView(100);
      this.delayScrollCurrentIntoView(500);
    });
  }
  //////////////////////////////////////////
};
export default _M;
