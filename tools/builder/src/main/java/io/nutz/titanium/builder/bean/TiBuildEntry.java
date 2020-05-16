package io.nutz.titanium.builder.bean;

import java.util.regex.Pattern;

public class TiBuildEntry {

    private String path;

    private String prefix;

    private Pattern ignore;

    private Pattern includes;

    private String target;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public Pattern getIgnore() {
        return ignore;
    }

    public void setIgnore(Pattern ignore) {
        this.ignore = ignore;
    }

    public void setIgnore(String ignore) {
        this.ignore = Pattern.compile(ignore);
    }

    public boolean isIgnore(String rph) {
        if (null != ignore) {
            return this.ignore.matcher(rph).find();
        }
        return false;
    }

    public Pattern getIncludes() {
        return includes;
    }

    public void setIncludes(Pattern includes) {
        this.includes = includes;
    }

    public void setIncludes(String includes) {
        this.includes = Pattern.compile(includes);
    }

    public boolean isIncludes(String rph) {
        if (null != includes) {
            return this.includes.matcher(rph).find();
        }
        return true;
    }

    public boolean isSkip(String rph) {
        return this.isIgnore(rph) || !this.isIncludes(rph);
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

}
