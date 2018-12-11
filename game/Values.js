var DEV_MODE = false;

var ZOOM = 4;
var WIDTH = 256;
var HEIGHT = 192;
var SHIFT_X = -48;
var SHIFT_Y = 0;

var RESOURCE_FOLDER = "resources/";
var SPRITE_FOLDER = RESOURCE_FOLDER + "img/";
var FONT_FOLDER = RESOURCE_FOLDER + "fonts/";
var ICON = SPRITE_FOLDER + "icon.png";

var SHIELD_COLOR = "rgba(160, 0, 0, 0.3)";
var HITBOX_COLOR = "rgba(255, 255, 255, 0.7)";
var HITBOX_STROKE_COLOR = "rgba(0, 0, 0, 0.7)";

var BOSS_WHEEL_WIDTH = 0.5;
var BOSS_WHEEL_COLOR = "rgba(0, 0, 0, 0.8)";

var BOSS_TIMER_WIDTH = 0.75;
var BOSS_TIMER_COLOR = "rgba(192, 255, 255, 0.8)";
var BOSS_TIMER_ALT_COLOR = "rgba(0, 192, 192, 0.8)";

var BOSS_HEALTH_WIDTH = 1.75;
var BOSS_HEALTH_COLOR = "rgba(255, 192, 192, 0.8)";
var BOSS_HEALTH_ALT_COLOR = "rgba(192, 144, 144, 0.8)";
var BOSS_HEALTH_SPELL_COLOR = "rgba(255, 0, 0, 0.8)";
var BOSS_HEALTH_SPELL_ALT_COLOR = "rgba(192, 0, 0, 0.8)";

var BORDER_WIDTH = 0.5;
var BORDER_COLOR = "#c00";

var BACKGROUND = "#023";

var FONT_FILES = [{
        name: "Unispace Rg",
        file: "unispace_rg.ttf"
    }, {
        name: "Revue Normal",
        file: "revuen.ttf"
    }];

var FONT = {
    description: {
        font: "Unispace Rg",
        size: 3,
        color: "#c00",
        strokeWidth: 0.75,
        strokeColor: "#fcc"
    },
    timer: {
        font: "Unispace Rg",
        size: 10,
        color: "#cff",
        strokeWidth: 1,
        strokeColor: "#000",
        fullBonus: {
            color: "#0cc"
        }
    },
    itemLine: {
        font: "Unispace Rg",
        size: 4,
        color: "#c60",
        strokeWidth: 0.75,
        strokeColor: "#ff0"
    },
    points: {
        font: "Unispace Rg",
        size: 3,
        strokeWidth: 0.5,
        strokeColor: "#999",
        point: {
            color: "#fee"
        },
        pointMax: {
            color: "#ff0"
        },
        power: {
            color: "#f66"
        },
        powerMax: {
            color: "#f60"
        }
    },
    info: {
        font: "Unispace Rg",
        size: 6,
        weight: "Bold",
        color: "#fee",
        strokeWidth: 0.75,
        strokeColor: "#630",
        minor: {
            size: 3
        },
        active: {
            color: "#ff0"
        }
    },
    difficulty: {
        font: "Revue Normal",
        size: 7,
        color: "#fee",
        strokeWidth: 1.5,
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
        size: 7,
        weight: "Bold",
        color: "#0fc",
        strokeWidth: 1,
        strokeColor: "#066",
        name: {
            size: 5
        },
        menu: {
            size: 12,
            color: "#fff",
            strokeWidth: 2,
            strokeColor: "#600"
        },
        fr: {
            size: 18,
            weight: "Bold"
        }
    },
    menu: {
        font: "Unispace Rg",
        size: 10,
        style: "Italic",
        color: "#c99",
        strokeWidth: 1,
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
            size: 7,
            strokeWidth: 0.75
        }
    }
};

var INFO_LINE = 8;
var INFO_TAB = 40;

var FRANCHISE_TITLE = "Boundary Crossing:";
var GAME_TITLE = "Guiding Anomalous Patterns";
var ENGINE_VERSION_SHOW = true;

var MENU_TITLE_Y = 44;
var MENU_SUBTITLE_Y = 64;
var MENU_X = 12;
var MENU_Y = 88;
var MENU_H = 10;
var MENU_H_COMPACT = 7;
var MENU_SELECTION_OFFSET_X = 4;
var MENU_VER_Y = 178;
var MENU_TEXT_ALIGN = "left";
var MENU_CAPACITY = 7;
var MENU_CAPACITY_COMPACT = 10;
var MENU_SCROLL_X = 10;
var MENU_SCROLL_W = 1;

var DIFF = [{
        name: "Easy",
        letter: "E"
    }, {
        name: "Normal",
        letter: "N"
    }, {
        name: "Hard",
        letter: "H"
    }, {
        name: "Lunatic",
        letter: "L"
    }, {
        name: "Extra",
        letter: "X",
        hidden: true
    }, {
        name: "Phantasm",
        letter: "P",
        hidden: true
    }];
