export default {
  props : {
    "icon" : {
      type : Object,
      default : {
        type : "font",
        value : "im-hashtag"
      }
    },
    "title" : {
      type : String,
      default : "No Title"
    },
    "content" : {
      type : String,
      default : ""
    }
  },
  methods : {
    onChangeTextarea() {
      let vm = this
      let $t = vm.$refs.text
      let txt = $t.value
      vm.$emit("change-content", txt)
    }
  },
  created() {
    this.onDebounceChangeTextarea = _.debounce(
      this.onChangeTextarea, 500
    )
  }

}