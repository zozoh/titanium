export default {
  onItemSelected(index){
    //console.log("--------------------", arg)
    this.$emit("selected", index)
  },
  onClickBody(){
    console.log("click body")
  }
}