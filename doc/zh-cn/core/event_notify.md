# 事件通知机制要解决的问题

Vue 原生的 `$emit` 不能冒泡

# 解决方法

首先，所有的控件调用 `$notify` 而不是 `$emit`。
在 $notify 中，处理 `(name, ...args)`时：

1. 寻找自己的 `$listeners` 是否处理这个事件
2. 如果处理函数返回 `{stop:true}` 表示不要冒泡了
3. 试图调用自己的 `__bubble_event(name, ...args)` 执行冒泡
   - 这样，`ti-gui-block` 之类的控件可以有手段改写事件的名称

这种方法将最自然的让 Vue 实现事件的冒泡

提供 `ti-vue-event-bubble` 插件。构建参数 `{byEmit:true}` 将会改写控件原生的 `$emit` 函数。
让其调用 `$notify`