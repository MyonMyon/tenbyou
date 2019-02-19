var ZOOM = 4;
var WIDTH = 256;
var HEIGHT = 192;
var SHIFT_X = -48;
var SHIFT_Y = 0;

var DIALOGUE_COLOR = "rgba(0, 0, 0, 0.5)";
var DIALOGUE_X = 10;
var DIALOGUE_Y = 150;
var DIALOGUE_W = 140;
var DIALOGUE_H = 32;
var DIALOGUE_MX = 5;
var DIALOGUE_MY = 5;

var RESOURCE_FOLDER = "resources/";
var SPRITE_FOLDER = RESOURCE_FOLDER + "img/";
var SPLASH = SPRITE_FOLDER + "splash.png";
var SPLASH_ZOOM = 0.25;
var CUT_IN_FOLDER_NAME = "cutin/";
var FONT_FOLDER = RESOURCE_FOLDER + "fonts/";
var SFX_FOLDER = RESOURCE_FOLDER + "sfx/";
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

var SFX = {
    menuNavigate: {
        file: "menu_nav.wav"
    },
    menuIn: {
        file: "menu_in.wav"
    },
    menuOut: {
        file: "menu_out.wav"
    },
    menuPause: {
        file: "menu_pause.wav"
    },
    menuPauseNavigate: {
        file: "menu_nav2.wav"
    },
    timer: {
        file: "timer.wav"
    },
    itemCollect: {
        file: "item_collect.wav"
    },
    playerPower: {
        file: "player_power.wav"
    },
    playerExtend: {
        file: "player_extend.wav"
    },
    playerShot: {
        noSeek: true,
        file: "player_shot.wav"
    },
    playerGraze: {
        file: "player_graze.wav"
    },
    playerHit: {
        file: "player_hit.wav"
    },
    enemyShot: {
        file: "enemy_shot.wav"
    },
    enemyHit: {
        noSeek: true,
        file: "enemy_hit.wav"
    },
    enemyHitLow: {
        noSeek: true,
        file: "enemy_hit_low.wav"
    },
    enemyDestroy: {
        file: "enemy_destroy.wav"
    },
    dialogueType: {
        noSeek: true,
        file: "diag_type.wav"
    }
};

var FONT_FILES = [{
        name: "Unispace Rg",
        file: "unispace_rg.ttf"
    }, {
        name: "Revue Normal",
        file: "revuen.ttf"
    }, {
        name: "Accuratist",
        file: "accuratist.ttf"
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
        font: "Accuratist",
        size: 6,
        color: "#c60",
        strokeWidth: 0.75,
        strokeColor: "#ff0"
    },
    character: {
        font: "Unispace Rg",
        weight: "Bold",
        size: 5,
        color: "#c00"
    },
    dialogue: {
        font: "Unispace Rg",
        size: 4,
        color: "#fff"
    },
    points: {
        font: "Unispace Rg",
        weight: "Bold",
        size: 3.5,
        point: {
            color: ["#fee", "#988"]
        },
        pointMax: {
            color: ["#ff0", "#990"]
        },
        power: {
            color: ["#f66", "#944"]
        },
        powerMax: {
            color: ["#f60", "#940"]
        }
    },
    upgrade: {
        font: "Accuratist",
        size: 8,
        color: ["#fff", "#ccc"],
        strokeWidth: 1,
        strokeColor: "#666"
    },
    info: {
        font: "Unispace Rg",
        size: 6,
        weight: "Bold",
        color: ["#fff", "#cba"],
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
        font: "Accuratist",
        size: 9,
        weight: "Bold",
        color: ["#0fc", "#0a9"],
        strokeWidth: 1,
        strokeColor: "#066",
        name: {
            size: 8
        },
        menu: {
            size: 12,
            color: ["#fff", "#fcc"],
            strokeWidth: 2,
            strokeColor: "#600"
        },
        fr: {
            size: 18,
            weight: "Bold"
        }
    },
    subtitle: {
        font: "Accuratist",
        size: 7,
        weight: "Bold",
        color: "#fee",
        strokeWidth: 0.75,
        strokeColor: "#630"
    },
    menu: {
        font: "Accuratist",
        size: 12,
        style: "Italic",
        color: ["#c99", "#c66"],
        strokeWidth: 1,
        strokeColor: "#633",
        selected: {
            weight: "Bold",
            color: ["#fff", "#fcc"],
            strokeColor: "#c00"
        },
        disabled: {
            color: "#ccc",
            strokeColor: "#666"
        },
        compact: {
            size: 7,
            strokeWidth: 0.75
        },
        description: {
            color: ["#fff", "#fcc"],
            strokeColor: "#c00",
            strokeWidth: 0.75,
            size: 8
        }
    },
    debug: {
        font: "monospace",
        size: 3,
        color: "#fff",
        strokeWidth: 0.5,
        strokeColor: "#000"
    }
};

var BONUS = {
    powerLarge: {
        itemLinePenalty: true,
        maxFallback: "point",
        power: 1,
        gatherValue: 2
    },
    power: {
        itemLinePenalty: true,
        maxFallback: "pointSmall",
        power: 0.1,
        gatherValue: 1
    },
    point: {
        itemLinePenalty: true,
        score: 200,
        points: 1,
        gatherValue: 2
    },
    pointSmall: {
        still: true,
        itemLinePenalty: true,
        score: 100,
        gatherValue: 1
    },
    bomb: {
        maxFallback: "s500",
        bombs: 1
    },
    bombPart: {
        maxFallback: "s300",
        bombParts: 1
    },
    life: {
        maxFallback: "s2k",
        lives: 1
    },
    lifePart: {
        maxFallback: "s2k",
        lifeParts: 1
    },
    gauge: {
        maxFallback: "point",
        power: 5,
        gatherValue: 3
    },
    debuff: {
        power: -1
    },
    debuffSmall: {
        power: -0.1
    },
    s300: {
        tech: true,
        itemLinePenalty: true,
        score: 300
    },
    s500: {
        tech: true,
        itemLinePenalty: true,
        score: 500
    },
    s2k: {
        tech: true,
        itemLinePenalty: true,
        score: 2000
    }
};

var INFO_LINE = 8;
var INFO_TAB = 40;

var FRANCHISE_TITLE = "Boundary Crossing:";
var GAME_TITLE = "Guiding Anomalous Patterns";
var GAME_ABBR = "bx01";

var MENU_TITLE_Y = 44;
var MENU_SUBTITLE_Y = 64;
var MENU_X = 12;
var MENU_Y = 88;
var MENU_H = 10;
var MENU_H_COMPACT = 7;
var MENU_OPTION_OFFSET_X = 80;
var MENU_SELECTION_OFFSET_X = 4;
var MENU_DESC_Y = 160;
var MENU_VER_Y = 178;
var MENU_TEXT_ALIGN = "left";
var MENU_CAPACITY = 7;
var MENU_CAPACITY_COMPACT = 10;
var MENU_SCROLL_X = 10;
var MENU_SCROLL_W = 1;

var DIFF = [{
        name: "Easy",
        letter: "E",
        description: "For the casual gamers"
    }, {
        name: "Normal",
        letter: "N",
        description: "For the normies (REEEEEEEEEEEEEEE)"
    }, {
        name: "Hard",
        letter: "H",
        description: "For the challengers"
    }, {
        name: "Lunatic",
        letter: "L",
        description: "This thing is CURSED"
    }, {
        name: "Extra",
        letter: "X",
        hidden: true
    }, {
        name: "Phantasm",
        letter: "P",
        hidden: true
    }];
