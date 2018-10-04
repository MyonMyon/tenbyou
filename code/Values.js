var ZOOM = 4;
var WIDTH = ZOOM * 256;
var HEIGHT = ZOOM * 192;
var SHIFT_X = ZOOM * -48;
var SHIFT_Y = 0;

var RES_FOLDER = "resources/";

var IMAGE_PLAYER = "player.png";
var IMAGE_PLAYER_WIDTH = 32;
var IMAGE_PLAYER_HEIGHT = 32;

var IMAGE_PROJECTILE = "projectile.png";
var IMAGE_PROJECTILE_WIDTH = 16;
var IMAGE_PROJECTILE_HEIGHT = 16;

var IMAGE_BONUS = "bonus.png";
var IMAGE_BONUS_WIDTH = 24;
var IMAGE_BONUS_HEIGHT = 24;

var IMAGE_ENEMY = "enemy.png";
var IMAGE_ENEMY_WIDTH = 32;
var IMAGE_ENEMY_HEIGHT = 32;

var IMAGE_PARTICLE = "splash.png";
var IMAGE_PARTICLE_WIDTH = 32;
var IMAGE_PARTICLE_HEIGHT = 32;

var SHIELD_COLOR = "rgba(160, 0, 0, 0.3)";
var HITBOX_COLOR = "rgba(255, 255, 255, 0.7)";

var BOSS_WHEEL_COLOR = "rgba(0, 0, 0, 0.8)";
var BOSS_TIMER_COLOR = "rgba(192, 255, 255, 0.8)";
var BOSS_TIMER_ALT_COLOR = "rgba(0, 192, 192, 0.8)";
var BOSS_HEALTH_COLOR = "rgba(255, 192, 192, 0.8)";
var BOSS_HEALTH_ALT_COLOR = "rgba(192, 144, 144, 0.8)";
var BOSS_HEALTH_SPELL_COLOR = "rgba(255, 0, 0, 0.8)";
var BOSS_HEALTH_SPELL_ALT_COLOR = "rgba(192, 0, 0, 0.8)";

var IMAGE_STAGE_SPELL = "bgspell.jpg";
var IMAGE_STAGE_SPELL_STRIP = "scline.png";

var IMAGE_MENU_BG = "menubg.png";
var IMAGE_UI_BG = "uibg.png";

var BORDER_WIDTH = 2;
var BORDER_COLOR = "#c00";

var BACKGROUND = "#023";

var IMAGE_GUI = "gui.png";
var IMAGE_GUI_WIDTH = 24;
var IMAGE_GUI_HEIGHT = 24;

var FONT = {
    description: {
        font: (ZOOM * 3) + "px Unispace Rg",
        color: "#c00",
        strokeWidth: 3,
        strokeColor: ZOOM > 3 ? "#fcc" : "transparent"
    },
    info: {
        font: "Bold " + (ZOOM * 6) + "px Unispace Rg",
        color: "#fee",
        strokeWidth: 3,
        strokeColor: ZOOM > 3 ? "#630" : "transparent"
    },
    title: {
        font: "Bold " + (ZOOM * 7) + "px Unispace Rg",
        color: "#c00",
        strokeWidth: 4,
        strokeColor: ZOOM > 3 ? "#fcc" : "transparent"
    },
    titleSelected: {
        font: "Bold " + (ZOOM * 7) + "px Unispace Rg",
        color: "#fff",
        strokeWidth: 4,
        strokeColor: "#c00"
    }
};

var INFO_LINE = ZOOM * 8;
var INFO_TAB = ZOOM * 40;

var GAME_TITLE = "Occasional Flaw";
var ENGINE_VER_SHOW = true;

var MENU_TITLE_Y = ZOOM * 64;
var MENU_X = ZOOM * 12;
var MENU_Y = ZOOM * 88;
var MENU_H = ZOOM * 8;
var MENU_VER_Y = ZOOM * 174;
var MENU_TEXT_ALIGN = "left";
var MENU_CAPACITY = 10;
var MENU_SCROLL_X = ZOOM * 10;
var MENU_SCROLL_W = ZOOM * 1;

var DIFF = ["Easy", "Normal", "Hard"];
