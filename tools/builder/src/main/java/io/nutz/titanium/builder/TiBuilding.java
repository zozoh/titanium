package io.nutz.titanium.builder;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.nutz.lang.Files;
import org.nutz.lang.Lang;
import org.nutz.lang.Nums;
import org.nutz.lang.Strings;
import org.nutz.lang.util.Disks;
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
