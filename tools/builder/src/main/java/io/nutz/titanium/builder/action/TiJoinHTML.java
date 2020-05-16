package io.nutz.titanium.builder.action;

import java.util.List;

import io.nutz.titanium.builder.TiJoinAction;
import io.nutz.titanium.builder.bean.TiBuildEntry;

public class TiJoinHTML extends TiJoinAction {

    public TiJoinHTML(TiBuildEntry entry, List<String> outputs) {
        super(entry, outputs);
    }

    @Override
    public void exec(String url, String[] lines) throws Exception {
        // 输出内容
        outputs.add("Ti.Preload(\"" + url + "\", `" + lines[0]);
        int last = lines.length - 1;
        for (int i = 1; i < last; i++) {
            outputs.add(lines[i]);
        }
        outputs.add(lines[last] + "`);");
    }

}
