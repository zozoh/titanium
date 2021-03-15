export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    showPlayer : false
  }),
  ///////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value" : {
      type : Object
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "allow" : {
      type : [String, Array],
      default : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    },
    "allowFullScreen" : {
      type : Boolean
    },
    //-----------------------------------
    // Aspace
    //-----------------------------------
    "blankAs" : {
      type : Object,
      default : ()=>({
        className : "as-big",
        icon : "fab-deezer",
        text : "i18n:empty"
      })
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    TopStyle() {
      if(this.hasValue) {
        return {
          "background-image" : `url("${this.value.thumb_url}")`
        }
      }
    },
    //---------------------------------------------------
    hasValue() {
      return (this.value && this.value.id) ? true : false
    },
    //---------------------------------------------------
    VideoSrc() {
      if(this.hasValue) {
        return `//www.youtube.com/embed/${this.value.id}`
      }
    },
    //---------------------------------------------------
    VideoAllow() {
      if(_.isString(this.allow)) {
        return this.allow
      }
      if(_.isArray(this.allow)) {
        return this.allow.join(";")
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "value" : function(newVal, oldVal) {
      if(newVal && !_.isEqual(newVal, oldVal)) {
        this.showPlayer = false
      }
    }
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}