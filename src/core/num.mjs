//-----------------------------------
const BASE26 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//-----------------------------------
const TiNum = {
  /***
   * Fill array from given number. 
   * It will mutate the input array
   * 
   * @param startValue{Number} - The begin number to fill
   * @param len{Number} - how may items should be filled
   * @param ary{Array} - source array
   * @param step{Number} - Number increasement
   * 
   * @return the source array passed in
   */
  fillSteps(startValue = 0, len = 1, {
    ary = [], step = 1
  } = {}) {
    for (let i = 0; i < len; i++) {
      ary[i] = startValue + i * step
    }
    return ary
  },
  /***
   * Clamp the number in range.
   * 
   * ```
   * scrollIndex( 3, 5) => 3
   * scrollIndex( 0, 5) => 0
   * scrollIndex( 4, 5) => 4
   * scrollIndex( 5, 5) => 1
   * scrollIndex( 6, 5) => 2
   * scrollIndex(-1, 5) => 4
   * scrollIndex(-5, 5) => 0
   * scrollIndex(-6, 5) => 4
   * scrollIndex(-5, 5) => 0
   * ```
   */
  scrollIndex(index, len = 0) {
    if (len > 0) {
      let md = index % len;
      return md >= 0
        ? md
        : len + md
    }
    return -1
  },
  /***
   * @param n{Number} input number
   * @param p{Number} precise bit
   * 
   * @return The number after tidy
   */
  precise(n, p = 2) {
    if (p >= 0) {
      var y = Math.pow(10, p);
      return Math.round(n * y) / y;
    }
    return n;
  },
  /***
   * @param n{Number} input number
   * @param unit{Number} the number padding unit
   * 
   * @return The number pad to unit
   */
  padTo(n, unit=1) {
    if(unit > 1) {
      let x = Math.round(n / unit)
      return  x * unit
    }
    return n
  },
  /***
   * @param v{Number} input number
   * @param unit{Number} number unit
   * 
   * @return new ceil value for unit
   */
  ceilUnit(v, unit = 0) {
    if (_.isNumber(v) && unit > 0) {
      let n = Math.ceil(v / unit)
      return n * unit
    }
    return v
  },
  /***
   * @param v{Number} input number
   * @param unit{Number} number unit
   * 
   * @return new floor value for unit
   */
  floorUnit(v, unit = 0) {
    if (_.isNumber(v) && unit > 0) {
      let n = Math.floor(v / unit)
      return n * unit
    }
    return v
  },
  /***
   * Translate decimal (0-9) to 27 base system (A-Z)
   * 
   * ```bash
   * #---------------------------------------
   * # 26 base system (A-Z)
   * 0  1  2  3  4  5  6  7  8  9
   * A  B  C  D  E  F  G  H  I  J
   *
   * 10 11 12 13 14 15 16 17 18 19
   * K  L  M  N  O  P  Q  R  S  T
   *
   * 20 21 22 23 24 25 26 27 28 29
   * U  V  W  X  Y  Z  AA AB AC AD
   * 
   * 30 31 33 33 34 35 36 37 38 39
   * AE AF AG AH AI AJ AK AL AM AN
   * 
   * 40 41 44 44 44 45 46 47 48 49
   * AO AP AQ AR AS AT AU AV AW AX
   * 
   * 50 51 55 55 55 55 56 57 58 59
   * AY AZ BA BB BC BD BE BF BG BH
   * #---------------------------------------
   * {high} --> "AB" <-- {low}
   * ```
   *
   */
  toBase26(n) {
    n = Math.abs(Math.round(n))
    let re = []
    while (n >= 26) {
      let high = parseInt(n / 26)
      let low = parseInt(n - (high * 26))
      re.push(BASE26[low])
      n = high - 1
    }
    re.push(BASE26[n])
    return re.reverse().join("")
  },
  /***
   * Translate 27 base system (A-Z) to decimal (0-9)
   */
  fromBase26(base26) {
    // Reverse the code from low to high
    //  "ADC" => "C","D","A"
    //console.log("fromBase26:", base26)
    let cs = _.trim(base26).toUpperCase().split("").reverse().join("")
    let n = 0;
    let len = cs.length
    let r = 1
    for (let i = 0; i < len; i++) {
      let cc = cs.charCodeAt(i)
      // Char code 'A' == 65, 'Z' == 90
      if (cc < 65 || cc > 90) {
        throw `Invalid base26 number : ${base26}`
      }
      let bn = (cc - 65)
      if (i > 0) {
        bn += 1
      }
      n += bn * r
      // Move higher 
      r *= 26
    }
    return n
  },
  // _test_base_26() {
  //   for(let i=0; i< 10000; i++) {
  //     let bs = TiNum.toBase26(i)
  //     let bn = TiNum.fromBase26(bs)
  //     if(i != bn) {
  //       console.error(`${i}. ${bs} => ${bn}`)
  //     } else {
  //       console.log(`${i}. ${bs} => ${bn}`)
  //     }
  //   }
  // }
}
//---------------------------------------
export const Num = TiNum

