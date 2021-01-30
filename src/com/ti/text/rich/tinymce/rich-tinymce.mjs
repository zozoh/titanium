const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myHtmlCode : undefined
  }),
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass({
        "nil-content" : this.isContentNil,
        "has-content" : !this.isContentNil
      })
    },
    //-----------------------------------------------
    TheToolbar() {
      let tb = this.toolbar
      if(true === this.toolbar
        || (_.isArray(this.toolbar) && _.isEmpty(this.toolbar))) {
        tb = "#quick"
      }
      let m = /^#(.+)$/.exec(tb)
      if(m) {
        let tbName = m[1]
        let tbd = ({
          markdown : [
            'formatselect',
            'bold italic',
            'blockquote bullist numlist',
            'edit'],
          quick : [
            'formatselect',
            'bold italic underline',
            'alignment indent outdent',
            'blockquote bullist numlist',
            'edit'],
          full : [
            'formatselect',
            'bold italic underline',
            'alignment indent outdent',
            'blockquote bullist numlist',
            'table',
            'superscript subscript',
            'edit']
        })[tbName]
        return tbd ? tbd.join("|") : false
      }
      if(_.isArray(this.toolbar)) {
        return this.toolbar.join("|")
      }
      return this.toolbar
    },
    //-----------------------------------------------
    BlankComStyle() {
      return {
        position: "absolute",
        top:0, right:0, bottom:0, left:0,
        zIndex: 10
      }
    },
    //-----------------------------------------------
    isContentLoading() {
      return _.isUndefined(this.value)
    },
    //-----------------------------------------------
    isContentNil() {
      return Ti.Util.isNil(this.value)
    },
    //-----------------------------------------------
    TheLang() {
      let ss = _.kebabCase(this.lang).split(/[_-]/)
      let s0 = _.lowerCase(ss[0])
      if("en" == s0)
        return null
      let s1 = _.upperCase(ss[1])
      return [s0, s1].join("_")
    },
    //-----------------------------------------------
    TheTinyEditor() {
      return _.assign({
        plugins: 'paste lists table',
        auto_focus: true,
        menubar: true,
        statusbar: false,
        menubar: false,
        resize: false,
        br_in_pre : false,
        table_advtab: false,
        table_cell_advtab: false,
        table_row_advtab: false,
        table_toolbar: [
          'tableinsertrowbefore tableinsertrowafter tabledeleterow','tableinsertcolbefore tableinsertcolafter tabledeletecol',
          'tabledelete'].join("|"),
        table_use_colgroups: true
      }, this.tinymce)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    getOutline() {

    },
    //-----------------------------------------------
    async initEditor() {
      //.............................................
      await tinymce.init({
        target: this.$refs.editor,
        ... this.TheTinyEditor,
        language: this.TheLang,
        readonly : this.readonly,
        placeholder: Ti.I18n.text(this.placeholder),
        toolbar: this.TheToolbar,
        toolbar_groups: {
            edit : {
              icon: 'edit-block',
              tooltip: 'edit',
              items: 'copy cut paste pastetext | removeformat | undo redo',
            },
            alignment: {
              icon: 'align-justify',
              tooltip: 'alignment',
              items: 'alignleft aligncenter alignright alignjustify',
            },
        },
        setup : (editor)=>{
          // Event: change
          editor.on("Change", (evt)=>{
            // console.log("haha ", evt)
            this.myHtmlCode = editor.getContent()
          })
          // Shortcute
          editor.addShortcut('ctrl+s', "Save content", ()=>{
            Ti.App(this).fireShortcut("CTRL+S");
          });
          // Customized
          if(_.isFunction(this.tinymceSetup)) {
            this.tinymceSetup(editor)
          }
          // Remember instance
          this.$editor = editor
        }
      });
      if(this.value) {
        this.myHtmlCode = this.value
        this.$editor.setContent(this.value)
      }
      // https://www.tiny.cloud/blog/tinymce-toolbar/
      //   tinymce.init({
      //     selector: "textarea",
      //     menubar: false,
      //     plugins: "link image code",
      //     toolbar: 'undo redo | styleselect | forecolor | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link image | code'
      // });
      //.............................................
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "myHtmlCode" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal) && !_.isEqual(newVal, this.value)) {
        this.$notify("change", newVal);
      }
    },
    "value" : function(newVal, oldVal) {
      // console.log("value", newVal, oldVal)
      if(!this.myHtmlCode ||
        (!_.isEqual(newVal, oldVal) && !_.isEqual(newVal, this.myHtmlCode))) {
        this.myHtmlCode = newVal
        this.$editor.setContent(newVal||"")
      }
    }
  },
  ///////////////////////////////////////////////////
  created : function() {
    
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.initEditor()
  }
  ///////////////////////////////////////////////////
}
export default _M;