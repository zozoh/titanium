export default {
  async resetPasswd() {
    // 获取当前选择账号
    let accounts = this.$store.getters["main/search/checkedItems"]

    // 提示错误
    if(_.isEmpty(accounts)) {
      Ti.Toast.Open("请选择要重置密码的账号（可多选）", "warn")
      return
    }

    // 准备重置密码
    let passwd = await Ti.Prompt("将密码重置为：", {
      placeholder : "i18n:passwd",
      value : "123456"
    })
    passwd = _.trim(passwd)

    // 用户选择了放弃
    if(!passwd)
      return

    // 密码过短
    if(passwd.length < 6) {
      Ti.Toast.Open({
        type : "warn",
        content : "您输入的密码过短，不能少于6位，最好为数字字母以及特殊字符的组合", 
        duration: 0
      })
      return
    }

    // 守卫不安全的字符
    if(/['"*]/.test(passwd)) {
      Ti.Toast.Open({
        type : "warn",
        content : "密码中不得包含单双引号星号等非法字符", 
        duration: 0
      })
      return
    }

    // 准备重置密码的命令列表
    let cmds = []
    for(let acc of accounts) {
      cmds.push(`passwd "${passwd}" -u id:${acc.id}`)
    }
    let cmdText = cmds.join(";\n")
    
    // 执行命令
    await Wn.Sys.exec2(cmdText)

    let n = accounts.length
    Ti.Toast.Open(`已经为${n}名用户重置了密码`)

    // 执行完毕
    Ti.App(this).dispatch("main/reloadSearch")
  }
}