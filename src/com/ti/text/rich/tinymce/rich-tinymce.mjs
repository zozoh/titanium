const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myHtmlCode : undefined
  }),
  ///////////////////////////////////////////////////
  props : {
    "value" : {
      type : String,
      default : undefined
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass()
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    //-----------------------------------------------
    async initEditor() {
      //.............................................
      await tinymce.init({
        target: this.$refs.editor,
        language: "zh_CN",
        auto_focus: true,
        menubar: true,
        statusbar: true,
        menubar: false,
        toolbar: [
            //'styleselect',
            'heading',
            'bold italic',
            'alignment',
            'blockquote bullist numlist',
            'superscript subscript',
            'copy cut paste removeformat',
            'undo redo'
          ].join(' | '),
        toolbar_groups: {
            heading: {
                icon: 'paragraph',
                tooltip: 'Paragraph format',
                items: 'h1 h2 h3 h4 h5 h6'
            },
            alignment: {
              icon: 'align-left',
              tooltip: 'alignment',
              items: 'alignleft aligncenter alignright alignjustify',
            },
        },
        setup : (editor)=>{
          console.log(editor)
          editor.load(this.$refs.source.value)
          editor.on("Change", (evt)=>{
            console.log("haha ", evt)
            this.myHtmlCode = editor.getContent()
          })
        }
      });
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