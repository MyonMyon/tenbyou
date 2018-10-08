var ZOOM = 4;
var WIDTH = ZOOM * 256;
var HEIGHT = ZOOM * 192;
var SHIFT_X = ZOOM * -48;
var SHIFT_Y = 0;

var RES_FOLDER = "resources/";

var IMAGE = {
    player: {
        file: "player.png",
        width: 32,
        height: 32
    },
    projectile: {
        file: "projectile.png",
        width: 16,
        height: 16
    },
    bonus: {
        file: "bonus.png",
        width: 24,
        height: 24
    },
    enemy: {
        file: "enemy.png",
        width: 32,
        height: 32
    },
    particle: {
        file: "splash.png",
        width: 32,
        height: 32
    },
    gui: {
        file: "gui.png",
        width: 24,
        height: 24
    },
    menuBackground: {
        file: "menubg.png"
    },
    uiBackground: {
        file: "uibg.png"
    },
    spellBackground: {
        file: "bgspell.jpg"
    },
    spellStrip: {
        file: "scline.png"
    }
};

var SHIELD_COLOR = "rgba(160, 0, 0, 0.3)";
var HITBOX_COLOR = "rgba(192, 0, 0, 0.7)";

var BOSS_WHEEL_COLOR = "rgba(0, 0, 0, 0.8)";
var BOSS_TIMER_COLOR = "rgba(192, 255, 255, 0.8)";
var BOSS_TIMER_ALT_COLOR = "rgba(0, 192, 192, 0.8)";
var BOSS_HEALTH_COLOR = "rgba(255, 192, 192, 0.8)";
var BOSS_HEALTH_ALT_COLOR = "rgba(192, 144, 144, 0.8)";
var BOSS_HEALTH_SPELL_COLOR = "rgba(255, 0, 0, 0.8)";
var BOSS_HEALTH_SPELL_ALT_COLOR = "rgba(192, 0, 0, 0.8)";

var BORDER_WIDTH = 2;
var BORDER_COLOR = "#c00";

var BACKGROUND = "#023";

var FONT = {
    description: {
        font: "Unispace Rg",
        size: ZOOM * 3,
        color: "#c00",
        strokeWidth: 3,
        strokeColor: ZOOM > 3 ? "#fcc" : "transparent"
    },
    points: {
        font: "Unispace Rg",
        size: ZOOM * 3,
        color: "#fee",
        strokeWidth: 2,
        strokeColor: "#999",
        max: {
            color: "#ff0"
        }
    },
    info: {
        font: "Unispace Rg",
        size: ZOOM * 6,
        weight: "Bold",
        color: "#fee",
        strokeWidth: 3,
        strokeColor: ZOOM > 3 ? "#630" : "transparent",
        minor: {
            size: ZOOM * 3
        }
    },
    difficulty: {
        font: "Revue Normal",
        size: ZOOM * 7,
        color: "#fee",
        strokeWidth: 6,
        d0: {
            strokeColor: "#080"
        },
        d1: {
            strokeColor: "#088"
        },
        d2: {
            strokeColor: "#008"
        },
        d3: {
            strokeColor: "#808"
        }
    },
    title: {
        font: "Unispace Rg",
        size: ZOOM * 7,
        weight: "Bold",
        color: "#c00",
        strokeWidth: 4,
        strokeColor: ZOOM > 3 ? "#fcc" : "transparent",
        menu: {
            size: ZOOM * 15,
            strokeWidth: 10
        }
    },
    menu: {
        font: "Unispace Rg",
        size: ZOOM * 10,
        style: "Italic",
        color: "#c00",
        strokeWidth: 4,
        strokeColor: "#fcc",
        selected: {
            weight: "Bold",
            color: "#fff",
            strokeColor: "#c00"
        },
        compact: {
            size: ZOOM * 7,
            strokeWidth: 3
        }
    }
};

var INFO_LINE = ZOOM * 8;
var INFO_TAB = ZOOM * 40;

var GAME_TITLE = "Occasional Flaw";
var ENGINE_VER_SHOW = true;
var DEBUG_SHOW = true;

var MENU_TITLE_Y = ZOOM * 64;
var MENU_X = ZOOM * 12;
var MENU_Y = ZOOM * 88;
var MENU_H = ZOOM * 10;
var MENU_H_COMPACT = ZOOM * 7;
var MENU_VER_Y = ZOOM * 178;
var MENU_TEXT_ALIGN = "left";
var MENU_CAPACITY = 7;
var MENU_CAPACITY_COMPACT = 10;
var MENU_SCROLL_X = ZOOM * 10;
var MENU_SCROLL_W = ZOOM * 1;

var DIFF = ["Easy", "Normal", "Hard"];
