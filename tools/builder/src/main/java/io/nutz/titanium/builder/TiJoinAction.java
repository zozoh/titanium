package io.nutz.titanium.builder;

import java.util.List;

import io.nutz.titanium.builder.bean.TiBuildEntry;

public abstract class TiJoinAction {

    protected TiBuildEntry entry;

    protected List<String> outputs;

    public TiJoinAction(TiBuildEntry entry, List<String> outputs) {
        this.entry = entry;
        this.outputs = outputs;
    }

    public abstract void exec(String url, String[] lines) throws Exception;

}
