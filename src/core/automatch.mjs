///////////////////////////////////////
function DoAutoMatch(input) {
  // null
  if (Ti.Util.isNil(input)) {
    return new NilMatch();
  }
  // Boolean
  if (_.isBoolean(input)) {
    return BooleanMatch(input);
  }
  // Number
  if(_.isNumber(input)) {
    return NumberMatch(input);
  }
  // Array
  if (_.isArray(input)) {
    let ms = []
    for(let o of input) {
      let m = DoAutoMatch(o)
      ms.push(m)
    }
    return ParallelMatch(...ms);
  }
  // Map
  if (_.isPlainObject(input)) {
    // Special Function
    if(input["$Nil"]) {
      return NilMatch(input["$Nil"])
    }
    if(input["$NotNil"]) {
      return NotNilMatch(input["$NotNil"])
    }
    // General Map Match
    return MapMatch(input);
  }
  // String
  if (_.isString(input)) {
    return AutoStrMatch(input);
  }
  // Regex
  if (_.isRegExp(input)) {
    return function(val) {
      return input.test(val)
    }
  }
  throw Ti.Err.make("e.match.unsupport", input);
}
function AutoStrMatch(input) {
  // nil
  if (Ti.Util.isNil(input)) {
    return NilMatch();
  }
  // empty
  if ("" == input) {
    return EmptyMatch();
  }

  let _W = fn => fn
  if(input.startsWith("!")) {
    _W = fn => NotMatch(fn)
    input = input.substring(1).trim()
  }

  // blank
  if (Ti.S.isBlank(input) || "[BLANK]" == input) {
    return _W(BlankMatch());
  }
  // Range
  let m = /^([(\[])([^\]]+)([)\]])$/.exec(input)
  if(m) {
    return _W(NumberRangeMatch(m))
  }
  // Regex
  if(/^!?\^/.test(input)) {
    return _W(RegexMatch(input))
  }
  // Wildcard
  if(/\*/.test(input)) {
    return _W(WildcardMatch(input))
  }
  // StringMatch
  return _W(StringMatch(input))
}
function BlankMatch() {
  return function(val) {
    return Ti.Util.isNil(val) || Ti.S.isBlank(val)
  }
}
function BooleanMatch(bool) {
  let b = bool ? true : false
  return function(val) {
    let ib = val ? true : false
    return ib === b
  }
}
function NumberMatch(n) {
  return function(val){
    return val == n
  }
}
function EmptyMatch() {
  return function(val){
    return _.isEmpty(val)
  }
}
function NumberRangeMatch(input) {
  let m = input
  if(_.isString(input)) {
    m = /^([(\[])([^\]]+)([)\]])$/.exec(input)
  }
  if(!m) {
    return function(){return false}
  }
  let vals = JSON.parse('['+m[2]+']')
  let left = {
    val  : _.first(vals),
    open : '(' == m[1]
  }
  let right = {
    val  : _.last(vals),
    open : ')' == m[3]
  }
  return function(val) {
    let n = val * 1
    if(isNaN(n))
      return false
    
    if(left.open && n <= left.val)
      return false
    
    if(n < left.val)
      return false

    if(right.open && n >= right.val)
      return false

    if(n > right.val)
      return false

    return true
  }
}
function MapMatch(map) {
  // Pre-build
  let matchs = []
  _.forEach(map, (val, key)=>{
    let not = key.startsWith("!")
    let m = DoAutoMatch(val)
    if(not) {
      key = key.substring(1).trim()
      m = NotMatch(m)
    }
    matchs.push({key, m})
  })
  // return matcher
  return function(val) {
    if(!val || !_.isPlainObject(val)){
      return false
    }
    for(let it of matchs) {
      let key = it.key
      let v = _.get(val, key)
      let m = it.m
      if(!m(v))
        return false
    }
    return true
  }
}
function NotNilMatch(input) {
  if(!input) {
    return val => !Ti.Util.isNil(val)
  }
  return val => {
    let v = _.get(val, input)
    return !Ti.Util.isNil(v)
  }
}
function NilMatch(input) {
  if(!input) {
    return val => Ti.Util.isNil(val)
  }
  return val => {
    let v = _.get(val, input)
    return Ti.Util.isNil(v)
  }
}
function NotMatch(m) {
  return function(input) {
    return !m(input)
  }
}
function ParallelMatch(...ms) {
  return function(val){
    if(_.isEmpty(ms))
      return false
    for(let m of ms){
      if(m(val))
        return true
    }
    return false
  }
}
function RegexMatch(regex) {
  let not = false
  if(regex.startsWith("!")) {
    not = true
    regex = regex.substring(1).trim()
  }
  let P = new RegExp(regex)
  return function(val) {
    if(Ti.Util.isNil(val))
      return not
    return P.test(val) ? !not : not
  }
}
function StringMatch(input) {
  let ignoreCase = false
  if (input.startsWith("~~")) {
    ignoreCase = true;
    input = input.substring(2).toUpperCase();
  }
  return function(val) {
    if(Ti.Util.isNil(val)){
      return Ti.Util.isNil(input)
    }
    if(ignoreCase) {
      return input == val.toUpperCase()
    }
    return input == val
  }
}
function WildcardMatch(wildcard) {
  let not = false
  if(wildcard.startsWith("!")) {
    not = true
    wildcard = wildcard.substring(1).trim()
  }
  let regex = "^" + wildcard.replaceAll("*", ".*") + "$"
  let P = new RegExp(regex)
  return function(val) {
    if(Ti.Util.isNil(val))
      return not
    return P.test(val) ? !not : not
  }
}
///////////////////////////////////////
const TiAutoMatch = {
  parse(input) {
    if(_.isFunction(input)){
      return input
    }
    return DoAutoMatch(input)
  },
  test(input, val) {
    if(_.isFunction(input)){
      return input(val)
    }
    return DoAutoMatch(input)(val)
  }
}
///////////////////////////////////////
export const AutoMatch = TiAutoMatch;