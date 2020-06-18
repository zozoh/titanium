///////////////////////////////////////
const TiBank = {
  //-----------------------------------
  getCurrencyChar(cur="RMB") {
    return ({
      "RMB": "¥",
      "USD": "$",
      "GBP": "£"
    })[cur]
  }
  //-----------------------------------
}
///////////////////////////////////////
export const Bank = TiBank

