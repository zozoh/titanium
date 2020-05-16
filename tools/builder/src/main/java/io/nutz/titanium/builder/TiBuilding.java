package io.nutz.titanium.builder;

import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.nutz.lang.Dumps;
import org.nutz.lang.Files;
import org.nutz.lang.Lang;
import org.nutz.lang.Nums;
import org.nutz.lang.util.Disks;
import org.nutz.lang.util.FileVisitor;

import io.nutz.titanium.builder.bean.TiBuildEntry;

public class TiBuilding {

    private TiBuildEntry entry;

    private File home;

    public TiBuilding(TiBuildEntry entry) {
        this.entry = entry;
        this.home = Files.findFile(entry.getPath());
    }

    public void logExportDefault() {
        int[] count = Nums.array(0);
        Disks.visitFile(home, f -> {
            String rph = Disks.getRelativePath(home, f);
            if(entry.isSkip(rph)) {
                return;
            }
            // 读一下文件
            String str = Files.read(f);
            System.out.printf("%3d) %s (%d lines)\n", count[0]++, rph, str.lines().count());
            Pattern p = Pattern.compile("export .+");
            Matcher m = p.matcher(str);
            System.out.println(Dumps.matcher(m));
        }, f -> {
            return f.isDirectory() || f.getName().endsWith(".mjs");
        });
    }

}
