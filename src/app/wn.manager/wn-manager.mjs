export default {
  data : ()=>({
    "loadingComType" : "ti-obj-loading",
    "mainView" : null,
    "status"   : null
  }),
  //////////////////////////////////////////////
  watch : {
    "obj.meta" : function(newMeta, oldMeta) {
      let vm = this;
      if(Ti.IsTrace()) {
        console.log("watched-----------------", newMeta, oldMeta)
      }
      if(!newMeta || !oldMeta || newMeta.id != oldMeta.id) {
        vm.reloadMain(newMeta)
      }
    }
  },
  //////////////////////////////////////////////
  mounted : function(){
    console.log("hahahahahahahaha=============")
    let vm = this
    window.onpopstate = function({state}){
      let meta = state
      vm.$store.dispatch("wn-obj-meta/reload", meta)
    }
  },
  //////////////////////////////////////////////
  computed : {
    mainData() {
      return this.$store.state.main
    },
    mainComIcon() {
      let icon = this.mainView ? this.mainView.comIcon : null
      return icon || "extension"
    },
    mainComName() {
      return this.mainView ? this.mainView.comName : null
    },
    mainModType() {
      return this.mainView ? this.mainView.comType : null
    }
  },
  //////////////////////////////////////////////
  methods : {
    getObjLink(meta) {
      return '/a/open/wn.manager?ph=id:'+meta.id
    },
    //.........................................
    onOpen(meta) {
      let vm = this
      vm.$store.dispatch("wn-obj-meta/reload", meta).then((meta)=>{
        let his = window.history
        if(his) {
          let newLink = vm.getObjLink(meta)
          let title =  Wn.Util.getObjDisplayName(meta)
          console.log(title , "->", newLink)
          his.pushState(meta, title, newLink)
        }
      })
    }
  }  // methods
  //////////////////////////////////////////////
}