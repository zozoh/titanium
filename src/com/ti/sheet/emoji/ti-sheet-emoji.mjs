export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    myValue : null
  }),
  ///////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String,Object,Number],
      default : null
    },
    "width" : {
      type : [Number, String],
      default : "100%"
    },
    "height" : {
      type : [Number, String],
      default : "100%"
    },
    "data" : {
      type : [String, Array],
      default : ()=>[
        "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇",
        "🥰 😍 🤩 😘 😗 😚 😙 😋 😛 😜 🤪 😝 🤑",
        "🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬",
        "🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵",
        "🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 ☹️",
        "😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱",
        "😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿",
        "💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹",
        "😻 😼 😽 🙀 😿 😾 🙈 🙉 🙊 "
      ]
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //---------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //---------------------------------------------------
    hasValue() {
      return this.TheValue ? true : false
    },
    //---------------------------------------------------
    TheValue() {
      return this.myValue || this.value
    },
    //---------------------------------------------------
    TheDataSheet() {
      let list = []
      let sheet = _.flattenDeep(this.data).join("").replace(/[ ]/g, "")
      // 逐字解析
      for(let i=0; i<sheet.length; i+=2) {
        let c = sheet.substring(i, i+2);
        list.push({
          value : c
        })
      }
      return list
    }
    //---------------------------------------------------
  },
  methods : {
    //---------------------------------------------------
    OnClickTop() {
      if(this.notifyName) {
        this.$notify(this.notifyName, this.notifyConf)
      }
    }
    //---------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "myValue" : function() {
      this.$notify("change", this.myValue)
    }
  }
  ///////////////////////////////////////////////////////
}