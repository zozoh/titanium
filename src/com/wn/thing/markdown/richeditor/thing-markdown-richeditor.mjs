const _M = {
  ///////////////////////////////////////////////////
  inject: ["$ThingManager"],
  ///////////////////////////////////////////////////
  props: {
    "listenMedia": {
      type: String,
      default: "file:open"
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnEditorInit($editor) {
      this.$editor = $editor
    },
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  mounted() {
    if(this.listenMedia) {
      this.$ThingManager.addEventRouting(this.listenMedia, (oMedia)=>{
        console.log("oMedia", oMedia)
        this.$editor.insertMediaObj(oMedia)
      })
    }
  },
  ///////////////////////////////////////////////////
  beforeDestroy() {
    if(this.listenMedia) {
      this.$ThingManager.removeEventRouting(this.listenMedia)
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;