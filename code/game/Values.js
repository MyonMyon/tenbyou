var ZOOM = 4;
var WIDTH = ZOOM * 256;
var HEIGHT = ZOOM * 192;
var SHIFT_X = ZOOM * -48;
var SHIFT_Y = 0;

var RESOURCE_FOLDER = "resources/";
var SPRITE_FOLDER = RESOURCE_FOLDER + "img/";

var SHIELD_COLOR = "rgba(160, 0, 0, 0.3)";
var HITBOX_COLOR = "rgba(255, 255, 255, 0.7)";
var HITBOX_STROKE_COLOR = "rgba(0, 0, 0, 0.7)";

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
        strokeColor: ZOOM > 3 ? "#fcc" : "transparent",
    },
    timer: {
        font: "Unispace Rg",
        size: ZOOM * 10,
        color: "#cff",
        strokeWidth: 4,
        strokeColor: "#000",
        fullBonus: {
            color: "#0cc"
        }
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
        },
        d4: {
            strokeColor: "#800"
        },
        d5: {
            strokeColor: "#000"
        }
    },
    title: {
        font: "Unispace Rg",
        size: ZOOM * 7,
        weight: "Bold",
        color: "#0fc",
        strokeWidth: 4,
        strokeColor: ZOOM > 3 ? "#066" : "transparent",
        menu: {
            size: ZOOM * 15,
            color: "#fff",
            strokeWidth: 10,
            strokeColor: "#600"
        }
    },
    menu: {
        font: "Unispace Rg",
        size: ZOOM * 10,
        style: "Italic",
        color: "#c99",
        strokeWidth: 4,
        strokeColor: "#633",
        selected: {
            weight: "Bold",
            color: "#fff",
            strokeColor: "#c00"
        },
        disabled: {
            color: "#ccc",
            strokeColor: "#666"
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
var MENU_SELECTION_OFFSET_X = ZOOM * 4;
var MENU_VER_Y = ZOOM * 178;
var MENU_TEXT_ALIGN = "left";
var MENU_CAPACITY = 7;
var MENU_CAPACITY_COMPACT = 10;
var MENU_SCROLL_X = ZOOM * 10;
var MENU_SCROLL_W = ZOOM * 1;

var DIFF = [{
        name: "Easy",
        letter: "E"
    },{
        name: "Normal",
        letter: "N"
    },{
        name: "Hard",
        letter: "H"
    },{
        name: "Lunatic",
        letter: "L",
        hidden: true
    },{
        name: "Extra",
        letter: "X",
        hidden: true
    },{
        name: "Phantasm",
        letter: "P",
        hidden: true
    }];
