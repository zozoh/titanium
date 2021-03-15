export default {
  ///////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value" : {
      type : Object
    }
    //-----------------------------------
    // Behavior
    //-----------------------------------
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    hasValue() {
      return (this.value && this.value.id) ? true : false
    },
    //---------------------------------------------------
    GuiLayout(){
      return {
        type: "rows",
        border:true,
        blocks: [{
          size : "37%",
          body : "player"
        }, {
          body : "form"
        }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      const V_FIELD = (name, title)=>{
        return {
          title, name,
          comType : "TiLabel"
        }
      }
      return {
        player: {
          comType: "NetYoutubePlayer",
          comConf: {
            value: this.value
          }
        },
        form: {
          comType: "TiForm",
          comConf: {
            spacing : "tiny",
            autoShowBlank : true,
            data: this.value,
            fields : [
              V_FIELD("id", "ID"),
              V_FIELD("title", "Title"),
              V_FIELD("description", "Description"),
              V_FIELD("publishedAt", "PublishedAt"),
              V_FIELD("tags", "Tags"),
              V_FIELD("duration", "Duration"),
              V_FIELD("du_in_sec", "Du in sec"),
              V_FIELD("du_in_str", "Du in str"),
              V_FIELD("definition", "Definition"),
              V_FIELD("categoryId", "CategoryId")
            ]
          }
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}