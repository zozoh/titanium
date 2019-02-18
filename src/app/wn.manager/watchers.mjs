export default {
  "obj.meta" : function(newMeta, oldMeta) {
    let vm = this;
    if(Ti.IsTrace()) {
      console.log("watched-----------------", newMeta, oldMeta)
    }
    if(!newMeta || !oldMeta || newMeta.id != oldMeta.id) {
      vm.reloadMain(newMeta)
    }
  }
}