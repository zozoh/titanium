export default {
  //----------------------------------------------------
  async resetPasswd() {
    // 获取当前选择账号
    let accounts = this.$store.getters["main/search/checkedItems"]

    // 提示错误
    if (_.isEmpty(accounts)) {
      return await Ti.Toast.Open("i18n:wn-th-acc-pwd-choose-none", "warn")
    }

    // 准备重置密码的提示信息
    let accName = Ti.Util.getOrPick(_.first(accounts), "nickname|nm")
    console.log(accounts, accName)
    let N = accounts.length
    let msgKey = (N == 1)
                  ? "wn-th-acc-pwd-reset-tip-1"
                  : "wn-th-acc-pwd-reset-tip-N";
    let msg = Ti.I18n.getf(msgKey, {
      name: accName,
      N
    })

    // 准备重置密码
    let passwd = await Ti.Prompt(msg, {
      placeholder: "i18n:passwd"
    })
    passwd = _.trim(passwd)

    // 用户选择了放弃
    if (!passwd)
      return

    // 密码过短
    if (passwd.length < 6) {
      return await Ti.Toast.Open("i18n:wn-th-acc-pwd-too-short", "warn")
    }

    // 守卫不安全的字符
    if (/['"*]/.test(passwd)) {
      return await Ti.Toast.Open("i18n:wn-th-acc-pwd-invalid", "warn")
    }

    // 寻找一下本库对应的站点
    let site = this.meta.website || "~/www"

    // 准备重置密码的命令列表
    let cmds = []
    for (let acc of accounts) {
      cmds.push(`www passwd ${site} "${passwd}" -u id:${acc.id}`)
    }
    let cmdText = cmds.join(";\n")

    // 执行命令
    try {
      await Wn.Sys.exec(cmdText)

      let n = accounts.length
      Ti.Toast.Open({
        content: "i18n:wn-th-acc-pwd-done",
        vars: { n },
        position: "top",
        type: "success"
      })
      // 执行完毕
      Ti.App(this).dispatch("main/reloadSearch")
    } catch (err) {
      Ti.Toast.Open(err, "error");
    }
  }
  //----------------------------------------------------
}