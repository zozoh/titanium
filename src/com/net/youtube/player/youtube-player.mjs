export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    showPlayer : false
  }),
  ///////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data: {id:"QH3zuJCW3Lo", thumbUrl:"https://i.ytimg.com/vi/QH3z..."}
    // Or "QH3zuJCW3Lo"
    //-----------------------------------
    "value" : {
      type : [Object, String]
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "allow" : {
      type : [String, Array],
      default : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    },
    "allowFullScreen" : {
      type : Boolean,
      default : true
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
      if(this.hasValue && this.value.thumbUrl) {
        return {
          "background-image" : `url("${this.value.thumbUrl}")`
        }
      }
    },
    //---------------------------------------------------
    TheValue() {
      if(_.isString(this.value)) {
        return {id: this.value}
      }
      return this.value
    },
    //---------------------------------------------------
    hasValue() {
      return (this.TheValue && this.TheValue.id) ? true : false
    },
    //---------------------------------------------------
    VideoSrc() {
      if(this.hasValue) {
        return `//www.youtube.com/embed/${this.TheValue.id}`
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