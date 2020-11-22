const _M = {
  //.........................................
  Logo() {
    console.log("Logo")
    if("<:home>" == this.setup.logo) {
      let crIt = _.nth(this.CrumbData, 0)
      return crIt ? crIt.icon : null
    }
    // Then it is the static icon
    return this.setup.logo
  },
  //.........................................
  CrumbData() {
    return Wn.Obj.evalCrumbData({
      meta      : this.meta,
      ancestors : this.ancestors,
      fromIndex : this.setup.firstCrumbIndex,
      homePath  : this.setup.skyHomePath,
      self : (item)=>{
        item.asterisk = this.isChanged
      }
    })
  },
  //.........................................
  Crumb() {
    let crumbs = _.cloneDeep(this.CrumbData)
    // Remove the first one for grace look
    if(this.Logo && !_.isEmpty(crumbs)) {
      crumbs[0].icon = null
    }
    return {data: crumbs}
  },
  //.........................................
  SessionBadge() {
    let me = _.get(this.session, "me")
    if(me) {
      return {
        me,
        avatarKey : "thumb",
        avatarSrc : null,
        loginIcon : me.sex == 1 ? "im-user-male" : "im-user-female",
        nameKeys  : "nickname|nm"
      }
    }
  },
  //.........................................
  ActionMenu() {
    if(_.isArray(this.actions) && !_.isEmpty(this.actions)) {
      return {
        className : `wn-${this.viewportMode}-menu`,
        items  : this.actions,
        status : this.TheStatus,
        delay  : 500
      }
    }
  },
  //.........................................
  Arena() {
    if(this.hasView) {
      // explain comConf
      //console.log("re-arena", this.comConf)
      // prepare the vars
      let app = Ti.App(this);
      let comConf = Ti.Util.explainObj(this, this.comConf) || {
        meta    : this.meta,
        content : this.content,
        data    : this.data,
        status  : this.status
      }
      //let actions = this.actions
      // Add init hook to store the $main
      comConf.onInit = function(){
        //console.log("onInit:", this.tiComId)
        app.$vmMain(this)
      }
      // Done
      return comConf
    }
  },
  //.........................................
  Footer() {
    return {
      infoIcon  : this.comIcon,
      infoText  : this.comType,
      message   : this.myMessage || this.StatusText,
      indicator : this.myIndicator
    }
  }
  //.........................................
}
export default _M;