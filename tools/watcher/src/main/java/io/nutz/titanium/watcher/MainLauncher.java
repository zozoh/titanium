package io.nutz.titanium.watcher;

import java.io.File;

import org.nutz.boot.NbApp;
import org.nutz.ioc.Ioc;
import org.nutz.ioc.impl.PropertiesProxy;
import org.nutz.ioc.loader.annotation.Inject;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.json.Json;
import org.nutz.log.Log;
import org.nutz.log.Logs;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Ok;

import io.nutz.titanium.watcher.bean.WatcherBean;
import io.nutz.titanium.watcher.service.WatcherService;

@IocBean(create="init", depose="depose")
public class MainLauncher {
    
    private static final Log log = Logs.get();
    
    @Inject
    protected PropertiesProxy conf;
    
    @Inject("refer:$ioc")
    protected Ioc ioc;
    
    @Inject
    protected WatcherService ws;
    
    @At("/")
    @Ok("->:/index.html")
    public void index() {}
    
    public void init() {
        File dir = new File(conf.get("jwatcher.confpath", "./"));
        if (!dir.exists()) {
            throw new RuntimeException("confpath=" + dir.getPath() +" not exsits!!");
        }
        for (File f : dir.listFiles()) {
            if (!f.isFile())
                continue;
            if (!f.getName().endsWith(".json")) {
                continue;
            }
            WatcherBean wb = Json.fromJsonFile(WatcherBean.class, f);
            if (wb != null) {
                log.info("add " + f.getName());
                ws.add(wb);
            }
        }
    }
    public void depose() {}

    public static void main(String[] args) throws Exception {
        new NbApp().setArgs(args).setPrintProcDoc(true).run();
    }

}
