function showPreivewDialog(html) {
  Ti.App.Open({
    title : "i18n:preview",
    position : "top",
    width  : "95%",
    height : "95%",
    maxWidth : "10rem",
    result : html,
    textOk : null,
    textCancel : null,
    comType : "WebTextArticle",
    comConf : {
      type  : "html",
      theme : "nice"
    },
    components : ["@com:web/text/article"]
  })
}

export default {
  name : "ti-preview",
  setup : function(editor, url){
    // Register toolbar actions
    editor.ui.registry.addButton("TiPreview", {
      text: Ti.I18n.text("i18n:preview"),
      onAction(menuBtn) {
        let html = editor.getContent();
        showPreivewDialog(html)
      },
    })

    return {
      getMetadata: function () {
        return  {
          name: 'Ti Preview plugin',
          url: 'http://site0.cn'
        };
      }
    };
  }
}