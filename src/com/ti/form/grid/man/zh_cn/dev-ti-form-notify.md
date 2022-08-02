# 表单通知改动

- 表单模式: `编辑` | `只读`
- 通知模式: `立即` | `确认`
  + 立即模式下，是否同时通知整体数据
- 数据获取: `全部` | `差异`


- readonly   : false | true
- notifyMode : `immediate` | `confirm` | `none` | `auto`
  - `immediate` : 字段改动立即通知
  - `confirm` : 需要用户确认才通知
  - `none` : 永不通知
  - `auto` : readonly 时为 `none`， 否则为 `immediate`
- notifyDataImmediate : true | false
- dataMode   : `all` | `diff` | `auto`
  - `all` 全部
  - `diff` 差异
  - `auto` 在 `confirm` 时为 `diff` 否则为 `all`

主要有三种表单场景:

**快速编辑**

```js
{
  readonly : false,
  notifyMode : "auto", // immediate
  notifyDataImmediate: true,
  dataMode : "auto" // all
}
```

**只读表单**

```js
{
  readonly : true,
  notifyMode : "auto", // none
  notifyDataImmediate: true,
  dataMode : "auto" // all
}
```

**确认编辑**

```js
{
  readonly : false,
  notifyMode : "confirm",
  dataMode : "auto" // diff
}
```

**只读确认**

```js
{
  readonly : true,
  notifyMode : "confirm",
  dataMode : "auto" // diff
}
```