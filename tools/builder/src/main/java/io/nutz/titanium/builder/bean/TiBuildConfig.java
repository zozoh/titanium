package io.nutz.titanium.builder.bean;

import org.nutz.lang.util.NutMap;

public class TiBuildConfig {

    private String home;

    private TiBuildEntry[] entries;

    private NutMap targets;

    public String getHome() {
        return home;
    }

    public void setHome(String home) {
        this.home = home;
    }

    public TiBuildEntry[] getEntries() {
        return entries;
    }

    public void setEntries(TiBuildEntry[] coms) {
        this.entries = coms;
    }

    public NutMap getTargets() {
        return targets;
    }

    public void setTargets(NutMap targets) {
        this.targets = targets;
    }

}
