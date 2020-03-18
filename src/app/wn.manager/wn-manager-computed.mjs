const WN_MANAGER_COMPUTED = {
  //.........................................
  Logo() {
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
        nameKeys  : ["nickname", "nm"]
      }
    }
  },
  //.........................................
  ActionMenu() {
    if(_.isArray(this.actions) && !_.isEmpty(this.actions)) {
      return {
        className : `wn-${this.viewportMode}-menu`,
        data   : this.actions,
        status : this.status,
        delay  : 500
      }
    }
  },
  //.........................................
  Arena() {
    if(this.hasView) {
      // explain comConf
      let comConf = Ti.Util.explainObj(this, this.comConf) || {
        meta    : this.meta,
        content : this.content,
        data    : this.data,
        status  : this.status
      }
      // Add init hook to store the $main
      comConf.onInit = function(){
        Ti.App(this).$vmMain(this)
      }
      // Done
      return {
        meta    : this.meta,
        comType : this.comType,
        comConf : comConf
      }
    }
  }
  //.........................................
}
export default WN_MANAGER_COMPUTED;