export default {
  pairs() {
    let vm = this;
    console.log(vm.meta)
    if(!vm.meta)
      return null

    let list = [];
    _.forOwn(vm.meta, (value, key)=>{
      list.push({key, value})
    })
    return list
  }
}