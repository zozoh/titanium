//////////////////////////////////////////////////////
const ICONS = {
  /* Starts Icons */
  starts : ["fas-allergies","fas-ambulance","fas-anchor","fas-angry","fas-archive","fas-archway",
  "fas-atlas","fas-baby-carriage","fas-bacteria","fas-bacterium","fas-balance-scale",
  "fas-band-aid","fas-bath","fas-bed","fas-binoculars","fas-biohazard","fas-birthday-cake",
  "fas-bone","fas-bong","fas-book","fas-book-medical","fas-brain","fas-briefcase",
  "fas-briefcase-medical","fas-building","fas-bullhorn","fas-bullseye","fas-burn",
  "fas-bus","fas-bus-alt","fas-business-time","fas-calculator","fas-calendar","fas-calendar-alt",
  "fas-campground","fas-candy-cane","fas-cannabis","fas-capsules","fas-car","fas-caravan",
  "fas-carrot","fas-certificate","fas-chart-area","fas-chart-bar","fas-chart-line",
  "fas-chart-pie","fas-church","fas-city","fas-clinic-medical","fas-clipboard","fas-cocktail",
  "fas-coffee","fas-columns","fas-comment-dollar","fas-comment-medical","fas-comments-dollar",
  "fas-compass","fas-concierge-bell","fas-cookie-bite","fas-copy","fas-copyright",
  "fas-crutch","fas-cut","fas-dharmachakra","fas-diagnoses","fas-dice","fas-dice-five",
  "fas-disease","fas-dizzy","fas-dna","fas-door-closed","fas-door-open","fas-dumbbell",
  "fas-dungeon","fas-edit","fas-envelope","fas-envelope-open","fas-envelope-open-text",
  "fas-envelope-square","fas-eraser","fas-fax","fas-file","fas-file-alt","fas-file-medical",
  "fas-file-medical-alt","fas-file-prescription","fas-first-aid","fas-flushed","fas-folder",
  "fas-folder-minus","fas-folder-open","fas-folder-plus","fas-frog","fas-frown","fas-frown-open",
  "fas-funnel-dollar","fas-gift","fas-gifts","fas-glass-cheers","fas-glass-martini",
  "fas-glass-martini-alt","fas-glasses","fas-globe","fas-globe-africa","fas-globe-americas",
  "fas-globe-asia","fas-globe-europe","fas-gopuram","fas-graduation-cap","fas-grimace",
  "fas-grin","fas-grin-alt","fas-grin-beam","fas-grin-beam-sweat","fas-grin-hearts",
  "fas-grin-squint","fas-grin-squint-tears","fas-grin-stars","fas-grin-tears","fas-grin-tongue",
  "fas-grin-tongue-squint","fas-grin-tongue-wink","fas-grin-wink","fas-hand-holding-medical",
  "fas-hat-cowboy","fas-hat-cowboy-side","fas-hat-wizard","fas-head-side-cough","fas-head-side-cough-slash",
  "fas-head-side-mask","fas-head-side-virus","fas-heart","fas-heartbeat","fas-highlighter",
  "fas-holly-berry","fas-home","fas-hospital","fas-hospital-alt","fas-hospital-symbol",
  "fas-hospital-user","fas-hot-tub","fas-hotel","fas-house-damage","fas-id-card-alt",
  "fas-igloo","fas-industry","fas-infinity","fas-joint","fas-kaaba","fas-key","fas-kiss",
  "fas-kiss-beam","fas-kiss-wink-heart","fas-landmark","fas-laptop-house","fas-laptop-medical",
  "fas-laugh","fas-laugh-beam","fas-laugh-squint","fas-laugh-wink","fas-lightbulb",
  "fas-luggage-cart","fas-lungs","fas-lungs-virus","fas-mail-bulk","fas-map","fas-map-marked",
  "fas-map-marked-alt","fas-marker","fas-meh","fas-meh-blank","fas-meh-rolling-eyes",
  "fas-microscope","fas-mitten","fas-monument","fas-mortar-pestle","fas-mosque","fas-mug-hot",
  "fas-notes-medical","fas-pager","fas-paperclip","fas-passport","fas-paste","fas-pen",
  "fas-pen-alt","fas-pen-fancy","fas-pen-nib","fas-pen-square","fas-pencil-alt","fas-percent",
  "fas-phone","fas-phone-alt","fas-phone-slash","fas-phone-square","fas-phone-square-alt",
  "fas-phone-volume","fas-pills","fas-place-of-worship","fas-poop","fas-prescription-bottle",
  "fas-prescription-bottle-alt","fas-print","fas-procedures","fas-project-diagram",
  "fas-pump-medical","fas-radiation","fas-radiation-alt","fas-registered","fas-sad-cry",
  "fas-sad-tear","fas-save","fas-school","fas-search-dollar","fas-search-location",
  "fas-shield-virus","fas-ship","fas-shoe-prints","fas-shower","fas-shuttle-van","fas-sitemap",
  "fas-skull-crossbones","fas-sleigh","fas-smile","fas-smile-beam","fas-smile-wink",
  "fas-smoking","fas-smoking-ban","fas-snowflake","fas-snowman","fas-socks","fas-spa",
  "fas-star-of-life","fas-stethoscope","fas-sticky-note","fas-store","fas-store-alt",
  "fas-suitcase","fas-suitcase-rolling","fas-surprise","fas-swimmer","fas-swimming-pool",
  "fas-synagogue","fas-syringe","fas-table","fas-tablets","fas-tag","fas-tags","fas-tasks",
  "fas-taxi","fas-thermometer","fas-thumbtack","fas-tired","fas-tooth","fas-torii-gate",
  "fas-trademark","fas-tram","fas-tshirt","fas-tv","fas-umbrella-beach","fas-university",
  "fas-user-md","fas-user-nurse","fas-user-tie","fas-utensils","fas-vial","fas-vials",
  "fas-vihara","fas-virus","fas-virus-slash","fas-viruses","fas-wallet","fas-warehouse",
  "fas-water","fas-weight","fas-wheelchair","fas-wifi","fas-wind","fas-wine-glass",
  "fas-wine-glass-alt","fas-x-ray","zmdi-airplane","zmdi-album","zmdi-archive","zmdi-assignment-account",
  "zmdi-assignment-alert","zmdi-assignment-check","zmdi-assignment-o","zmdi-assignment",
  "zmdi-attachment-alt","zmdi-attachment","zmdi-audio","zmdi-badge-check","zmdi-balance-wallet",
  "zmdi-balance","zmdi-battery-flash","zmdi-battery","zmdi-bike","zmdi-boat","zmdi-book-image",
  "zmdi-book","zmdi-bookmark-outline","zmdi-bookmark","zmdi-brush","zmdi-bug","zmdi-bus",
  "zmdi-cake","zmdi-car-taxi","zmdi-car-wash","zmdi-car","zmdi-card-giftcard","zmdi-card-membership",
  "zmdi-card-travel","zmdi-card","zmdi-case","zmdi-chart-donut","zmdi-chart","zmdi-city-alt",
  "zmdi-city","zmdi-close-circle-o","zmdi-close-circle","zmdi-close","zmdi-cocktail",
  "zmdi-code-setting","zmdi-code-smartphone","zmdi-code","zmdi-coffee","zmdi-collection-bookmark",
  "zmdi-collection-case-play","zmdi-collection-folder-image","zmdi-collection-image-o",
  "zmdi-collection-image","zmdi-collection-item-1","zmdi-collection-item-2","zmdi-collection-item-3",
  "zmdi-collection-item-4","zmdi-collection-item-5","zmdi-collection-item-6","zmdi-collection-item-7",
  "zmdi-collection-item-8","zmdi-collection-item-9-plus","zmdi-collection-item-9",
  "zmdi-collection-item","zmdi-collection-music","zmdi-collection-pdf","zmdi-collection-plus",
  "zmdi-collection-speaker","zmdi-collection-text","zmdi-collection-video","zmdi-compass",
  "zmdi-cutlery","zmdi-delete","zmdi-dialpad","zmdi-dns","zmdi-drink","zmdi-edit",
  "zmdi-email-open","zmdi-email","zmdi-eye-off","zmdi-eye","zmdi-eyedropper","zmdi-favorite-outline",
  "zmdi-favorite","zmdi-fire","zmdi-flag","zmdi-flare","zmdi-flash-auto","zmdi-flash-off",
  "zmdi-flash","zmdi-flip","zmdi-flower-alt","zmdi-flower","zmdi-gas-station","zmdi-gesture",
  "zmdi-globe-alt","zmdi-globe-lock","zmdi-globe","zmdi-graduation-cap","zmdi-home",
  "zmdi-hospital-alt","zmdi-hospital","zmdi-hotel","zmdi-hourglass-alt","zmdi-hourglass-outline",
  "zmdi-hourglass","zmdi-http","zmdi-image","zmdi-inbox","zmdi-invert-colors-off",
  "zmdi-invert-colors","zmdi-key","zmdi-label-alt-outline","zmdi-label-alt","zmdi-label-heart",
  "zmdi-label","zmdi-labels","zmdi-lamp","zmdi-landscape","zmdi-library","zmdi-link",
  "zmdi-lock-open","zmdi-lock-outline","zmdi-lock","zmdi-mail-send","zmdi-mall","zmdi-map",
  "zmdi-money-box","zmdi-money","zmdi-movie-alt","zmdi-movie","zmdi-nature-people",
  "zmdi-nature","zmdi-navigation","zmdi-open-in-browser","zmdi-open-in-new","zmdi-palette",
  "zmdi-parking","zmdi-pizza","zmdi-plaster","zmdi-power-setting","zmdi-power","zmdi-print",
  "zmdi-puzzle-piece","zmdi-railway","zmdi-receipt","zmdi-roller","zmdi-ruler","zmdi-scissors",
  "zmdi-seat","zmdi-settings-square","zmdi-settings","zmdi-shape","zmdi-shield-check",
  "zmdi-shield-security","zmdi-shopping-basket","zmdi-shopping-cart-plus","zmdi-shopping-cart",
  "zmdi-storage","zmdi-store-24","zmdi-store","zmdi-subway","zmdi-sun","zmdi-tag",
  "zmdi-thumb-up","zmdi-ticket-star","zmdi-toll","zmdi-toys","zmdi-traffic","zmdi-truck",
  "zmdi-turning-sign","zmdi-wallpaper","zmdi-washing-machine"]
  ,
  /* Icons for role */
  role: ["fas-user-tie","fas-user-tag","fas-user-shield","fas-user-secret","fas-user-nurse",
  "fas-user-ninja","fas-user-minus","fas-user-md","fas-user-lock","fas-user-circle",
  "fas-user","fas-user-astronaut","fas-user-injured","fas-user-graduate","fas-user-alt",
  "im-user-male","im-user-female","zmdi-account-o","zmdi-account","zmdi-face","fas-user-friends",
  "fas-users","fas-wheelchair","fas-walking","fas-swimmer","fas-street-view","fas-snowboarding",
  "fas-skiing-nordic","fas-skiing","fas-skating","fas-running","fas-restroom","fas-pray",
  "fas-person-booth","fas-male","fas-hiking","fas-female","fas-child","fas-chalkboard-teacher",
  "fas-blind","fas-biking","fas-bed","fas-baby","fas-smile","fas-meh","fas-frown",
  "far-smile","far-meh","far-frown","fas-otter","fas-hippo","fas-dog","fas-spider",
  "fas-kiwi-bird","fas-horse-head","fas-horse","fas-frog","fas-fish","fas-feather-alt",
  "fas-feather","fas-dragon","fas-dove","fas-crow","fas-cat","fas-chess-rook","fas-chess-queen",
  "fas-chess-pawn","fas-chess-knight","fas-chess-king","fas-chess-bishop","fas-chess"]
};
//////////////////////////////////////////////////////
export default {
  queryIcons(key="starts") {
    return ICONS[key] || ICONS.starts
  }
}