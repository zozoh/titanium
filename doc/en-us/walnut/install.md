# Mount Ti

1. `/mnt/ti -> file://D:/workspace/git/github/titanium/src`
2. `/rs/ti -> /mnt/ti`

# Setup Domain

1. create user `demo` for example
2. `login demo`
3. `me -set THEME=light`
4. `me -set APP_PATH=/rs/ti/app:/app`
5. `me -set VIEW_PATH=/rs/ti/view/`
6. `me -set SIDEBAR_PATH=/rs/ti/view/sidebar.json`
7. `obj ~ -u 'icon:"fas-globe"'`

# Customized Setting

If you want to customized the configuration, place `~/.ti/config.json`

- `main ti config` for more detail
- `wn.manager/pc_tmpl.html` line around 50 for more clue

