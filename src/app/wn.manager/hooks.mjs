export default  {
  mounted : function(){
    let vm = this
    window.onpopstate = function({state}){
      let meta = state
      vm.$store.dispatch("wn-obj-meta/reload", meta)
    }
  }
}