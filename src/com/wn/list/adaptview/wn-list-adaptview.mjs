export default {
  props : {
    data : {
      type : Object,
      default : ()=>({})
    }
  },
  computed : {
    objList() {
      let vm = this
      let list = vm.data.children
      let re = []
      //..........................
      if(_.isArray(list)) {
        for(let it of list) {
          re.push({
            id      : it.id,
            title   : it.nm,
            preview : Wn.Util.genPreviewObj(it),
            ...(it.__is || {
              loading : false,
              process : -1,
              selected : false
            }),
            icons : it.__icons || {
              NW : null,
              NE : null,
              SW : null,
              SE : null
            }
          })
        }
      }
      return re
    }
  },
  methods : {
    onItemSelected(index, mode) {
      this.$store.commit("main/selectItem", {index, mode})
    },
    onItemOpen(index) {
      let meta = _.nth(this.data.children, index)
      if(meta) {
        this.$emit("open", meta)
      }
    },
    onItemBlur() {
      this.$store.commit("main/blurAll")
    },
    onDropFiles(files) {
      let fs = [...files]
      this.$store.dispatch("main/upload", fs)
    }
  }
}