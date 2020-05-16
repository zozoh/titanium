package io.nutz.titanium.builder;

import java.io.File;

public interface TiWalker {

    void run(int index, File f, String rph, String[] lines) throws Exception;

}
