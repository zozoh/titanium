package io.nutz.titanium.watcher.bean;

public class WatcherBean {

    public String id;
    
    public String[] paths;
    
    public String cmdTmpl;
    
    public long lastNotify; // 最后一次被通知修改
    
    public long lastRun; // 最新一次cmd被执行完成
    
    public int runDely = 3000;
}
