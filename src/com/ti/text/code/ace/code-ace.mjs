const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myPlugins : [],
    myHtmlCode : undefined,
    /*
    [{
      key : "xxx",
      index : 0,
      level : 1,  // H1~6
      title : "xxx",
      children : [{..}]
    }]
    */
    myOutlineTree : undefined,
    myCurrentHeadingId : undefined
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
            'bold italic link',
            'blockquote bullist numlist',
            'edit removeformat'],
          quick : [
            'formatselect',
            'bold italic underline link',
            'blockquote bullist numlist',
            'blocks',
            'edit removeformat'],
          full : [
            'formatselect',
            'bold italic underline link',
            'blockquote bullist numlist',
            'blocks table',
            [
              'WnImgPick','WnVideoPick','WnAudioPick',
              'WnAttachmentPick', 'WnAlbumPick'
            ].join(' '),
            ['WnYoutubePick', 'WnFacebookPick'].join(' '),
            'superscript subscript',
            'edit removeformat',
            'TiPreview']
        })[tbName]
        return tbd ? tbd.join("|") : false
      }
      if(_.isArray(this.toolbar)) {
        return this.toolbar.join("|")
      }
      return this.toolbar
    },
    //------------------------------------------------
    ContentCssPath() {
      let css = _.concat(
        Ti.Config.url(`@theme:tinymce/doc_${this.theme}.css`),
        Ti.Config.url(`@deps:zmdi/css/material-design-iconic-font.css`),
        Ti.Config.url(`@deps:fontawesome/5.15.1-web/css/all.css`),
        Ti.Config.url(`@deps:iconmonstr/css/iconmonstr-iconic-font.css`),
      )
      return css.join(",")
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
      //.........................................
      let tinyConfig = _.omit(this.tinyConfig, "plugins")
      let tinyPlugins = _.get(this.tinyConfig, "plugins")
      //.........................................
      let plugins = _.concat('paste lists table', plugNames, tinyPlugins)
      //.........................................
      return _.assign({
        plugins: plugins.join(" "),
        content_css : this.ContentCssPath,
        auto_focus: true,
        statusbar: false,
        menubar: false,
        resize: false,
        br_in_pre : false,
        convert_urls: false,
        // urlconverter_callback: function(url, node, on_save, name) {
        //   // Do some custom URL conversion
        //   console.log("urlconverter_callback", {url, node, on_save, name})
      
        //   // Return new URL
        //   return url;
        // },
        table_advtab: false,
        table_cell_advtab: false,
        table_row_advtab: false,
        table_toolbar: [
          'tableinsertrowbefore tableinsertrowafter tabledeleterow','tableinsertcolbefore tableinsertcolafter tabledeletecol',
          'tabledelete'].join("|"),
        table_use_colgroups: true
      }, tinyConfig)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnHeadingChange($h) {
      this.evalOutline()
    },
    //-----------------------------------------------
    setElementEditable(editable, selector) {
      // Direct element
      if(_.isElement(selector)) {
        selector.contentEditable = editable
        return
      }
      // Guard
      if(_.isEmpty(selector)) {
        return
      }
      // Batch
      if(_.isArray(selector)) {
        for(let sel of selector) {
          this.setElementEditable(editable, sel)
        }
        return
      }
      
      // Find
      if(_.isString(selector)) {
        let els = this.$editor.$(selector)
        for(let i=0; i<els.length; i++) {
          els[i].contentEditable = editable
        }
      }
    },
    //-----------------------------------------------
    syncContent() {
      let str = this.$editor.getContent()
      //console.log("content", typeof str, `【${str}】`, this.value)
      this.myHtmlCode = str
      //console.log("syncContent", str)
      //this.$notify("change", str);
      return str
    },
    //-----------------------------------------------
    evalCurrentHeading() {
      let $node = this.$editor.selection.getNode()
      let $h = Ti.Dom.closestByTagName($node, /^H[1-6]$/)
      
      // Looking previous
      if(!$h) {
        let $body = $node.ownerDocument.body
        let $top = $node
        while($top.parentElement && $top.parentElement != $body) {
          $top = $top.parentElement
        }
        $h = Ti.Dom.prevByTagName($top, /^H[1-6]$/)
      }

      if($h) {
        this.myCurrentHeadingId = $h.getAttribute("ti-outline-id")
      }
    },
    //-----------------------------------------------
    evalOutline() {
      let list = []
      this.$editor.$('h1,h2,h3,h4,h5,h6').each((index, el)=>{
        let nodeId = el.getAttribute("ti-outline-id")
        if(!nodeId) {
          nodeId = Ti.Random.str(12)
          el.setAttribute("ti-outline-id", nodeId)
        }

        list.push({
          id : nodeId,
          index,
          name : el.innerText,
          className : el.className,
          tagName : el.tagName,
          attrs : Ti.Dom.attrs(el),
          level : parseInt(el.tagName.substring(1))
        })
      })

      // Groupping to tree
      let tree = {
        id : "@OUTLINE",
        level : 0,
        name : "Document",
        children : []
      }
      let rootHie = Ti.Trees.getById(tree, "@OUTLINE")

      
      if(!_.isEmpty(list)) {
        let hie = rootHie
        for(let i=0; i < list.length; i++) {
          let it = list[i]
          // Join the child
          if(it.level > hie.node.level) {
            hie = Ti.Trees.append(hie, it, {autoChildren:true}).hierarchy
          }
          // add sibling
          else if(it.level == hie.node.level) {
            hie = Ti.Trees.insertAfter(hie, it).hierarchy
          }
          // add parent
          else {
            // Seek to sibling
            while(hie.parent) {
              hie = hie.parent
              if(it.level >= hie.node.level) {
                break;
              }
            }
            hie = Ti.Trees.insertAfter(hie, it).hierarchy
          }
        }
      }
      //console.log(tree)

      // Set
      this.myOutlineTree = tree
    },
    //-----------------------------------------------
    scrollIntoView(selector) {
      let $ta;
      if(_.isElement(selector)) {
        $ta = selector
      } else {
        let q = this.$editor.$(selector).first()
        if(q.length > 0) {
          $ta = q[0]
        }
      }
      if(!$ta)
        return

      let $view = Ti.Dom.ownerWindow($ta)
      let r_view = Ti.Rects.createBy($view)
      let r_targ = Ti.Rects.createBy($ta)

      // test it need to scroll or not
      if(!r_view.contains(r_targ)) {
        $view.scroll({
          top: r_targ.top + $view.scrollY, 
          behavior:"smooth"
        })
      }
      // console.log("r_view: " + r_view)
      // console.log("r_targ: " + r_targ)
    },
    //-----------------------------------------------
    async initEditor() {
      // Guard
      if(this.$editor) 
        return
      // Prepare the configuration
      const conf = {
        target: this.$refs.editor,
        ... this.TheTinyEditor,
        icons : "ti_tiny_icon_pack",
        language: this.TheLang,
        readonly : this.readonly,
        placeholder: Ti.I18n.text(this.placeholder),
        formats : {
          underline : {inline: 'u'}
        },
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
            blocks: {
              icon: 'align-justify',
              tooltip: 'alignment',
              items: 'alignleft aligncenter alignright alignjustify | indent outdent',
            },
        },
        setup : (editor)=>{
          editor.__rich_tinymce_com = this
          // Event: change
          editor.on("Change", (evt)=>{
            //console.log("Change ", evt)
            this.myHtmlCode = editor.getContent()
          })
          // Event: get outline
          editor.on("input", (evt)=>{
            // console.log("input!!", evt)
            let $node = editor.selection.getNode()
            let $h = Ti.Dom.closestByTagName($node, /^H[1-6]$/)
            if($h) {
              this.OnHeadingChange($h)
            }
          })
          // Event: watch the command to update
          editor.on("ExecCommand", (evt)=>{
            // console.log("command fired!!", evt)
            this.myHtmlCode = editor.getContent()
            this.evalOutline()
          })
          editor.on("SelectionChange", (evt)=>{
            //console.log("SelectionChange ", evt)
            this.evalCurrentHeading()
          })
          editor.on('init', ()=>{
            let $html = editor.$('html')[0]
            let $win = Ti.Dom.ownerWindow($html)
            Ti.Dom.watchAutoRootFontSize({
              phoneMaxWidth:640,
              tabletMaxWidth:900,
              designWidth:1200,
              max:100,min:70,
            }, ({$root, mode, fontSize})=>{
              $root.style.fontSize = fontSize + "px"
              $root.setAttribute("as", mode)
            }, $win)
          })
          //
          // Shortcute
          //
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
      // Extends valid element
      let {extended_valid_elements} = conf 

      conf.extended_valid_elements = _.concat(
        extended_valid_elements, 
        'img[ti-*|wn-obj-*|src|width|height|style|class]',
        'div[ti-*|wn-*|style|class]',
        'span[ti-*|wn-*|style|class]'
      ).join(",")
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

        // Then generate the outline
        this.evalOutline()
      }
      //.............................................
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "myHtmlCode" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal) && !_.isEqual(newVal, this.value)) {
        //console.log("myHtmlCode", {newVal, oldVal})
        this.$notify("change", newVal);
      }
    },
    "myOutlineTree" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.$notify("outline:change", this.myOutlineTree)
      }
    },
    "myCurrentHeadingId" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.$notify("current:heading", newVal)
      }
    },
    "value" : function(newVal, oldVal) {
      // Guard
      if(!this.$editor) {
        return
      }
      //console.log("value", {newVal, oldVal})
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