export default {
  props : {
    "lines" : {
      type : Array,
      default : ()=>[]
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    }
  },
  computed: {
    TopClass() {
      return this.getTopClass()
    },
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    }
  },
  methods: {
    scrollToBottom() {
      let $pre = this.$refs.pre
      $pre.scrollTop = $pre.scrollHeight
    }
  },
  watch: {
    "lines": function() {
      //console.log(this.lines.length)
      this.$nextTick(()=>{
        this.scrollToBottom()
      })
    }
  }
}