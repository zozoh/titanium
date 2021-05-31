export default {
  //////////////////////////////////////////
  data: () => ({
    myPrivilegeData: [],
    //
    // Account
    //
    myAccountHome: null,
    myAccounts: [],
    myAccountMap: {},
    //
    // Roles
    //
    myRoleHome: null,
    myRoles: [],
    myRoleMap: {},
    //
    // Companies
    //
    myCompanyBy: null,
    myCompanies: [],
    myCompanyMap: {},
    //
    // Departments
    //
    myDeptBy: null,
    myDeptCache: {}, /*{$ComId: {children:[Department]}}*/
    myDeptMap: {},  /*{$ComId: {deptId: Department, ...}}*/
    //
    // Projects
    //
    myProjectBy: null,
    myProjects: [],
    myProjectMap: {},
    //
    // Status
    //
    myCurrentId: null,
    loading: false
  }),
  //////////////////////////////////////////
  props: {
    "value": {
      type: Object,
      default: () => ({})
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    hasAccounts() { return !_.isEmpty(this.myAccounts) },
    hasRoles() { return !_.isEmpty(this.myRoles) },
    //--------------------------------------
    TheLoadingAs() {
      if (this.loading)
        return true

      if (!this.hasAccounts)
        return {
          text: "i18n:empty",
          icon: "fas-border-none"
        }
    },
    //--------------------------------------
    ActionItems() {
      let items = []
      if (!_.isEmpty(this.myAccounts)) {
        items.push({
          icon: "fas-user-plus",
          text: "i18n:account-add",
          action: () => { this.OnAddAccounts() }
        })
      }
      //
      // Roles
      //
      if (items.length > 0) {
        items.push({ type: "line" })
      }
      if (!_.isEmpty(this.myRoles)) {
        items.push({
          icon: "fas-ribbon",
          text: "i18n:role-add",
          action: () => { this.OnAddRoles() }
        })
      }
      //
      // Companies
      //
      if (items.length > 0) {
        items.push({ type: "line" })
      }
      if (!_.isEmpty(this.myCompanies)) {
        items.push({
          icon: "fas-building",
          text: "i18n:org-add",
          action: () => { this.OnAddCompanies() }
        })
        // Begin Departments
        if (items.length > 0) {
          items.push({ type: "line" })
        }
        if (!_.isEmpty(this.myDeptBy)) {
          items.push({
            icon: "fas-briefcase",
            text: "i18n:dept-add",
            action: () => { this.OnAddDepts() }
          })
        }
        // End Departments
      }
      //
      // Projects
      //
      if (items.length > 0) {
        items.push({ type: "line" })
      }
      if (!_.isEmpty(this.myProjects)) {
        items.push({
          icon: "fas-chess-queen",
          text: "i18n:project-add",
          action: () => { this.OnAddProjects() }
        })
      }

      //
      // Delete
      //
      items.push({
        type: "line"
      }, {
        icon: "far-trash-alt",
        text: "i18n:del-checked",
        action: () => { this.OnRemoveSelected() }
      })

      return items;
    },
    //--------------------------------------
    Layout() {
      return {
        type: "rows",
        border: true,
        defaultFlex: "both",
        blocks: [{
          size: 42,
          body: "actions"
        }, {
          type: "cols",
          border: true,
          blocks: [{
            name: "list",
            body: "list"
          }, {
            name: "data",
            body: "data"
          }]
        }]
      }
    },
    //--------------------------------------
    Schema() {
      return {
        actions: {
          comType: "TiActionbar",
          comConf: {
            items: this.ActionItems
          }
        },
        list: {
          comType: "TiList",
          comConf: {
            checkable: true,
            multi: true,
            data: this.myPrivilegeData,
            idBy: "key",
            display: [
              "<icon>", "text", "tip::as-tip-block"
            ],
            onInit: ($list) => {
              this.$list = $list
            }
          }
        },
        data: {
          comType: "TiForm",
          comConf: {
            spacing: "tiny",
            data: this.CurrentItem,
            autoShowBlank: true,
            blankAs: {
              text: "i18n:blank-to-edit",
              icon: "fas-arrow-left"
            },
            fields: [{
              title: "i18n:type",
              name: "type"
            }, {
              title: "i18n:name",
              name: "text"
            }, {
              title: "i18n:key",
              name: "key",
              comConf: {
                className: "is-nowrap",
                fullField: false
              }
            }, {
              title: "i18n:wn-md-readable",
              name: "readable",
              type: "Boolean",
              comType: "TiToggle"
            }, {
              title: "i18n:wn-md-writable",
              name: "writable",
              type: "Boolean",
              comType: "TiToggle"
            }, {
              title: "i18n:wn-md-excutable",
              name: "excutable",
              type: "Boolean",
              comType: "TiToggle"
            }]
          }
        }
      }
    },
    //--------------------------------------
    CurrentItem() {
      for (let it of this.myPrivilegeData) {
        if (this.myCurrentId == it.key) {
          return it
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnListSelect({ currentId }) {
      this.myCurrentId = currentId
    },
    //--------------------------------------
    OnDataChange(data) {
      let key = data.key
      let m0 = Wn.Obj.mode0FromObj(data)
      let md = (m0 << 6) | (m0 << 3) | (m0)
      let val = _.cloneDeep(this.value)
      val[key] = md
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnAddAccounts() {
      let accounts = _.filter(this.myAccounts, acc => {
        let md = _.get(this.value, acc.id)
        return _.isUndefined(md)
      })

      let reo = await Ti.App.Open({
        icon: "fas-user-plus",
        title: "i18n:account-add",
        position: "top",
        width: 480,
        height: "90%",
        model: { prop: "value", event: "select" },
        comType: "TiList",
        comConf: {
          multi: true,
          checkable: true,
          data: accounts,
          display: ["<icon:zmdi-account>", "nickname", "nm::as-tip-block"]
        }
      })

      // User cancel
      if (!reo)
        return

      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if (_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value)
      for (let id of checkeds) {
        val[id] = 508
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnAddRoles() {
      let roles = _.filter(this.myRoles, role => {
        let md = _.get(this.value, `@${role.nm}`)
        return _.isUndefined(md)
      })

      let reo = await Ti.App.Open({
        icon: "fas-user-plus",
        title: "i18n:roles-add",
        position: "top",
        width: 480,
        height: "90%",
        model: { prop: "value", event: "select" },
        comType: "TiList",
        comConf: {
          multi: true,
          checkable: true,
          idBy: "nm",
          data: roles,
          display: ["<icon:far-smile>", "title|th_nm", "nm::as-tip-block"]
        }
      })

      // User cancel
      if (!reo)
        return

      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if (_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value)
      for (let nm of checkeds) {
        val[`@${nm}`] = 508
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnAddCompanies() {
      let companies = _.filter(this.myCompanies, com => {
        let md = _.get(this.value, `org:${com.id}`)
        return _.isUndefined(md)
      })

      let reo = await Ti.App.Open({
        icon: "fas-building",
        title: "i18n:org-add",
        position: "top",
        width: 480,
        height: "90%",
        model: { prop: "value", event: "select" },
        comType: "WnList",
        comConf: {
          multi: true,
          checkable: true,
          idBy: "id",
          data: companies,
          display: ["@<thumb>", "title|nm", "id::as-tip-block"]
        }
      })

      // User cancel
      if (!reo)
        return

      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if (_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value)
      for (let id of checkeds) {
        val[`org:${id}`] = 508
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnAddDepts() {
      // Choose one company
      let reo = await Ti.App.Open({
        icon: "fas-building",
        title: "i18n:org-choose",
        position: "top",
        width: 480,
        height: "65%",
        model: { prop: "value", event: "select" },
        comType: "WnList",
        comConf: {
          multi: false,
          checkable: false,
          idBy: "id",
          data: this.myCompanies,
          display: ["@<thumb>", "title|nm", "id::as-tip-block"]
        }
      })
      let com = _.get(reo, "current")

      // User canceled
      if(!com) {
        return
      }

      // Prepare the commands
      let depts = await this.reloadDepartments(com)

      reo = await Ti.App.Open({
        icon: "fas-briefcase",
        title: "i18n:dept-add",
        position: "top",
        width: 480,
        height: "90%",
        model: { prop: "value", event: "select" },
        comType: "TiTree",
        comConf: {
          multi: true,
          checkable: true,
          autoOpen: true,
          defaultOpenDepth: 100,
          showRoot: false,
          data: depts,
          display: [
            "@<icon>", "name::flex-auto", "id::as-tip-block align-right"]
        }
      })

      // User cancel
      if (!reo)
        return

      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if (_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value)
      for (let id of checkeds) {
        val[`dept:${com.id}>${id}`] = 508
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnAddProjects() {
      let projects = _.filter(this.myProjects, proj => {
        let md = _.get(this.value, `prj:${proj.id}`)
        return _.isUndefined(md)
      })

      let reo = await Ti.App.Open({
        icon: "fas-chess-queen",
        title: "i18n:project-add",
        position: "top",
        width: 480,
        height: "90%",
        model: { prop: "value", event: "select" },
        comType: "WnList",
        comConf: {
          multi: true,
          checkable: true,
          idBy: "id",
          data: projects,
          display: ["@<thumb>", "title|nm", "id::as-tip-block"]
        }
      })

      // User cancel
      if (!reo)
        return

      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if (_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value)
      for (let id of checkeds) {
        val[`prj:${id}`] = 508
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    OnRemoveSelected() {
      let checked = this.$list.getChecked()
      if (_.isEmpty(checked)) {
        Ti.Toast.Open("i18n:nil-obj", "warn")
        return
      }
      // Build key map
      let keyMap = {}
      _.forEach(checked, it => {
        keyMap[it.key] = true
      })

      // Remove from value
      let val = {}
      _.forEach(this.value, (md, key) => {
        if (!keyMap[key]) {
          val[key] = md
        }
      })

      this.$notify("change", val)
    },
    //--------------------------------------
    buildMap(list = [], key = "id") {
      let re = {}
      _.forEach(list, li => {
        if (!li)
          return
        let k = li[key]
        if (k) {
          re[k] = li
        }
      })
      return re
    },
    //--------------------------------------
    async evalPrivilegeData() {
      let pvgData = []
      _.forEach(this.value, (md, id) => {
        pvgData.push({md, id})
      })


      let list = []
      for(let pvgIt of pvgData) {
        let {md, id} = pvgIt
        //console.log("pvg data", { md, id })
        let { other } = Wn.Obj.parseMode(md)
        //
        // Tip to indicate the RWX
        //
        let tips = []
        if (other.readable)
          tips.push(Ti.I18n.get("wn-md-R"))
        if (other.writable)
          tips.push(Ti.I18n.get("wn-md-W"))
        if (other.excutable)
          tips.push(Ti.I18n.get("wn-md-X"))
        let tip = tips.join("") || Ti.I18n.get("nil");
        //
        // Company | Organization
        let m = /^org:(.+)$/.exec(id)
        if (m) {
          let comId = m[1]
          let com = _.get(this.myCompanyMap, comId)
          if (com) {
            list.push({
              type: "org",
              icon: Wn.Util.getObjThumbIcon2(com, 'fas-building'),
              text: com.title || com.nm,
              key: id,
              tip,
              ...other
            })
          } else {
            list.push({
              type: "org",
              icon: 'fas-building',
              text: comId,
              key: id,
              tip,
              ...other
            })
          }
          continue;
        }
        //
        // Department
        m = /^dept:([^>]+)>(.+)$/.exec(id)
        console.log(m)
        if(m) {
          let comId = m[1]
          let deptId = m[2]
          let com = this.myCompanyMap[comId]
          let dept;
          if(com) {
            await this.reloadDepartments(com)
            dept = _.get(this.myDeptMap, `${comId}.${deptId}`)
          }
          if(com && dept) {
            list.push({
              type: "dept",
              icon: Wn.Util.getObjThumbIcon2(dept, 'fas-briefcase'),
              text: `${com.title||com.nm} > ${dept.name||dept.title||dept.text||dept.nm}`,
              key: id,
              tip,
              ...other
            })
          } else {
            list.push({
              type: "dept",
              icon: 'fas-briefcase',
              text: deptId,
              key: id,
              tip,
              ...other
            })
          }
          continue;
        }
        //
        // Projects
        m = /^prj:(.+)$/.exec(id)
        if (m) {
          let projId = m[1]
          let proj = _.get(this.myProjectMap, projId)
          if (proj) {
            list.push({
              type: "proj",
              icon: Wn.Util.getObjThumbIcon2(proj, 'fas-chess-queen'),
              text: proj.title || proj.nm,
              key: id,
              tip,
              ...other
            })
          } else {
            list.push({
              type: "org",
              icon: 'fas-building',
              text: projId,
              key: id,
              tip,
              ...other
            })
          }
          continue;
        }
        // Role
        m = /^@(.+)$/.exec(id)
        if (m) {
          let roleName = m[1]
          let role = _.get(this.myRoleMap, roleName)
          if (role) {
            list.push({
              type: "role",
              icon: role.icon || 'far-smile',
              text: role.title || role.nm,
              key: id,
              tip,
              ...other
            })
          } else {
            list.push({
              type: "role",
              icon: 'far-smile',
              text: roleName,
              key: id,
              tip,
              ...other
            })
          }
          continue;
        }
        //
        // Account
        let user = _.get(this.myAccountMap, id)
        if (user) {
          list.push({
            type: "account",
            icon: user.icon || 'zmdi-account',
            thumb: user.thumb,
            text: user.nickname || user.nm,
            key: id,
            tip,
            ...other
          })
        } else {
          list.push({
            type: "account",
            icon: 'zmdi-account',
            text: id,
            key: id,
            tip,
            ...other
          })
        }
      }
      // Update to state
      this.myPrivilegeData = list
    },
    //--------------------------------------
    async reloadDepartments(com) {
      let comId = com.id
      let deptRoot = _.get(this.myDeptCache, comId)
      if(_.isEmpty(deptRoot)) {
        let cmdText = Ti.S.renderBy(this.myDeptBy, com)
        deptRoot = await Wn.Sys.exec2(cmdText, {as:"json"})
        this.myDeptCache[comId] = deptRoot
        // Build Map
        let deptMap = {}
        Ti.Trees.walkDeep(deptRoot, ({id,node})=>{
          //console.log("dept", id, node)
          deptMap[id] = node
        })
        this.myDeptMap[comId] = deptMap
      }
      return deptRoot
    },
    //--------------------------------------
    async reload() {
      this.loading = true
      // Reload accountHome and roleHome
      let cmdText = 'domain site -cqn -keys "^(id|nm|ph|title)$"'
      let site = await Wn.Sys.exec2(cmdText, { as: "json" })
      this.myAccountHome = _.get(site, "accountHome")
      this.myRoleHome = _.get(site, "roleHome")
      this.myCompanyBy = _.get(site, "companyBy")
      this.myDeptBy = _.get(site, "deptBy")
      this.myProjectBy = _.get(site, "projectBy")

      // Reload Accounts
      let km = '^(id|nm|title|nickname|icon|thumb)$';
      if (this.myAccountHome) {
        cmdText = `thing id:${this.myAccountHome.id} query -cqn -e '${km}'`
        this.myAccounts = await Wn.Sys.exec2(cmdText, { as: "json" })
      } else {
        this.myAccounts = []
      }

      // Reload Roles
      if (this.myRoleHome) {
        cmdText = `thing id:${this.myRoleHome.id} query -cqn -e '${km}'`
        this.myRoles = await Wn.Sys.exec2(cmdText, { as: "json" })
      } else {
        this.myRoles = []
      }

      // Reload companies
      if (this.myCompanyBy) {
        cmdText = this.myCompanyBy
        this.myCompanies = await Wn.Sys.exec2(cmdText, { as: "json" })
      } else {
        this.myCompanies = []
      }

      // Reload projects
      if (this.myProjectBy) {
        cmdText = this.myProjectBy
        this.myProjects = await Wn.Sys.exec2(cmdText, { as: "json" })
      } else {
        this.myProjects = []
      }

      // Build map
      this.myAccountMap = this.buildMap(this.myAccounts, "id")
      this.myRoleMap = this.buildMap(this.myRoles, "nm")
      this.myCompanyMap = this.buildMap(this.myCompanies, "id")
      this.myProjectMap = this.buildMap(this.myProjects, "id")

      // Eval data
      await this.evalPrivilegeData()

      this.loading = false
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "value": "evalPrivilegeData"
  },
  //////////////////////////////////////////
  mounted: function () {
    this.reload()
  }
  //////////////////////////////////////////
}