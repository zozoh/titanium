/////////////////////////////////////////////////////
const BUILTIN_TOOLBAR_ACTIONS = {
  //.........................................
  "|" : {type : "line"},
  //.........................................
  "B" : {
    icon : "fas-bold",
    notifyChange: "bold",
    highlight : "bold",
    disabled : "italic"
  },
  //.........................................
  "I" : {
    icon : "fas-italic",
    notifyChange : "italic",
    highlight : "italic",
    disabled : "bold"
  },
  //.........................................
  "Link" : {
    icon : "fas-link",
    notifyChange : "link",
    highlight : "link"
  },
  //.........................................
  "Code" : {
    icon : "zmdi-code",
    notifyChange : "code",
    highlight : "code"
  },
  //.........................................
  "Heading" : {
    type : "group",
    icon : "fas-hashtag",
    text : "i18n:wordp-heading",
    items : [{
        text: "i18n:wordp-h1",
        notifyChange: "header",
        highlight : "h1",
        value: 1
      }, {
        text: "i18n:wordp-h2",
        notifyChange: "header",
        highlight : "h2",
        value: 2
      }, {
        text: "i18n:wordp-h3",
        notifyChange: "header",
        highlight : "h3",
        value: 3
      }, {
        text: "i18n:wordp-h4",
        notifyChange: "header",
        highlight : "h4",
        value: 4
      }, {
        text: "i18n:wordp-h5",
        notifyChange: "header",
        highlight : "h5",
        value: 5
      }, {
        text: "i18n:wordp-h6",
        notifyChange: "header",
        highlight : "h6",
        value: 6
      }, {
        text: "i18n:wordp-h0",
        notifyChange: "header",
        highlight : "h0",
        value:  0
      }]
  },
  //.........................................
  "BlockQuote" : {
    icon : "fas-quote-right",
    notifyChange : "blockquote",
    highlight : "blockquote"
  },
  //.........................................
  "CodeBlock" : {
    icon : "fas-code",
    notifyChange : "code_block",
    highlight : "code-block"
  },
  //.........................................
  "Indent" : {
    icon : "fas-indent",
    notifyChange: "indent"
  },
  //.........................................
  "Outdent" : {
    icon : "fas-outdent",
    notifyChange: "outdent"
  },
  //.........................................
  "UL" : {
    icon : "fas-list-ul",
    notifyChange : "list",
    value : "bullet",
    highlight: {list:"bullet"}
  },
  //.........................................
  "OL" : {
    icon : "fas-list-ol",
    notifyChange : "list",
    value : "ordered",
    highlight: {list:"ordered"}
  }
  //.........................................
}
/////////////////////////////////////////////////////
const _M = {
  computed : {
    //-----------------------------------------------
    hasToolbar() {
      return !_.isEmpty(this.ToolbarMenuData)
    },
    //-----------------------------------------------
    ToolbarActions() {
      return _.merge({}, BUILTIN_TOOLBAR_ACTIONS, this.actions)
    },
    //-----------------------------------------------
    ToolbarMenuData() {
      let list = []
      _.forEach(this.toolbar, v => {
        let it = _.get(this.ToolbarActions, v)
        //...........................................
        if(it) {
          list.push(it)
        }
        //...........................................
      })
      // list.push({
      //   text: "HL",
      //   action : "$parent:highlightCode"
      // })
      return list;
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    // Events
    //-----------------------------------------------
    OnToolbarChange({name, value}={}) {
      //console.log("OnToolbarChange", {name, value})
      const fn = ({
        //...........................................  
        bold  ($q, val){$q.format("bold", val)},
        italic($q, val){$q.format("italic", val)},
        code($q, val){$q.format("code", val)},
        //...........................................
        header($q, val) {$q.format("header", val)},
        //...........................................
        blockquote($q, val){$q.format("blockquote", val)},
        code_block($q, val){$q.format("code-block", val)},
        //..........................................
        async link($q, val){
          let range = $q.getSelection()
          if(!range) {
            return await Ti.Toast.Open("i18n:wordp-nil-sel", "warn")
          }
          // Eval Format
          let {link} = $q.getFormat(range)
          
          // Adjust range
          let text;
          if(link) {
            let [bolt, offset] = $q.getLeaf(range.index)
            text = bolt.text
            let index = range.index - offset;
            let length = text.length
            range = {index, length}
          }
          else {
            text = $q.getText(range)
          }
          // Eval new tab
          let newtab  = false
          if(/^\+/.test(text)) {
            text = text.substring(1)
            newtab = true
          }
          
          // Get link information
          let reo = await Ti.App.Open({
            icon  : "fas-link",
            title : "i18n:wordp-link",
            height : "3.2rem",
            result : {
              text, newtab, link
            },
            model : {prop: "data", event: "change"},
            comType: "TiForm",
            comConf: {
              fields: [{
                title : "i18n:link-href",
                name  : "link",
                comType : "ti-input"
              }, {
                title : "i18n:link-text",
                name  : "text",
                comType : "ti-input"
              }, {
                title : "i18n:open-newtab",
                name  : "newtab",
                type  : "Boolean",
                comType : "ti-toggle"
              }]
            }
          })
          
          // User Cancel
          if(!reo)
            return

          let newText = reo.text
          if(reo.link && reo.newtab)
            newText = "+" + newText
          $q.updateContents({
            ops: [
              {retain: range.index},
              {delete: range.length},
              {insert: newText, attributes: {
                link: reo.link, newtab: true
              }}]
          })
        },
        //...........................................
        indent ($q){$q.format("indent", "+1")},
        outdent($q){$q.format("indent", "-1")},
        //...........................................
        list($q, val="bullet"){$q.format("list", val)}
        //...........................................
      })[name]
      //.............................................
      // Invoke
      if(_.isFunction(fn)) {
        fn(this.$editor, value)
        this.quillUpdateFormat()
      }
      //.............................................
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
export default _M;