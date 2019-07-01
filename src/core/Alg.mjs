///////////////////////////////////////////
export const TiAlg = {
  //---------------------------------------
  // 获取两个数的最大公约数
  // greatest common divisor(gcd)
  gcd : function(a,b){
    a = Math.round(a);
    b = Math.round(b);
    if(b){
        return this.gcd(b,a%b);
    }
    return a;
  },
  //---------------------------------------
  gcds : function() {
      var args = Array.from(arguments);
      var list = _.flatten(args);
      // 没数
      if(list.length == 0)
          return NaN;
      // 一个是自己
      if(list.length == 1) {
          return list[0];
      }
      // 两个以上
      var gcd = this.gcd(list[0], list[1]);
      for(var i=2; i<list.length; i++) {
          gcd = this.gcd(gcd, list[i]);
      }
      // 返回
      return gcd;
  },
  //---------------------------------------
  // 获取两个数的最小公倍数 
  // lowest common multiple (LCM)
  lcm  : function(a, b) {
      a = Math.round(a);
      b = Math.round(b);
      return a * b / this.gcd(a, b);
  },
  //---------------------------------------
  lcms : function() {
      var args = Array.from(arguments);
      var list = _.flatten(args);
      // 没数
      if(list.length == 0)
          return NaN;
      // 一个是自己
      if(list.length == 1) {
          return list[0];
      }
      // 两个以上
      var lcm = this.lcm(list[0], list[1]);
      for(var i=2; i<list.length; i++) {
          lcm = this.lcm(lcm, list[i]);
      }
      // 返回
      return lcm;
  }
  //---------------------------------------
}
///////////////////////////////////////////
export default TiAlg
