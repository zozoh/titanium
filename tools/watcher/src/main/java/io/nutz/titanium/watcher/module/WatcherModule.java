package io.nutz.titanium.watcher.module;


import org.nutz.ioc.loader.annotation.*;
import org.nutz.mvc.annotation.*;


@At("/watcher")
@IocBean(create="init", depose="depose")
public class WatcherModule {
    
    public void init() {}
    public void depose() {}

}
