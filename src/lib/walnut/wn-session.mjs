////////////////////////////////////////////
const PVGS = {}
const ENVS = {}
const SESSION = {}
////////////////////////////////////////////
const WnSession = {
  //----------------------------------------
  setup({
    id, uid, unm, me, grp,
    by_tp, by_val, envs = {}
  } = {}) {
    _.assign(SESSION, {
      id, uid, unm, me, grp,
      by_tp, by_val
    })
    WnSession.env(envs)

    Ti.Env("theme", envs.THEME)
  },
  //----------------------------------------
  env(vars) {
    // Set Env
    if (_.isPlainObject(vars)) {
      _.assign(ENVS, vars)
    }
    // GET one
    else if (_.isString(vars)) {
      return ENVS[vars]
    }
    // Pick
    else if (_.isArray(vars)) {
      return _.pick(ENVS, vars)
    }
    // Get Env
    return _.cloneDeep(ENVS)
  },
  //----------------------------------------
  getLang() { return WnSession.env("LANG") },
  //----------------------------------------
  getMyId() { return SESSION.uid },
  getMyName() { return SESSION.unm },
  getMyGroup() { return SESSION.grp },
  getMyJobs() { return SESSION.me.jobs || [] },
  getMyDepts() { return SESSION.me.depts || [] },
  //----------------------------------------
  getByType() { return SESSION.by_tp },
  isByType(type) {
    if (_.isRegExp(type)) {
      return type.test(SESSION.by_tp)
    }
    if (_.isString(type) && type.startsWith("^")) {
      return new RegExp(type).test(SESSION.by_tp)
    }
    return type == SESSION.by_tp
  },
  //----------------------------------------
  getByValue() { return SESSION.by_val },
  isByValue(val) {
    if (_.isRegExp(val)) {
      return val.test(SESSION.by_val)
    }
    if (_.isString(val) && val.startsWith("^")) {
      return new RegExp(val).test(SESSION.by_val)
    }
    return val == SESSION.by_val
  },
  //----------------------------------------
  getMe() {
    return SESSION.me
  },
  //----------------------------------------
  I_am_domain_ADMIN() {
    let rid = _.get(SESSION.me, "roleInDomain")
    return "ADMIN" == rid
  },
  //----------------------------------------
  I_am_domain_MEMBER() {
    let rid = _.get(SESSION.me, "roleInDomain")
    return /^(ADMIN|MEMEBER)$/.test(rid)
  },
  //----------------------------------------
  I_am_op_ADMIN() {
    let rid = _.get(SESSION.me, "roleInOp")
    return "ADMIN" == rid
  },
  //----------------------------------------
  I_am_op_MEMBER() {
    let rid = _.get(SESSION.me, "roleInOp")
    return /^(ADMIN|MEMEBER)$/.test(rid)
  },
  //----------------------------------------
  async loadMyPvg() {
    let pvgs = await Wn.Sys.exec2("www pvg -cqn", { as: "json" })
    _.assign(PVGS, pvgs)
    return PVGS
  },
  //----------------------------------------
  getAllPvgs() {
    return _.cloneDeep(PVGS)
  },
  //----------------------------------------
  isPvgCanOne(...actions) {
    if (PVGS['$SYS_USR'] && /^(admin|memeber)$/.test(SESSION.me.role)) {
      return true
    }
    for (let a of actions) {
      if (PVGS[a]) {
        return true
      }
    }
    return false
  },
  //----------------------------------------
  isPvgCanAll(...actions) {
    if (PVGS['$SYS_USR'] && /^(admin|memeber)$/.test(SESSION.me.role)) {
      return true
    }
    for (let a of actions) {
      if (!PVGS[a]) {
        return false
      }
    }
    return true
  },
  //----------------------------------------
  //          AND
  // pvg: ["A+B+C",...] => or
  isPvgCan(pvg, dft = true) {
    if (_.isEmpty(pvg)) {
      return dft
    }
    let list = _.concat(pvg)
    for (let li of list) {
      let ss = li.split("+")
      ss = _.map(ss, s => _.trim(s))
      if(!WnSession.isPvgCanAll(ss)){
        return false
      }
    }
    return true
  },
  //----------------------------------------
  getHomePath() {
    return WnSession.env("HOME")
  },
  //----------------------------------------
  getCurrentPath(dft = "~") {
    return WnSession.env("PWD") || dft
  },
  //----------------------------------------
  // Analyze the current domain 
  getCurrentDomain() {
    let home = WnSession.getHomePath()
    if (!home) {
      return
    }
    // For root
    if ("/root" == home)
      return "root"

    // Others
    let m = /^\/home\/(.+)$/.exec(home)
    if (m) {
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