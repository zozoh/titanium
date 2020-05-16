package io.nutz.titanium.builder;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import org.nutz.json.Json;
import org.nutz.lang.Files;
import org.nutz.lang.Strings;
import org.nutz.lang.util.Disks;

import io.nutz.titanium.builder.bean.TiBuildConfig;
import io.nutz.titanium.builder.bean.TiBuildEntry;

public class TiBuilder {

    public static void build(String buildFilePath) {
        var fConf = Files.findFile(buildFilePath);
        var conf = Json.fromJsonFile(TiBuildConfig.class, fConf);

        // Auto Set home path
        if (Strings.isBlank(conf.getHome())) {
            conf.setHome(Files.getParent(buildFilePath));
        }

        // Prepare output targets
        var targetOutputs = new HashMap<String, List<String>>();
        for (String targetName : conf.getTargets().keySet()) {
            targetOutputs.put(targetName, new LinkedList<>());
        }

        // Building
        System.out.println("-".repeat(40));
        System.out.printf("BUIDING: %d entry\n", conf.getEntries().length);
        for (TiBuildEntry et : conf.getEntries()) {
            List<String> outputs = targetOutputs.get(et.getTarget());
            et.setPath(Disks.appendPath(conf.getHome(), et.getPath()));
            var ing = new TiBuilding(et, outputs);
            ing.run();
        }

        // Ouput
        System.out.println("-".repeat(40));
        System.out.printf("OUTPUT: %d targets\n", conf.getTargets().size());
        for (String targetName : conf.getTargets().keySet()) {
            String targetPath = conf.getTargets().getString(targetName);
            List<String> outputs = targetOutputs.get(targetName);
            // 前包裹
            outputs.add(0, "(function(){");
            // 结束包裹
            outputs.add("//".repeat(30));
            outputs.add("// The End");
            outputs.add("})();");

            String content = Strings.join(System.lineSeparator(), outputs);

            String aph = Disks.appendPath(conf.getHome(), targetPath);
            Files.write(aph, content);
            System.out.printf("  + %s\n", targetPath);
        }
    }

    public static void main(String[] args) {
        if (args.length > 0) {
            for (int i = 0; i < args.length; i++) {
                build(args[i]);
            }
        } else {
            System.err.println("You should provide a config(JSON file) path!!!");
        }

    }

}
