////////////////////////////////////////////////////
async function TiEditCode(
  code = "",
  {
    mode = "text",
    title = "i18n:view",
    position = "top",
    width = "62%",
    height = "62%",
    textOk,
    textCancel,
  } = {}
) {
  return await Ti.App.Open({
    title,
    position,
    width,
    height,
    textOk,
    textCancel,
    result: code,
    comType: "TiTextCodeAce",
    comConf: {
      mode,
    },
    components: ["@com:ti/text/code/ace"],
  });
}
////////////////////////////////////////////////////
export const EditCode = TiEditCode;
