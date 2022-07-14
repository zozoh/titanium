const DFT_PVG = 5;
export default {
  //////////////////////////////////////////
  data: () => ({
    myPrivilegeData: [],
    pvg_owner: 7,
    pvg_member: 5,
    //
    // Account
    //
    myAccountHome: null,
    myAccounts: [],
    myAccountIdMap: {},
    myAccountNmMap: {},
    //
    // Roles
    //
    myRoleHome: null,
    myRoles: [],
    myRoleMap: {},
    //
    // Organization
    //
    myOrganization: null,
    myOrganizationMap: {},
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
    },
    "loadSite": {
      type: [Object, String],
      default: 'domain site -cqn -keys "^(id|nm|ph|title)$"'
    },
    // "organization": {
    //   type: String
    // }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    hasAccounts() { return !_.isEmpty(this.myAccounts) },
    hasRoles() { return !_.isEmpty(this.myRoles) },
    //--------------------------------------
    GuiLoadingAs() {
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
      if (!_.isEmpty(this.myRoles)) {
        if (items.length > 0) {
          items.push({ type: "line" })
        }
        items.push({
          icon: "fas-ribbon",
          text: "i18n:role-add",
          action: () => { this.OnAddRoles() }
        })
      }
      //
      // Organization
      //
      if (!_.isEmpty(this.myOrganization)) {
        if (items.length > 0) {
          items.push({ type: "line" })
        }
        items.push({
          icon: "fas-briefcase",
          text: "i18n:dept-add",
          action: () => { this.OnAddDepts() }
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
            className: "pad-hs",
            items: this.ActionItems
          }
        },
        list: {
          comType: "WnList",
          comConf: {
            dftLabelHoverCopy: false,
            checkable: true,
            multi: true,
            data: this.myPrivilegeData,
            idBy: "key",
            display: [
              "@<thumb:zmdi-account>",
              "text::flex-none",
              "key::flex-auto as-tip",
              "tip::as-tip-block"
            ],
            onInit: ($list) => {
              this.$list = $list
            }
          }
        },
        data: {
          comType: "TiForm",
          comConf: {
            spacing: "comfy",
            data: this.CurrentItem,
            autoShowBlank: true,
            fieldNameWrap: "nowrap",
            gridColumnHint: 1,
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
      let val = _.cloneDeep(this.value) || {}
      let md = this.pvg_owner << 6 | this.pvg_member << 3 | m0
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
        comType: "WnList",
        comConf: {
          multi: true,
          checkable: true,
          idBy: "nm",
          data: accounts,
          display: [
            "@<thumb:zmdi-account>",
            "nickname",
            "nm::as-tip-block"
          ]
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
      let val = _.cloneDeep(this.value) || {}
      for (let id of checkeds) {
        val[`@[${id}]`] = DFT_PVG
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
      let val = _.cloneDeep(this.value) || {}
      for (let nm of checkeds) {
        val[`@${nm}`] = DFT_PVG
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnAddDepts() {
      let reo = await Ti.App.Open({
        icon: "fas-briefcase",
        title: "i18n:dept-add",
        position: "top",
        width: "6.4rem",
        height: "96%",
        model: { event: "select" },
        comType: "TiTree",
        comConf: {
          data: this.myOrganization,
          display: [
            "<icon>",
            "title|text|name|nm|abbr",
            "value|id|nm::as-tip-block align-right"
          ],
          multi: true,
          checkable: true,
          defaultOpenDepth: 100
        }
      })

      // User cancel
      if (!reo)
        return

      //console.log(reo)

      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if (_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value) || {}
      for (let id of checkeds) {
        val[`+${id}`] = DFT_PVG
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
    buildMap(list = [], key = "id", childKey = "children") {
      let re = {}
      if (_.isArray(list)) {
        _.forEach(list, li => {
          if (!li)
            return
          let k = li[key]
          if (k) {
            re[k] = li
          }
        })
      }
      // Tree
      else {
        const fn = function (node) {
          let it = _.omit(node, childKey)
          if (_.isEmpty(it)) {
            return
          }
          let id = it[key]
          if (id) {
            re[id] = it
          }
          let children = node[childKey];
          if (!_.isEmpty(children)) {
            for (let child of children) {
              fn(child)
            }
          }
        }
        fn(list)
      }
      return re
    },
    //--------------------------------------
    async evalPrivilegeData() {
      //console.log("evalPrivilegeData")
      let pvgData = []
      _.forEach(this.value, (md, id) => {
        pvgData.push({ md, id })
      })


      let list = []
      for (let pvgIt of pvgData) {
        let { md, id } = pvgIt
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
        // Organization
        m = /^\+(.+)$/.exec(id)
        if (m) {
          let deptId = m[1]
          let dept = this.myOrganizationMap[deptId];
          if (dept) {
            list.push({
              type: "dept",
              icon: dept.icon || 'fas-briefcase',
              text: dept.name || dept.title || dept.text,
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
        // Role || Account Name
        m = /^@((\[([^[\]]+)\])|([^[\]]+))$/.exec(id)
        if (m) {
          let accountName = m[3]
          let roleName = m[4]
          // Account Name
          if (accountName) {
            let user = _.get(this.myAccountNmMap, accountName)
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
            }
            // Default account name
            else {
              list.push({
                type: "account",
                icon: 'zmdi-account',
                text: accountName,
                key: id,
                tip,
                ...other
              })
            }
          }
          // Role
          else if (roleName) {
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
            }
            // Default as role
            else {
              list.push({
                type: "role",
                icon: 'far-smile',
                text: roleName,
                key: id,
                tip,
                ...other
              })
            }
          }
          // Impossiable
          else {
            throw "Impossible role/accountName match: " + id
          }
          continue;
        }
        //
        // Account
        let user = _.get(this.myAccountIdMap, id)
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
    async reload() {
      this.loading = true
      let site = {}
      let cmdText;
      // Already loaded
      if (_.isObject(this.loadSite)) {
        site = _.cloneDeep(this.loadSite)
      }
      // Dynamic load
      else if (this.loadSite && _.isString(this.loadSite)) {
        cmdText = this.loadSite
        site = await Wn.Sys.exec2(cmdText, { as: "json" })
      }
      //console.log(site)

      // Reload accountHome and roleHome
      this.myAccountHome = _.get(site, "accountHome")
      this.myRoleHome = _.get(site, "roleHome")
      this.myOrganization = _.get(site, "organization")
      this.pvg_owner = _.get(site, "pvgOwner")
      this.pvg_member = _.get(site, "pvgMember")

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
        cmdText = `thing id:${this.myRoleHome.id} query -sort 'sort:1' -cqn -e '${km}'`
        this.myRoles = await Wn.Sys.exec2(cmdText, { as: "json" })
      } else {
        this.myRoles = []
      }

      // Build map
      this.myAccountIdMap = this.buildMap(this.myAccounts, "id")
      this.myAccountNmMap = this.buildMap(this.myAccounts, "nm")
      this.myRoleMap = this.buildMap(this.myRoles, "nm")
      this.myOrganizationMap = this.buildMap(this.myOrganization, "id")

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