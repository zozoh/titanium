package io.nutz.titanium.builder.bean;

import java.util.Map;

public class TiBuildConfig {

    private String home;

    private TiBuildEntry[] entries;

    private Map<String, TiBuildTarget> targets;

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

    public Map<String, TiBuildTarget> getTargets() {
        return targets;
    }

    public void setTargets(Map<String, TiBuildTarget> targets) {
        this.targets = targets;
    }

}
