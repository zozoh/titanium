export default {
  name : "ti-heading",
  setup : function(editor, url){
    console.log("plugin:heading", editor, url)

    // Heading data
    let headingItems = [{
      title: "H1",
      selector: "h1",
      command: ['FormatBlock', false, 'h1']
    }, {
      title: "H2",
      selector: "h2",
      command: ['FormatBlock', false, 'h2']
    }, {
      title: "H3",
      selector: "h3",
      command: ['FormatBlock', false, 'h3']
    }]

    // Register toolbar actions
    editor.ui.registry.addMenuButton("TiHeading", {
      text: "i18n:heading",
      fetch(callback) {
        let items = []
        for(let hi of headingItems) {
          let {title, selector, command} = hi || {} 
          items.push({
            type : 'togglemenuitem',
            text : title,
            onAction() {
              editor.execCommand(...command)
            }, // ~ onAction()
            onSetup(menuItem) {
              let el = editor.selection.getNode()
              let on = Ti.Dom.is(el, selector)
              menuItem.setActive(on)
              return function(){}
            }
          })
        }
        callback(items)
      },
      onAction(menuBtn) {
        console.log(menuBtn)
      },
      onSetup(menuBtn) {
        console.log(menuBtn)
        const callback = function({element}={}) {
          console.log("OnMenuBtnCallback", element, menuBtn)
        }
        editor.on('NodeChange', callback);
        return function(){
          editor.off('NodeChange', callback);
        }
      }
    })

    return {
      getMetadata: function () {
        return  {
          name: 'Ti Heading plugin',
          url: 'http://site.cn'
        };
      }
    };
  }
}