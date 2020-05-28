////////////////////////////////////////////
const ENVS = {}
const SESSION = {}
////////////////////////////////////////////
const WnSession = {
  //----------------------------------------
  setup({id,uid,unm,grp,envs={}}={}) {
    _.assign(SESSION, {id,uid,unm,grp})
    WnSession.env(envs)
  },
  //----------------------------------------
  env(vars) {
    // Set Env
    if(_.isPlainObject(vars)) {
      _.assign(ENVS, vars)
    }
    // GET one
    else if(_.isString(vars)) {
      return ENVS[vars]
    }
    // Pick
    else if(_.isArray(vars)) {
      return _.pick(ENVS, vars)
    }
    // Get Env
    return _.cloneDeep(ENVS)
  },
  //----------------------------------------
  getMyId() {return SESSION.uid},
  getMyName() {return SESSION.unm},
  getMyGroup() {return SESSION.grp},
  //----------------------------------------
  getHomePath() {
    return WnSession.env("HOME")
  },
  //----------------------------------------
  getCurrentPath(dft="~") {
    return WnSession.env("PWD") || dft
  },
  //----------------------------------------
  // Analyze the current domain 
  getCurrentDomain() {
    let home = WnSession.getHomePath()
    if(!home) {
      return
    }
    // For root
    if("/root" == home)
      return "root"
    
    // Others
    let m = /^\/home\/(.+)$/.exec(home)
    if(m) {
      return m[1]
    }
  },
  //----------------------------------------
  getApiPrefix() {
    let dmn = WnSession.getCurrentDomain()
    return `/api/${dmn}`
  },
  //----------------------------------------
  getApiUrl(url) {
    let prefix = WnSession.getApiPrefix()
    return Ti.Util.appendPath(prefix, url)
  }
  //----------------------------------------
}
////////////////////////////////////////////
export default WnSession;