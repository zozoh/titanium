const _M = {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "mapping": {
      type: Object,
      default: ()=>({
        userId     : "uid",
        userName   : "unm",
        avatar     : "avatar",
        content    : "brief",
        createTime : "ct"
      })
    },
    "avatarSrc": {
      type: String,
      default: undefined
    },
    "userIcon" : {
      type : [String,Object],
      default: "fas-user"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    Post() {
      let it = Ti.Util.translate(this.value, this.mapping)
      return it || {}
    },
    //--------------------------------------
    AvatarIcon() {
      let avatar = _.get(this.Post, "avatar")
      if(avatar && this.avatarSrc) {
        return {
          type  : "image",
          value : Ti.S.renderBy(this.avatarSrc, this.Post)
        }
      }
      return this.userIcon
    },
    //--------------------------------------
    CreateTimeText() {
      if(this.Post.createTime)
        return Ti.DateTime.timeText(this.Post.createTime)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;