const _M = {
  /////////////////////////////////////////
  data: ()=>({
    myOpenedIds : {}
  }),
  /////////////////////////////////////////
  props : {
    "openedDepth" : {
      type : Number,
      default : 1
    },
    "openedIcons" : {
      type : Object,
      default: ()=>({
        opened : "im-angle-up",
        closed : "im-angle-down"
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------\
    OnChangeOpened({id, opened}) {
      this.myOpenedIds = _.assign({}, this.myOpenedIds, {
        [id] : opened
      })
    }
    //-------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;