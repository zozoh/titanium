export default {
  //////////////////////////////////////////
  data : ()=>({
    myAccountHome : null,
    myRoleHome : null,
    myAccounts : [],
    myRoles : [],
    myAccountMap : {},
    myRoleMap : {},
    myCurrentId : null,
    loading : false
  }),
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    hasAccounts()  {return !_.isEmpty(this.myAccounts)},
    hasRoles()  {return !_.isEmpty(this.myRoles)},
    //--------------------------------------
    TheLoadingAs() {
      if(this.loading)
        return true

      if(!this.hasAccounts)
        return {
          text : "i18n:empty",
          icon : "fas-border-none"
        }
    },
    //--------------------------------------
    ActionItems() {
      return [{
        icon : "fas-user-plus",
        text : "i18n:account-add",
        action : ()=>{this.OnAddAccounts()}
      }, {
        type : "line"
      }, {
        icon : "fas-ribbon",
        text : "i18n:role-add",
        action : ()=>{this.OnAddRoles()}
      }, {
        type : "line"
      }, {
        icon : "far-trash-alt",
        text : "i18n:del-checked",
        action : ()=>{this.OnRemoveSelected()}
      }]
    },
    //--------------------------------------
    Layout() {
      return {
        type : "rows",
        border : true,
        defaultFlex : "both",
        blocks : [{
            size : 42,
            body : "actions"
          }, {
            type : "cols",
            border : true,
            blocks : [{
              name : "list",
              body : "list"
            }, {
              name : "data",
              body : "data"
            }]
          }]
      }
    },
    //--------------------------------------
    Schema() {
      return {
        actions : {
          comType : "TiActionbar",
          comConf : {
            items : this.ActionItems
          }
        },
        list : {
          comType : "TiList",
          comConf : {
            checkable : true,
            multi : true,
            data : this.PrivilegeData,
            idBy : "key",
            display : [
              "<icon>", "text", "tip::as-tip-block"
            ],
            onInit : ($list)=>{
              this.$list = $list
            }
          }
        },
        data : {
          comType : "TiForm",
          comConf : {
            spacing : "tiny",
            data : this.CurrentItem,
            autoShowBlank : true,
            blankAs : {
              text : "i18n:blank-to-edit",
              icon : "fas-arrow-left"
            },
            fields : [{
              title : "i18n:type",
              name : "type"
            }, {
              title : "i18n:name",
              name : "text"
            }, {
              title : "i18n:key",
              name : "key"
            }, {
              title : "i18n:wn-md-readable",
              name : "readable",
              type : "Boolean",
              comType : "TiToggle"
            }, {
              title : "i18n:wn-md-writable",
              name : "writable",
              type : "Boolean",
              comType : "TiToggle"
            }, {
              title : "i18n:wn-md-excutable",
              name : "excutable",
              type : "Boolean",
              comType : "TiToggle"
            }]
          }
        }
      }
    },
    //--------------------------------------
    PrivilegeData() {
      let list = []
      _.forEach(this.value, (md, id)=>{
        let {other} = Wn.Obj.parseMode(md)
        let tips = []
        if(other.readable)
          tips.push(Ti.I18n.get("wn-md-R"))
        if(other.writable)
          tips.push(Ti.I18n.get("wn-md-W"))
        if(other.excutable)
          tips.push(Ti.I18n.get("wn-md-X"))
        let tip = tips.join("") || Ti.I18n.get("nil");
        // Role
        if(/^@/.test(id)) {
          let roleName = id.substring(1)
          let role = _.get(this.myRoleMap, roleName)
          if(role) {
            list.push({
              type  : "role",
              icon  : role.icon || 'far-smile',
              text  : role.title || role.nm,
              key  : id,
              tip, 
              ... other
            })
          } else {
            list.push({
              type  : "role",
              icon  : 'far-smile',
              text  : roleName,
              key  : id,
              tip,
              ... other
            })
          }
        }
        // Account
        else {
          let user = _.get(this.myAccountMap, id)
          if(user) {
            list.push({
              type  : "account",
              icon  : user.icon || 'zmdi-account',
              thumb : user.thumb,
              text  : user.nickname || user.nm,
              key  : id,
              tip,
              ... other
            })
          } else {
            list.push({
              type  : "account",
              icon  : 'zmdi-account',
              text  : id,
              key  : id,
              tip,
              ... other
            })
          }
        }
      })
      return list
    },
    //--------------------------------------
    CurrentItem() {
      for(let it of this.PrivilegeData) {
        if(this.myCurrentId == it.key) {
          return it
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnListSelect({currentId}) {
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
      let accounts = _.filter(this.myAccounts, acc=>{
        let md = _.get(this.value, acc.id)
        return _.isUndefined(md)
      })

      let reo = await Ti.App.Open({
        icon : "fas-user-plus",
        title : "i18n:account-add",
        position : "top",
        width : 480,
        height : "90%",
        model : {prop:"value", event:"select"},
        comType : "TiList",
        comConf : {
          multi : true,
          checkable : true,
          data : accounts,
          display : ["<icon:zmdi-account>", "nickname", "nm::as-tip-block"]
        }
      })

      // User cancel
      if(!reo)
        return
      
      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if(_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value)
      for(let id of checkeds) {
        val[id] = 508
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    async OnAddRoles() {
      let roles = _.filter(this.myRoles, role=>{
        let md = _.get(this.value, `@${role.nm}`)
        return _.isUndefined(md)
      })

      let reo = await Ti.App.Open({
        icon : "fas-user-plus",
        title : "i18n:account-add",
        position : "top",
        width : 480,
        height : "90%",
        model : {prop:"value", event:"select"},
        comType : "TiList",
        comConf : {
          multi : true,
          checkable : true,
          idBy : "nm",
          data : roles,
          display : ["<icon:far-smile>", "title", "nm::as-tip-block"]
        }
      })

      // User cancel
      if(!reo)
        return
      
      // Nothing selected
      let checkeds = Ti.Util.truthyKeys(reo.checkedIds)
      if(_.isEmpty(checkeds)) {
        return
      }

      // Update value
      let val = _.cloneDeep(this.value)
      for(let nm of checkeds) {
        val[`@${nm}`] = 508
      }
      this.$notify("change", val)
    },
    //--------------------------------------
    OnRemoveSelected() {
      let checked = this.$list.getChecked()
      if(_.isEmpty(checked)) {
        Ti.Toast.Open("i18n:nil-obj", "warn")
        return
      }
      // Build key map
      let keyMap = {}
      _.forEach(checked, it=>{
        keyMap[it.key] = true
      })

      // Remove from value
      let val = {}
      _.forEach(this.value, (md, key)=>{
          if(!keyMap[key]) {
            val[key] = md
          }
      })
      
      this.$notify("change", val)
    },
    //--------------------------------------
    buildMap(list=[], key="id") {
      let re = {}
      _.forEach(list, li=>{
        if(!li)
          return
        let k = li[key]
        if(k) {
          re[k] = li
        }
      })
      return re
    },
    //--------------------------------------
    async reload() {
      this.loading = true
      // Reload accountHome and roleHome
      let cmdText = 'domain site -cqn -keys "^(id|nm|ph|title)$"'
      let site = await Wn.Sys.exec2(cmdText, {as:"json"})
      this.myAccountHome = _.get(site, "accountHome")
      this.myRoleHome = _.get(site, "roleHome")

      // Reload Accounts
      let km = '^(id|nm|title|nickname|icon|thumb)$';
      if(this.myAccountHome) {
        cmdText = `thing id:${this.myAccountHome.id} query -cqn -e '${km}'`
        this.myAccounts = await Wn.Sys.exec2(cmdText, {as:"json"})
      } else {
        this.myAccounts = []
      }

      // Reload Roles
      if(this.myRoleHome) {
        cmdText = `thing id:${this.myRoleHome.id} query -cqn -e '${km}'`
        this.myRoles = await Wn.Sys.exec2(cmdText, {as:"json"})
      } else {
        this.myRoles = []
      }

      // Build map
      this.myAccountMap = this.buildMap(this.myAccounts, "id")
      this.myRoleMap = this.buildMap(this.myRoles, "nm")

      this.loading = false
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted : function() {
    this.reload()    
  }
  //////////////////////////////////////////
}