const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myPlugins : [],
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
            'edit removeformat'],
          quick : [
            'formatselect',
            'bold italic underline',
            'alignment indent outdent',
            'blockquote bullist numlist',
            'edit removeformat'],
          full : [
            'formatselect',
            'bold italic underline',
            'alignment indent outdent',
            'blockquote bullist numlist',
            'table',
            'superscript subscript',
            'edit removeformat']
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
    ExplainPluginUrl() {
      // String
      if(_.isString(this.pluginUrl)) {
        return Ti.Util.genInvoking(this.pluginUrl, {partial:"right"})
      }
      // Customized function
      if(_.isFunction(this.pluginUrl)) {
        return this.pluginUrl
      }
      // Default
      return function(url) {
        let m = /^[#](.+)$/.exec(url)
        if(m) {
          return `@com:ti/text/rich/tinymce/plugin/${m[1]}.mjs`
        }
        return url
      }
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
      let plugNames = _.map(this.myPlugins, ({name}={})=>name)
      let plugins = ['paste lists table'].concat(plugNames)
      return _.assign({
        plugins: plugins.join(" "),
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
      }, this.tinyConfig)
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
      // Prepare the configuration
      const conf = {
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
              items: 'copy cut paste pastetext | undo redo',
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
          // Event: watch the command to update
          editor.on("ExecCommand", (evt)=>{
            this.myHtmlCode = editor.getContent()
          })
          // Shortcute
          editor.addShortcut('ctrl+s', "Save content", ()=>{
            Ti.App(this).fireShortcut("CTRL+S");
          });
          editor.addShortcut('alt+shift+v', "View source", ()=>{
            Ti.App(this).fireShortcut("ALT+SHIFT+V");
          });
          editor.addShortcut('alt+shift+P', "Properties", ()=>{
            Ti.App(this).fireShortcut("ALT+SHIFT+P");
          });
          // Customized
          if(_.isFunction(this.tinySetup)) {
            this.tinySetup(editor)
          }
          // Remember instance
          this.$editor = editor
        }
      }
      // Init customized plugins
      for(let plug of this.myPlugins) {
        tinymce.PluginManager.add(plug.name, plug.setup)
        if(_.isFunction(plug.init)) {
          plug.init(conf)
        }
      }
      
      // :: Setup tinyMCE
      // The init() method return Promise object for some result async loading.
      // We need to await all them done before invoke setContent method of
      // the editor instance.
      await tinymce.init(conf);

      // init content
      if(this.value) {
        this.myHtmlCode = this.value
        this.$editor.setContent(this.value)        
      }
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
      //console.log("value", newVal, oldVal)
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
  mounted : async function() {
    if(!_.isEmpty(this.plugins)) {
      let list = _.map(this.plugins, this.ExplainPluginUrl)
      this.myPlugins = await Ti.Load(list)
    }
   
    await this.initEditor()
  }
  ///////////////////////////////////////////////////
}
export default _M;