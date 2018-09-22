var ZOOM = 4;
var WIDTH = ZOOM * 256;
var HEIGHT = ZOOM * 192;
var SHIFT_X = ZOOM * -48;
var SHIFT_Y = 0;

var IMAGE_PLAYER = "resources/player.png";
var IMAGE_PLAYER_WIDTH = 32;
var IMAGE_PLAYER_HEIGHT = 32;

var IMAGE_PROJECTILE = "resources/projectile.png";
var IMAGE_PROJECTILE_WIDTH = 16;
var IMAGE_PROJECTILE_HEIGHT = 16;

var IMAGE_BONUS = "resources/bonus.png";
var IMAGE_BONUS_WIDTH = 24;
var IMAGE_BONUS_HEIGHT = 24;

var IMAGE_ENEMY = "resources/enemy.png";
var IMAGE_ENEMY_WIDTH = 32;
var IMAGE_ENEMY_HEIGHT = 32;

var IMAGE_PARTICLE = "resources/splash.png";
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

var DESC_FONT = (ZOOM * 3) + "px Unispace Rg";
var DESC_COLOR = "#c00";
var DESC_STROKE = 3;
var DESC_STROKE_COLOR = ZOOM > 3 ? "#fcc" : "transparent";

var IMAGE_STAGE_SPELL = "resources/bgspell.jpg";
var IMAGE_STAGE_SPELL_STRIP = "resources/scline.png";

var IMAGE_UI_BG = "resources/uibg.png";

var BORDER_WIDTH = 2;
var BORDER_COLOR = "#c00";

var BACKGROUND = "#023";

var IMAGE_GUI = "resources/gui.png";
var IMAGE_GUI_WIDTH = 24;
var IMAGE_GUI_HEIGHT = 24;

var INFO_FONT = "Bold " + (ZOOM * 6) + "px Unispace Rg";
var INFO_COLOR = "#fee";
var INFO_STROKE = 3;
var INFO_STROKE_COLOR = ZOOM > 3 ? "#630" : "transparent";
var INFO_LINE = ZOOM * 8;
var INFO_TAB = ZOOM * 40;

var GAME_TITLE = "Occasional Flaw";
var GAME_TITLE_FONT = "Bold " + (ZOOM * 7) + "px Unispace Rg";
var GAME_TITLE_COLOR = "#c00";
var GAME_TITLE_STROKE = 4;
var GAME_TITLE_STROKE_COLOR = ZOOM > 3 ? "#fcc" : "transparent";
var ENGINE_VER_SHOW = true;

var DIFF = ["AUTISM", "PROTO", "EASY"];
