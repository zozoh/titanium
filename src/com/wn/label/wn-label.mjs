export default {
  //////////////////////////////////////////
  props : {
    "openRefer": {
      type : Object,
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    ValueClickable() {
      return this.openRefer ? true : false
    }
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async OnClickValue() {
      if(!this.openRefer || !this.value)
        return

      // Load refer obj
      let obj = await Wn.Io.loadMetaBy(this.value)
      console.log(obj)
      // prepare conf
      let conf = _.assign({
        title: "i18n:info",
        width: 640,
        height: 480,
        textOk : null,
        textCancel : "i18n:close",
        result : obj
      }, this.openRefer)

      // Show Dialog
      await Ti.App.Open(conf)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}