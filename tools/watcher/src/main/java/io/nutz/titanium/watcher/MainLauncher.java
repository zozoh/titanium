package io.nutz.titanium.watcher;

import java.io.File;

import org.nutz.boot.NbApp;
import org.nutz.ioc.Ioc;
import org.nutz.ioc.impl.PropertiesProxy;
import org.nutz.ioc.loader.annotation.Inject;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.json.Json;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Ok;

import io.nutz.titanium.watcher.bean.WatcherBean;
import io.nutz.titanium.watcher.service.WatcherService;

@IocBean(create="init", depose="depose")
public class MainLauncher {
    
    @Inject
    protected PropertiesProxy conf;
    
    @Inject("refer:$ioc")
    protected Ioc ioc;
    
    @At("/")
    @Ok("->:/index.html")
    public void index() {}
    
    public void init() {
        WatcherService ws = ioc.get(WatcherService.class);
        for (File f : new File(".").listFiles()) {
            if (!f.isFile())
                continue;
            if (!f.getName().endsWith(".json")) {
                continue;
            }
            if (!f.getName().startsWith("watcher.")) {
                continue;
            }
            WatcherBean wb = Json.fromJsonFile(WatcherBean.class, f);
            if (wb != null)
                ws.add(wb);
        }
    }
    public void depose() {}

    public static void main(String[] args) throws Exception {
        new NbApp().setArgs(args).setPrintProcDoc(true).run();
    }

}
