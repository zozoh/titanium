export default {
  /////////////////////////////////////////
  props : {
    "me": {
      type: Object,
      default: ()=>({})
    },
    "avatarSrc": {
      type: String,
      default: undefined
    },
    "avatarIcons": {
      type: Object,
      default: ()=>({
        "unknown": "far-user",
        "male": "im-user-male",
        "female": "im-user-female"
      })
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    TheAvatar() {
      let me = this.me || {}
      if(this.avatarSrc && me.thumb) {
        return {
          type: "image",
          value: Ti.S.renderVars(me.thumb, this.avatarSrc)
        }
      }
      // Icon: male
      if(me.sex == 1) {
        return this.avatarIcons.male
      }
      // Icon: female
      if(me.sex == 2) {
        return this.avatarIcons.female
      }
      // Icon: unknown
      return this.avatarIcons.unknown || "far-user"
    },
    //------------------------------------
    TheNickname() {
      let me = this.me || {}
      return me.nickname 
             || me.email
             || me.phone
             || me.nm
             || me.id
             || "Anonymity"
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    
    //------------------------------------
  }
  /////////////////////////////////////////
}