export default {
  ///////////////////////////////////////////////////
  data: ()=>({
    myDemo : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "trimed" : {
      type : Boolean,
      default : true
    },
    "content" : {
      type : String,
      default : ""
    }, 
    "blankText" : {
      type : String,
      default : "i18n:blank"
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    renderMarkdown() {
      let MdDoc = Cheap.parseMarkdown(this.content)
      console.log(MdDoc)
      this.myDemo = MdDoc.toString()
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "content" : {
      handler : "renderMarkdown",
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}