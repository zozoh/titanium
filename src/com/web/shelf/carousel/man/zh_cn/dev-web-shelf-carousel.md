---
title: 无限旋转搁架:WebShelfCarousel
author: zozohtnt@gmail.com
screen:
- desktop
- mobile
---

# 无限旋转搁架概述

```
E        A             B            C        D
---+------------|------------|------------+---
   |            |            |            |
   |            |            |            |
 < |     A      |     B      |      C     | >
   |            |            |            |
   |            |            |            |
---+------------|------------|------------+---
```

接受一组对象，譬如 `A,B,C,D,E`，形成一个逻辑循环:

```
           A  -  B
          /       \
         E         C
          \       / 
              D
```

控件接受一个输入`cols` 表示在可视区域，要显示几个卡片。
当然，我们左右还需格子保留一定的半截图片。
左右的宽度默认的是整个区域宽度的 `8%`(当然，也可以指定这个比例或者一个固定数值)

**滚动策略**

根据当前下标（`A`位应该由数组哪个数据填充），获取一个前后共 `cols` 的对象列表。
如果左右不足，则循环对象填充

```bash
      |<-- DISPLAY -->|  
      | |<- Window->| |
+---+---+---+---+---+---+---+
| L | M | A | B | C | X | Y |
+---+---+---+---+---+---+---+
```

点击左右滚动按钮，则锁住点击。
滚动结束，重新布局卡片后，才解开锁定

**计算策略**

```bash
令:
控件区域宽度 : W
左右边距 : P
主要区域 : V = W - 2P
卡片宽度 : C = V / cols
每次滚动距离 : V
内容器左边绝对位移: offset = -2C + P  
> # 每次滚动结束后，要重置这个绝对位移
```


# 属性列表

*TODO ..*
