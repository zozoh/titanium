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
    "showTitle" : {
      type : Boolean,
      default : true
    },
    "content" : {
      type : String,
      default : ""
    }, 
    "contentIsChanged" : {
      type : Boolean,
      default : false
    }
  },
  computed : {
    topClass() {
      return {
        "show-title" : this.showTitle,
        "hide-title" : !this.showTitle
      }
    },
    headClass() {
      return {
        "content-changed" : this.contentIsChanged
      }
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