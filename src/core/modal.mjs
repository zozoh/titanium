export const TiModal = {
  /***
   * Open a modal dialog to contains a TiApp
   */
  async open(appInfo={}, {
    width  = 640,
    height = 480,
    title = 'i18n:modal',
    close = true,
    beforeClose = _.identity,
    ready = _.identity,
    btns = [{
      text: 'i18n:ok',
      handler : _.identity
    }, {
      text: 'i18n:cancel',
      handler : _.identity
    }]
  }={}) {
    // Create the DOM root

    // setup HTML
    // - title
    // - btns

    // find the body

    // create TiApp

    // Mount to body

    // -> ready

    // await the modal dialog close

    // -> beforeClose

    // return the data
  }
}
//-----------------------------------
export default TiModal
