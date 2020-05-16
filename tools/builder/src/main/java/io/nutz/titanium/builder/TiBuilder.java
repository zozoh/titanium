package io.nutz.titanium.builder;

import org.nutz.json.Json;
import org.nutz.lang.Files;

import io.nutz.titanium.builder.bean.TiBuildConfig;
import io.nutz.titanium.builder.bean.TiBuildEntry;

public class TiBuilder {

    public static void main(String[] args) {
        var fConf = Files.findFile("io/nutz/titanium/builder/build.json");
        var conf = Json.fromJsonFile(TiBuildConfig.class, fConf);

        for (TiBuildEntry et : conf.getEntries()) {
            var ing = new TiBuilding(et);
            ing.logExportDefault();
        }

    }

}
