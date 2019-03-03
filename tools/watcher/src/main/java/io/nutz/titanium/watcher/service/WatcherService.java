package io.nutz.titanium.watcher.service;

import static java.nio.file.LinkOption.NOFOLLOW_LINKS;
import static java.nio.file.StandardWatchEventKinds.ENTRY_CREATE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_DELETE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;
import static java.nio.file.StandardWatchEventKinds.OVERFLOW;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.WatchEvent;
import java.nio.file.WatchEvent.Kind;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.nutz.ioc.impl.PropertiesProxy;
import org.nutz.ioc.loader.annotation.Inject;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.lang.Lang;
import org.nutz.lang.Strings;
import org.nutz.lang.random.R;
import org.nutz.lang.tmpl.Tmpl;
import org.nutz.lang.util.NutMap;
import org.nutz.log.Log;
import org.nutz.log.Logs;

import io.nutz.titanium.watcher.bean.WatcherBean;

@IocBean(create = "init", depose = "depose")
public class WatcherService {

    private static final Log log = Logs.get();

    @Inject
    protected PropertiesProxy conf;

    protected ExecutorService es;

    protected WatchService watcher;

    protected Map<WatchKey, Path> keys;

    protected boolean running;

    protected NutMap wbmap = new NutMap();

    protected List<WatcherBean> wbs = new ArrayList<>();

    public void add(WatcherBean wb) {
        if (wb.id == null)
            wb.id = R.UU32();
        for (String name : wb.paths) {
            Path path = Paths.get(new File(name).getAbsolutePath());
            try {
                registerAll(path);
                wbmap.addv2(name, wb);
            }
            catch (IOException e) {
                log.info("registerAll fail", e);
            }
        }
        wbs.add(wb);
        es.submit(() -> {
            executeTask(wb);
        });
    }

    @SuppressWarnings("unchecked")
    static <T> WatchEvent<T> cast(WatchEvent<?> event) {
        return (WatchEvent<T>) event;
    }

    /**
     * Register the given directory with the WatchService
     */
    private void register(Path dir) throws IOException {
        WatchKey key = dir.register(watcher, ENTRY_CREATE, ENTRY_DELETE, ENTRY_MODIFY);
        keys.put(key, dir);
    }

    /**
     * Register the given directory, and all its sub-directories, with the WatchService.
     */
    private void registerAll(final Path start) throws IOException {
        // register directory and sub-directories
        Files.walkFileTree(start, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                register(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    /**
     * Process all events for keys queued to the watcher
     */
    @SuppressWarnings("unchecked")
    void processEvents() {
        while (running) {

            // wait for key to be signalled
            WatchKey key;
            try {
                key = watcher.poll(1, TimeUnit.SECONDS);
            }
            catch (InterruptedException x) {
                break;
            }
            if (key == null)
                continue;

            Path dir = keys.get(key);
            if (dir == null) {
                log.info("WatchKey not recognized!! key=" + key);
                continue;
            }
            boolean recursive = true;
            for (WatchEvent<?> event : key.pollEvents()) {
                Kind<?> kind = event.kind();

                // TBD - provide example of how OVERFLOW event is handled
                if (kind == OVERFLOW) {
                    continue;
                }

                // Context for directory entry event is the file name of entry
                WatchEvent<Path> ev = cast(event);
                Path name = ev.context();
                Path child = dir.resolve(name);

                // print out event
                log.infof("%s: %s", event.kind().name(), child);

                // if directory is created, and watching recursively, then
                // register it and its sub-directories
                if (recursive && (kind == ENTRY_CREATE)) {
                    try {
                        if (Files.isDirectory(child, NOFOLLOW_LINKS)) {
                            registerAll(child);
                        }
                    }
                    catch (IOException x) {
                        // ignore to keep sample readbale
                    }
                }
            }

            // reset key and remove from set if directory no longer accessible
            boolean valid = key.reset();
            if (!valid) {
                keys.remove(key);

                // all directories are inaccessible
                if (keys.isEmpty()) {
                    break;
                }
            }

            for (Map.Entry<String, Object> en : wbmap.entrySet()) {
                String k = en.getKey();
                String p = dir.toFile().getAbsolutePath();
                if (p.startsWith(k)) {
                    List<WatcherBean> list = (List<WatcherBean>) en.getValue();
                    for (WatcherBean wb : list) {
                        wb.lastNotify = System.currentTimeMillis();
                    }
                }
            }
        }
    }

    public void executeTask(WatcherBean wb) {
        while (running) {
            Lang.quiteSleep(1000);
            if (wb.lastNotify == 0)
                continue;
            if (wb.lastRun >= wb.lastNotify)
                continue;
            if (System.currentTimeMillis() - wb.lastNotify < wb.runDely)
                continue;
            if (System.currentTimeMillis() - wb.lastNotify > wb.runDely * 3)
                continue;
            if (Strings.isBlank(wb.cmdTmpl))
                continue;
            try {
                String cmd = Tmpl.parse(wb.cmdTmpl).render(Lang.obj2nutmap(wb));
                executeCmd(cmd);
            }
            catch (Throwable e) {
                log.warn("exec fail", e);
            }
            wb.lastRun = System.currentTimeMillis();
            wb.lastNotify = wb.lastRun;
        }
    }
    
    public void executeCmd(String cmd) throws IOException {
        log.debug("exec " + cmd);
        if (cmd.startsWith("*zdoc")) {
            cmd = cmd.substring(5);
            String[] args = Strings.splitIgnoreBlank(cmd, " ");
            org.nutz.plugins.zdoc.NutzDocMain.main(args);
        }
        else {
            Lang.execOutput(cmd);
        }
    }

    public void init() throws IOException {
        es = Executors.newFixedThreadPool(16);
        watcher = FileSystems.getDefault().newWatchService();
        keys = new HashMap<>();
        running = true;
        es.submit(() -> {
            processEvents();
        });
    }

    public void depose() throws IOException {
        running = false;
        if (es != null)
            es.shutdown();
        if (watcher != null)
            watcher.close();
    }
}
