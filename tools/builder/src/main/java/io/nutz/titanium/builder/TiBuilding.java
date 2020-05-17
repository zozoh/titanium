package io.nutz.titanium.builder;

import java.io.File;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.nutz.lang.Dumps;
import org.nutz.lang.Files;
import org.nutz.lang.Lang;
import org.nutz.lang.Nums;
import org.nutz.lang.Strings;
import org.nutz.lang.util.Disks;
import org.nutz.lang.util.NutMap;
import org.nutz.trans.Atom;

import io.nutz.titanium.builder.action.TiJoinTiJSON;
import io.nutz.titanium.builder.action.TiJoinHTML;
import io.nutz.titanium.builder.action.TiJoinMJS;
import io.nutz.titanium.builder.bean.TiBuildEntry;

public class TiBuilding implements Atom {

    private TiBuildEntry entry;

    private File home;

    private List<String> outputs;

    private Map<String, TiJoinAction> actions;

    public TiBuilding(TiBuildEntry entry, List<String> outputs) {
        this.entry = entry;
        this.home = Files.findFile(entry.getPath());

        this.outputs = outputs;

        this.actions = new HashMap<String, TiJoinAction>();
        actions.put(".mjs", new TiJoinMJS(entry, outputs));
        actions.put(".html", new TiJoinHTML(entry, outputs));
        actions.put(".json", new TiJoinTiJSON(entry, outputs));
    }

    private void walk(TiWalker walker, String regex) {
        int[] count = Nums.array(0);
        Disks.visitFile(home, f -> {
            String rph = Disks.getRelativePath(home, f);
            if (entry.isSkip(rph)) {
                System.out.printf("!SKIP: %s\n", rph);
                return;
            }

            // 读一下文件
            String content = Files.read(f);
            var index = count[0]++;
            var lines = content.lines().toArray(len -> {
                return new String[len];
            });
            try {
                walker.run(index, f, rph, lines);
            }
            catch (Exception e) {
                throw Lang.wrapThrow(e);
            }
        }, f -> {
            if (f.isDirectory())
                return true;
            if (null != regex) {
                boolean re = f.getName().matches(regex);
                if (!re) {
                    System.out.printf("!~ IGNORE: %s\n", f.getAbsolutePath());
                }
                return re;
            }
            return true;
        });
    }

    @Override
    public void run() {
        // 内联模式
        if (home.isFile()) {
            this.extendImports();
        }
        // 打包模式
        else {
            this.packToOnFile();
        }
    }

    private void extendImports() {
        // 读一下文件
        String content = Files.read(this.home);
        var lines = content.lines().toArray(len -> {
            return new String[len];
        });

        // 逐行扫码，遇到 import 的进行分析
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            Matcher m = P_I.matcher(line);
            // 导入行 import xxx: 改成赋值模式
            if (m.find()) {
                String varName = m.group(1).strip();
                String rPath = m.group(2).strip();

                // 增加一个备注
                outputs.add("//" + "#".repeat(50));
                outputs.add("// # " + line);
                outputs.add("const " + varName + " = (function(){");

                // Import it
                doExtendFiles(this.home, rPath, 0);

                // 结尾
                outputs.add("})();");
            }
            // 普通行，附加
            else {
                outputs.add(line);
            }

        }
    }

    private static Pattern P_I = Pattern.compile("^ *import *([{}\\w, ]+) *from *['\"](.+)['\"] *;? *$");

    private static Pattern P_E = Pattern.compile("^ *export *("
                                                 + "(default|const|class|(async +)?function)? *"
                                                 + "(\\w+) *"
                                                 + "(= *(([\\w ()]+)|([({]+)) *)?"
                                                 + ".*)$");

    private void doExtendFiles(File jsFile, String rPath, int depth) {
        String logPrefix = "   ".repeat(depth);
        String codePrefix = "  ".repeat(depth + 1);
        // ........................................
        // 打开文件
        String path = Disks.appendPath(jsFile.getParent(), rPath);
        File file = Files.findFile(path);
        String content = Files.read(file);
        var lines = content.lines().toArray(len -> {
            return new String[len];
        });
        // ........................................
        System.out.println(logPrefix + "#" + "=".repeat(60 - depth * 3));
        System.out.println(logPrefix + "# " + rPath);
        // ........................................
        // 准备收集 exports 信息
        NutMap exports = new NutMap();
        String defaultExport = null;
        // ........................................
        // 逐行分析
        // ........................................
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];

            // 收集 import 信息
            Matcher m = P_I.matcher(line);
            if (m.find()) {
                String varName = m.group(1).strip();
                String impPath = m.group(2).strip();
                System.out.printf(logPrefix + "line:%4d: @import %s from %s\n",
                                  i,
                                  varName,
                                  impPath);

                // 增加一个备注
                outputs.add(codePrefix + "//" + "#".repeat(50 - codePrefix.length()));
                outputs.add(codePrefix + "// # " + line);
                outputs.add(codePrefix + "const " + varName + " = (function(){");

                // Import it
                this.doExtendFiles(file, impPath, depth + 1);

                // 结尾
                outputs.add(codePrefix + "})();");
            }
            // 收集 export 信息
            else if (line.startsWith("export")) {
                System.out.printf(logPrefix + " -> line:%4d: %s\n", i, line);
                m = P_E.matcher(line);
                if (!m.find()) {
                    throw Lang.makeThrow("Fail to match export RegExp");
                }
                // System.out.printf(logPrefix + " -> line:%4d: @export %s\n",
                // i,
                // Dumps.matcherFound(m));
                String exportType = m.group(2);
                String exportName = m.group(4);
                String exportVarN = m.group(7);
                String exportChar = m.group(8);
                String rawLine = m.group(1);
                System.out.printf(logPrefix + " ----------->: %s\n", rawLine);
                // 默认输出，特别记录一下
                if ("default".equals(exportType)) {
                    defaultExport = exportName;
                }
                // 固定名字输出
                else {
                    exports.put(exportName, exportVarN);
                }

                // 替换原来的行，以便去掉 export
                // 当然，原来就是一个 export const xxx = xxx，那么就不用保留了
                // 最后生成 return 语句的时候，会一并生成的
                if (!exportType.matches("^(const|default)$") || !Strings.isBlank(exportChar)) {
                    outputs.add(codePrefix + rawLine);
                }
            }
            // 普通行，计入
            else {
                outputs.add(codePrefix + line);
            }
        }
        // ........................................
        // 返回部分
        // ........................................
        // 默认输出 export default
        if (!Strings.isBlank(defaultExport)) {
            outputs.add(codePrefix + "return " + defaultExport + ";");
        }
        // 按名称输出 export {...}
        else {
            List<String> ress = new LinkedList<>();
            for (String key : exports.keySet()) {
                String val = exports.getString(key);
                if (null == val) {
                    ress.add(key);
                } else {
                    ress.add(key + ": " + val);
                }
            }
            String reStr = "{" + Strings.join(", ", ress) + "}";
            System.out.println(logPrefix + "@return " + reStr);
            outputs.add(codePrefix + "return " + reStr + ";");
        }
    }

    private void packToOnFile() {
        this.walk((index, f, rph, lines) -> {
            System.out.printf("%3d) %s (%d lines)\n", index, rph, lines.length);
            for (Map.Entry<String, TiJoinAction> en : this.actions.entrySet()) {
                String suffix = en.getKey();
                if (rph.endsWith(suffix)) {
                    outputs.add("//" + "=".repeat(60));
                    outputs.add("// JOIN: " + rph);
                    outputs.add("//" + "=".repeat(60));

                    TiJoinAction ja = en.getValue();

                    String loadUrl = rph;
                    if (!Strings.isBlank(entry.getPrefix())) {
                        loadUrl = entry.getPrefix() + rph;
                    }

                    ja.exec(loadUrl, lines);
                    System.out.printf("   + => %s\n", ja.getClass().getSimpleName());
                    return;
                }
            }
            System.out.println("   !!! NilAction !!!");
        }, "^.+\\.(mjs|html|json)$");
    }

    public void logExportDefault() {
        this.walk((index, f, rph, lines) -> {
            System.out.printf("%3d) %s (%d lines)\n", index, rph, lines.length);
            var i = 0;
            Pattern p = Pattern.compile("export *default *\\{");
            for (; i < lines.length; i++) {
                var line = lines[i];
                if (p.matcher(line).find()) {
                    System.out.printf("  found 'export default' at line %d", i);
                }
            }
        }, "^.+\\.(mjs|json|html)$");
    }

}
