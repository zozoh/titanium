const _M = {
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    PickerOptions() {
      return async () => {
        let re = await Wn.Io.loadContent(this.options, { as: "json" })
        return re;
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;