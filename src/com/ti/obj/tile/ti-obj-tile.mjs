export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////
  props : {
    className : {
      type : String,
      default : null
    },
    index : {
      type : Number,
      default : -1
    },
    id : {
      type : String,
      default : null
    },
    // The URL of thumb
    preview : {
      type : Object,
      default : ()=>({
        type : "icon",
        value : "broken_image"
      })
    },
    // The text to present the object
    title : {
      type : String,
      default : null
    },
    href : {
      type : String,
      default : null
    },
    // true - alwasy show the footer part
    brief : {
      type : String,
      default : null
    }
  },
  ////////////////////////////////////////////////
  computed : {
    topClass() {
      return this.className
    }
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    onClickTitle($event) {
      //console.log("onClickTitle", $event)
      this.$emit("selected", {
        index : this.index,
        id : this.id,
        $event : $event
      })
    },
    //--------------------------------------------
    renderLocalFile() {
      if('localFile' == this.preview.type) {
        let reader = new FileReader();
        reader.onload = (evt)=>{
          this.$refs.localImage.src = evt.target.result
        }
        reader.readAsDataURL(this.preview.value);
      }
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mounted : function(){
    this.renderLocalFile()
  }
  ////////////////////////////////////////////////
}