export default {
  /////////////////////////////////////////
  props : {
    "title": {
      type: String,
      default: null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    TheItems() {
      return this.evalItems(this.items)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    evalItems(items) {
      let list = []
      _.forEach(items, (it, index)=>{
        //................................
        let li = ({
          //..............................
          "facebook": {
            iconClass: "fab fa-facebook-f"
          },
          //..............................
          "twitter": {
            iconClass: "fab fa-twitter"
          },
          //..............................
          "instagram": {
            iconClass: "fab fa-instagram"
          },
          //..............................
          "tumblr": {
            iconClass: "fab fa-tumblr"
          }
          //..............................
          //..............................
        })[it]
        //................................
        if(li)
          list.push(li)
        //................................
      })
      return list
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}