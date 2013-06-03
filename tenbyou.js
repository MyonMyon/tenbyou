var ENGINEVER = "v0.1.02 (alpha)"

function ViewPort() {	
	this.canvas = document.createElement("canvas");
	document.body.appendChild(this.canvas);
	this.canvas.width = WIDTH;
	this.canvas.height = HEIGHT;

	this.context = this.canvas.getContext("2d");

	this.shiftX = SHIFTX;
	this.shiftY = SHIFTY;
	this.zoom = ZOOM;

	this.centerX = this.canvas.width / 2;
	this.centerY = this.canvas.height / 2;

	this.world = new World();
}

ViewPort.prototype.fixedInt = function(value, width) {
	var wS = (value + "").length;
	for (var i = wS; i < width; i++)
		value = "0" + value;
	return value; 
}

ViewPort.prototype.starText = function(value, char) {
	var text = "";
	for (var i = 0; i < Math.floor(value); i++)
		text += char;
	return text; 
}

ViewPort.prototype.toScreen = function(worldX, worldY) {
	var value = {x: 0, y: 0};
	value.x = this.centerX + worldX * this.zoom + this.shiftX;
	value.y = this.centerY + worldY * this.zoom + this.shiftY;
	return value;
}

ViewPort.prototype.infoShow = function(info, line, tab) {
	var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
	this.context.fillText(info, boundaryRight.x + 20 + tab * INFOTAB, boundaryRight.y + 30 + line * INFOLINE);
	this.context.strokeText(info, boundaryRight.x + 20 + tab * INFOTAB, boundaryRight.y + 30 + line * INFOLINE);
}

ViewPort.prototype.starShow = function(line, sprite, count, parts) {
	var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
	var i;
	for (i = 0; i < Math.floor(count); i++)
		this.context.drawImage(imgGUI, sprite * IMAGEGUIWIDTH, 0, IMAGEGUIWIDTH, IMAGEGUIHEIGHT,
			boundaryRight.x + 20 + INFOTAB + IMAGEGUIWIDTH * i * this.zoom / 5, boundaryRight.y + 30 - this.zoom * 4 + line * INFOLINE, IMAGEGUIWIDTH * this.zoom / 5, IMAGEGUIHEIGHT * this.zoom / 5);
	if (parts > 0) {
		this.context.drawImage(imgGUI, sprite * IMAGEGUIWIDTH, (4 - parts) * IMAGEGUIHEIGHT, IMAGEGUIWIDTH, IMAGEGUIHEIGHT,
			boundaryRight.x + 20 + INFOTAB + IMAGEGUIWIDTH * i * this.zoom / 5, boundaryRight.y + 30 - this.zoom * 4 + line * INFOLINE, IMAGEGUIWIDTH * this.zoom / 5, IMAGEGUIHEIGHT * this.zoom / 5);		
	}
}

ViewPort.prototype.draw = function() {

	this.context.textAlign = "left";

	//this.context.fillStyle = STAGEBACKGROUND;
	var boundaryLeft = this.toScreen(-this.world.width / 2, -this.world.height / 2);
	//this.context.fillRect(boundaryLeft.x, boundaryLeft.y, this.world.width * this.zoom, this.world.height * this.zoom);
	this.context.drawImage(imgBG,
		0, Math.max(0, imgBG.height - (imgBG.width / this.world.width * this.world.height) - this.world.time / 8),
		imgBG.width, imgBG.width / this.world.width * this.world.height,
		boundaryLeft.x, boundaryLeft.y,
		this.world.width * this.zoom, this.world.height * this.zoom);

	this.context.lineJoin = "round";
	this.context.lineCap = "round";

	var tEntity = this.world.firstEntity;
	while (tEntity != null) {
			tEntity.draw(this.context);
			tEntity = tEntity.next;
			if (tEntity == this.world.firstEntity)
				break;
	};

	var boundaryTitle = this.toScreen(this.world.width / 2, this.world.height / 2);

	this.context.fillStyle = BACKGROUND;
	var x1 = boundaryLeft.x;
	var x2 = boundaryTitle.x;

	var xN = this.canvas.width;
	var yN = this.canvas.height;

	var y1 = boundaryLeft.y;
	var y2 = yN - boundaryLeft.y;

	this.context.fillRect(0, 0, xN, y1); //top plank
	this.context.fillRect(0, y2, xN, y1); //bottom plank
	this.context.fillRect(0, 0, x1, yN); //left plank
	this.context.fillRect(x2, 0, xN - x2, yN); //right plank

	this.context.drawImage(imgBGUI, 0, 0, imgBGUI.width, y1 / yN * imgBGUI.height, 0, 0, xN, y1);
	this.context.drawImage(imgBGUI, 0, y2 / yN * imgBGUI.height, imgBGUI.width, y1 / yN * imgBGUI.height, 0, y2, xN, y1);
	this.context.drawImage(imgBGUI, 0, 0, x1 / xN * imgBGUI.width, imgBGUI.height, 0, 0, x1, yN);
	this.context.drawImage(imgBGUI, x2 / xN * imgBGUI.width, 0, (xN - x2) / xN * imgBGUI.width, imgBGUI.height, x2, 0, xN - x2, yN);

	this.context.lineWidth = BORDERWIDTH;
	this.context.strokeStyle = BORDERCOLOR;

	this.context.strokeRect(x1, y1, x2 - x1, y2 - y1); //border

	this.context.fillStyle = INFOCOLOR;
	this.context.font = INFOFONT;
	this.context.lineWidth = INFOSTROKE;
	this.context.strokeStyle = INFOSTROKECOLOR;

	this.infoShow("HiScore", 0, 0);	this.infoShow(this.fixedInt(this.world.player.hiscore,11), 0, 1);
	this.infoShow("Score", 1, 0);		this.infoShow(this.fixedInt(this.world.player.score,11), 1, 1);

	var livesParts = Math.round(this.world.player.lives * 3) % 3;
	var bombsParts = Math.round(this.world.player.bombs * 4) % 4;

	this.infoShow("Lives", 3, 0);		this.starShow(3, 0, this.world.player.lives, livesParts);
	this.infoShow("Bombs", 4, 0);		this.starShow(4, 1, this.world.player.bombs, bombsParts);

	this.infoShow("Power", 6, 0);		this.infoShow(this.world.player.power.toFixed(2), 6, 1);
	this.infoShow("Points", 7, 0);		this.infoShow(this.world.player.points, 7, 1);
	this.infoShow("Graze", 8, 0);		this.infoShow(this.world.player.graze, 8, 1);

	this.infoShow("Gather", 10, 0);		this.infoShow(this.world.player.gatherValue, 10, 1);

	this.infoShow(".time", 13, 0);		this.infoShow(this.world.time, 13, 1);
	if (this.world.boss) {
		this.infoShow(this.world.boss.title, 14, 0);		this.infoShow(this.world.boss.health + "/" + this.world.boss.initialHealth, 14, 1);
	}

	this.context.textAlign = "center";
	if (ENGINEVERSHOW) {
		this.context.fillText("Tenbyou " + ENGINEVER, (boundaryTitle.x + this.canvas.width) / 2, boundaryTitle.y);		
		this.context.strokeText("Tenbyou " + ENGINEVER, (boundaryTitle.x + this.canvas.width) / 2, boundaryTitle.y);
	}

	this.context.fillStyle = GAMETITLECOLOR;
	this.context.font = GAMETITLEFONT;
	this.context.lineWidth = GAMETITLESTROKE;
	this.context.strokeStyle = GAMETITLESTROKECOLOR;

	this.context.fillText(GAMETITLE, (boundaryTitle.x + this.canvas.width) / 2, boundaryTitle.y - 40);
	this.context.strokeText(GAMETITLE, (boundaryTitle.x + this.canvas.width) / 2, boundaryTitle.y - 40);

	if (this.world.pause) {
		this.context.fillStyle = "rgba(0, 0, 0, 0.5)";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = GAMETITLECOLOR;
		this.context.textAlign = "center";
		this.context.fillText("Press Esc to continue", this.canvas.width / 2, this.canvas.height / 2);
		this.context.strokeText("Press Esc to continue", this.canvas.width / 2, this.canvas.height / 2);

	}
}

////////////////////////////////////////////////////////////////

function World() {
	this.width = 150;
	this.height = 180;
	this.lastID = 0;
	this.countEntity = 0;
	this.firstEntity = null;
	this.time = 0;

	this.player = new Player(this);
	this.pause = false;
	this.drawHitboxes = false;
	this.boss = null;

	setInterval(function() { vp.world.tick() }, 50);
}

World.prototype.vectorLength = function(x, y) {
	return Math.sqrt(x * x + y * y);
}

World.prototype.distanceBetweenEntities = function(entity1, entity2) {
	return Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));
}

World.prototype.events = function() {}

World.prototype.setBoss = function(enemy, title) {
	this.boss = enemy;
	enemy.title = title;
}

World.prototype.tick = function(interval) {
	if (!this.pause)	{
		this.time++;
		if (this.firstEntity != null) {
			var tEntity = this.firstEntity;
			while (1) {
				tEntity.step();
				tEntity = tEntity.next;
				if (tEntity == this.firstEntity)
					break;
			}
			var c = 0;
			while (1) {
				c ++;
				tEntity.flush(); //refreshing fixed coords
				tEntity = tEntity.next;
				if (tEntity == this.firstEntity) {
					this.countEntity = c;
					break;
				}
			}
		}
		if (this.boss && this.boss.health <= 0) {
			this.boss = null;
			this.clearField();
		}
		this.events();		
	}
}

World.prototype.randomBonus = function() {
	new Bonus(this, this.player.x, -this.height / 2 + 20, ["power", "point", "bombs", "lives", "gauge"][Math.floor(Math.random()*5)], Math.random() > 0.5, false)
}

World.prototype.clearField = function(damageForEnemies) {
	var tEntity = this.firstEntity;
	while (tEntity != null) {
		if (tEntity instanceof Projectile && !tEntity.playerside) {
			tEntity.remove();
			new Bonus(this, tEntity.x, tEntity.y, "point", true, true);				
		}
		if (tEntity instanceof Enemy) {
			tEntity.hurt(damageForEnemies);
		}
		tEntity = tEntity.next;
		if (tEntity == this.firstEntity)
			break;
	};
}

////////////////////////////////////////////////////////////////

function Entity(parentWorld, x, y, x1, y1, x2, y2, width, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
	this.create(parentWorld, x || 0, y || 0, x1 || 0, y1 || 0, x2 || 0, y2 || 0, width || 2, sprite || 0, frameCount || 1, animPeriod || 4, spriteWidth || 1, spriteDir || false);
}

Entity.prototype.create = function(parentWorld, x, y, x1, y1, x2, y2, width, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
	this.x = x || 0;
	this.y = y || 0;

	//speed
	this.x1 = x1 || 0;
	this.y1 = y1 || 0;

	//acceleration
	this.x2 = x2 || 0;
	this.y2 = y2 || 0;

	this.width = width || 2;

	this.fixedX = this.x;
	this.fixedY = this.y;

	this.lifetime = 0;

	this.sprite = sprite || 0;
	this.frameCount = frameCount || 1;
	this.animPeriod = animPeriod || 4;
	this.spriteWidth = spriteWidth || 1;
	this.spriteDir = spriteDir || false;

	this.customSprite = null;
	this.customSpriteWidth = 0;
	this.customSpriteHeight = 0;

	this.parentWorld = parentWorld;

	parentWorld.lastID++;

	this.next = parentWorld.firstEntity || this;
	this.prev = parentWorld.firstEntity != null ? parentWorld.firstEntity.prev : this;
	this.id = parentWorld.lastID;
	//console.info("Added Entity #" + this.id + " @ " + this.x + ";" + this.y);

	if (parentWorld.firstEntity != null) {
		parentWorld.firstEntity.prev.next = this;
		parentWorld.firstEntity.prev = this;
	}
	else
		parentWorld.firstEntity = this;
}

Entity.prototype.flush = function() {
	this.fixedX = this.x;
	this.fixedY = this.y;
}

Entity.prototype.step = function() {
	this.lifetime++;

	this.x1 += this.x2;
	this.y1 += this.y2;

	this.x += this.x1;
	this.y += this.y1;
}

Entity.prototype.draw = function(context) {
}

Entity.prototype.remove = function() {
	//console.info("Removed Entity #" + this.id + " @ " + this.x + ";" + this.y);
	this.next.prev = this.prev;
	this.prev.next = this.next;	
}

Entity.prototype.setCustomSpriteFile = function(source, frameWidth, frameHeight) {
	this.customSprite = new Image();
	this.customSprite.src = source;
	this.customSpriteWidth = frameWidth || 32;
	this.customSpriteHeight = frameHeight || 32;
}

Entity.prototype.setSprite = function(sprite, frameCount, animPeriod, spriteWidth, spriteDir) {	
	this.sprite = sprite || this.sprite;
	this.frameCount = frameCount || this.frameCount;
	this.animPeriod = animPeriod || this.animPeriod;
	this.spriteWidth = spriteWidth || this.spriteWidth;
	this.spriteDir = spriteDir || this.spriteDir;
}

Entity.prototype.setVectors = function(posX, posY, speedX, speedY, accX, accY) {	
	this.x = posX != null ? posX : this.x;
	this.y = posX != null ? posY : this.y;
	this.x1 = speedX != null ? speedX : this.x1;
	this.y1 = speedY != null ? speedY : this.y1;
	this.x2 = accX != null ? accX : this.x2;
	this.y2 = accY != null ? accY : this.y2;
}

Entity.prototype.headToEntity = function(target, speed, acc) {	
	var d = this.parentWorld.distanceBetweenEntities(this, target);
	this.setVectors(null, null,
		(target.x - this.x) / d * speed,
		(target.y - this.y) / d * speed,
		(target.x - this.x) / d * acc,
		(target.y - this.y) / d * acc)
}

////////////////////////////////////////////////////////////////

function Player(parentWorld) {
	this.create(parentWorld, 0, parentWorld.height / 2 - 5);
	
	this.setSprite(0, 4, 2, 1, false);
	this.width = 1;

	this.hiscore = 1000000;
	this.score = 0;
	
	this.livesDefault = 2;
	this.lives = this.livesDefault;
	this.bombsDefault = 3;
	this.bombs = this.bombsDefault;

	this.power = 1.00;
	this.points = 0;
	this.graze = 0;

	this.grazeWidth = 4;
	this.gatherWidthFinal = 5;
	this.gatherWidth = 20;
	this.gatherValue = 0;
	this.gatherValueExtremum = 0;

	this.focused = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.moveUp = false;
	this.moveDown = false;
	this.shooting = false;
	this.invulnTime = 0;
	this.autoGatherTime = 0;
}

Player.prototype.create = Entity.prototype.create;
Player.prototype.remove = Entity.prototype.remove;
Player.prototype.flush = Entity.prototype.flush;
Player.prototype.baseStep = Entity.prototype.step;
Player.prototype.step = function() {
	this.baseStep();
	var d = 5;
	if ((this.moveLeft || this.moveRight)
		&&(this.moveDown || this.moveUp)
		&&! (this.moveLeft && this.moveRight)
		&&! (this.moveDown && this.moveUp))
		d = Math.sqrt(10);

	if (this.focused)
		d /= 2;

	if (this.moveLeft)
		this.x -= d;
	if (this.moveRight)
		this.x += d;
	if (this.moveUp)
		this.y -= d;
	if (this.moveDown)
		this.y += d;

	if (this.x > this.parentWorld.width / 2 - 5)
		this.x = this.parentWorld.width / 2 - 5;
	if (this.x < -this.parentWorld.width / 2 + 5)
		this.x = -this.parentWorld.width / 2 + 5;
	if (this.y > this.parentWorld.height / 2 - 5)
		this.y = this.parentWorld.height / 2 - 5;
	if (this.y < -this.parentWorld.height / 2 + 5)
		this.y = -this.parentWorld.height / 2 + 5;

	if (this.shooting)
		this.shoot();

	if (this.invulnTime > 0)
		this.invulnTime--;


	if (this.y < -this.parentWorld.width / 3)
		this.autoGatherTime = 20;

	if (this.autoGatherTime > 0) {
		this.autoGatherTime--;
	}

	if (this.gatherValue > 0) {
		this.gatherValueExtremum = Math.max(this.gatherValue, this.gatherValueExtremum);
		this.gatherValue--;
	} 
	if (this.gatherValueExtremum >= 50 && (this.gatherValueExtremum - this.gatherValue > 20)) {
		if (this.gatherValueExtremum >= 150)
			new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "lives", false, false);
		else if (this.gatherValueExtremum >= 100)
			new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "lives", true, false);
		else if (this.gatherValueExtremum >= 75)
			new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "bombs", false, false);
		else
			new Bonus(this.parentWorld, this.x, -this.parentWorld.height / 2 + 20, "bombs", true, false);
		this.score += Math.floor(this.gatherValueExtremum / 10) * 1000;
		this.gatherValueExtremum = 0;
		this.gatherValue = 0;
	}

	if (this.score > this.hiscore)
		this.hiscore = this.score;
}

Player.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);

	context.drawImage(this.customSprite ? this.customSprite : imgPlayer,
		this.focused * (this.customSprite ? this.customSpriteWidth : IMAGEPLAYERWIDTH),
		Math.floor(this.lifetime / this.animPeriod) % (this.frameCount) * (this.customSprite ? this.customSpriteHeight : IMAGEPLAYERHEIGHT),
		this.customSprite ? this.customSpriteWidth : IMAGEPLAYERWIDTH,
		this.customSprite ? this.customSpriteHeight : IMAGEPLAYERHEIGHT,
		ePos.x - 4 * this.spriteWidth * vp.zoom,
		ePos.y - 4 * this.spriteWidth * vp.zoom,
		8 * this.spriteWidth * vp.zoom,
		8 * this.spriteWidth * vp.zoom);

	if (this.focused) {
		context.fillStyle = HITBOXCOLOR;
		context.beginPath();
		context.arc(ePos.x, ePos.y, 1 * vp.zoom * this.width, 0, Math.PI*2, false);
		context.fill();
		context.closePath();
	}

	if (this.invulnTime > 0) {
		context.fillStyle = SHIELDCOLOR;
		context.beginPath();
		context.arc(ePos.x, ePos.y, (200 / (100 - this.invulnTime) + 2) * vp.zoom * this.width, 0, Math.PI*2, false);
		context.fill();
		context.closePath();
	}

}

Player.prototype.shoot = function() {
	var count = Math.floor(this.power);
	for (var i = 0; i < count; i++) {
		var bullet = new Projectile(this.parentWorld, this.x + i * (this.focused ? 2 : 8) - (this.focused ? 1 : 4) * (count - 1), this.y + Math.abs(i + 0.5 - count / 2) * 6, 0, -8);
		bullet.width = 2;
		bullet.playerside = true;
		bullet.setSprite((count >= 3 && (i == 0 || i == count - 1)) ? 2 : 1, 2, 4);
	}
}

Player.prototype.bomb = function() {
	if (this.invulnTime <= 10 && this.bombs >= 1) {
		this.bombs--;
		this.invulnTime = 100;		
		var tEntity = this.parentWorld.firstEntity;
		this.parentWorld.clearField(20);
		this.autoGatherTime = 5;
	}
}

Player.prototype.respawn = function() {

	new Particle(this.parentWorld, this.x, this.y, 30, 12, false, false, 0, 4, 4);
	for (var i = 0; i < 20; i++)
		new Particle(this.parentWorld, this.x + (-0.5 + Math.random()) * this.width * 2, this.y + (-0.5 + Math.random()) * this.width * 2, 8, 8, true, true, 1, 0);

	if (this.lives < 1) {
		this.parentWorld.pause = true;
		this.lives = this.livesDefault;
		this.bombs = this.bombsDefault;
		this.score = this.score % 100 + 1;
		this.power = 1;
		this.graze = 0;
		this.points = 0;
	}
	else
		this.lives--;

	this.autoGatherTime = 0;
	this.invulnTime = 50;
	for (var i = 0; i < 5; i ++) {
		if (i == 2 && this.lives < 1)
			new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "gauge", false, false);
		else
			new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "power", false, false);
	}
	this.x = 0;
	this.y = this.parentWorld.height / 2 - 5;
	this.bombs = Math.max(this.bombsDefault, this.bombs);
	this.power = Math.max(this.power - 0.6, 1);
}

Player.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Player.prototype.setSprite = Entity.prototype.setSprite;
Player.prototype.setVectors = Entity.prototype.setVectors;

////////////////////////////////////////////////////////////////

function Enemy(parentWorld, x, y, x1, y1, x2, y2, width, health, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
	this.create(parentWorld, x, y, x1, y1, x2, y2, width, sprite,
		frameCount > 0 ? frameCount : (imgEnemy.height / IMAGEENEMYHEIGHT), animPeriod, spriteWidth, spriteDir);
	this.initialHealth = health || 20;
	this.health = this.initialHealth;
	this.drops = new Array();
	this.title = "";
}

Enemy.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);
	
	context.translate(ePos.x, ePos.y);
	if (this.spriteDir && this.x1 < 0)
		context.scale(-1, 1);

	context.drawImage(this.customSprite ? this.customSprite : imgEnemy,
		this.sprite * (this.customSprite ? this.customSpriteWidth : IMAGEENEMYWIDTH),
		Math.floor(this.lifetime / this.animPeriod) % (this.frameCount) * (this.customSprite ? this.customSpriteHeight : IMAGEENEMYHEIGHT),
		this.customSprite ? this.customSpriteWidth : IMAGEENEMYWIDTH,
		this.customSprite ? this.customSpriteHeight : IMAGEENEMYHEIGHT,
		- 4 * this.spriteWidth * vp.zoom,
		- 4 * this.spriteWidth * vp.zoom,
		8 * this.spriteWidth * vp.zoom,
		8 * this.spriteWidth * vp.zoom);

	if (this.spriteDir && this.x1 < 0)
		context.scale(-1, 1);
	context.translate(-ePos.x, -ePos.y);

	if (this.parentWorld.drawHitboxes) {
		context.fillStyle = "white";

		context.beginPath();

		context.arc(ePos.x, ePos.y, 1 * vp.zoom * this.width, 0, Math.PI*2, false);

		context.fill();
		context.closePath();
	}
}

Enemy.prototype.create = Entity.prototype.create;
Enemy.prototype.remove = Entity.prototype.remove;

Enemy.prototype.flush = Entity.prototype.flush;
Enemy.prototype.baseStep = Entity.prototype.step;
Enemy.prototype.step = function() {
	this.baseStep();

	//remove from world
	if ((this.x > this.parentWorld.width / 2 + this.width * 2
		|| this.x < -this.parentWorld.width / 2 - this.width * 2
		|| this.y > this.parentWorld.height / 2 + this.width * 2
		|| this.y < -this.parentWorld.height / 2 - this.width * 2) && this.health < 100) //DO NOT DELETE "BOSSES"
		this.remove();

	//collision with player
	if (this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player) <
		(this.width + this.parentWorld.player.width) && this.parentWorld.player.invulnTime == 0) {
		this.parentWorld.player.respawn();
	};

	//collision with bullets
	var tEntity = this.parentWorld.firstEntity;
	while (tEntity != null) {
		if (tEntity instanceof Projectile && tEntity.playerside) {
			if (this.parentWorld.distanceBetweenEntities(this, tEntity) < (this.width + tEntity.width)) {
				this.hurt(1);
				tEntity.remove();
			}
		}
		tEntity = tEntity.next;
		if (tEntity == this.parentWorld.firstEntity)
			break;
	};

	this.behavior();
}

Enemy.prototype.behavior = function() {}
Enemy.prototype.onDamage = function(damage) {}

Enemy.prototype.hurt = function(damage) {

	this.health -= damage;
	if (this.health <= 0) {
		this.parentWorld.player.score += this.initialHealth * 100;
		for (var i = 0; i < this.drops.length; i++)
			if (this.drops[i].reqDamage == 0)
				new Bonus(this.parentWorld, this.x + Math.random() * 12 - 6, this.y + Math.random() * 12 - 6, this.drops[i].cat, this.drops[i].small, false);
		new Particle(this.parentWorld, this.x, this.y, this.initialHealth < 100 ? 20 : 40, this.initialHealth < 100 ? 8 : 16, false, false, 0, this.initialHealth < 100 ? 4 : 8);
		for (var i = 0; i < this.initialHealth / 5; i++) {
			new Particle(this.parentWorld, this.x + (-0.5 + Math.random()) * this.width * 2, this.y + (-0.5 + Math.random()) * this.width * 2, Math.sqrt(this.initialHealth), 8, true, true, 1, 0);
		}
		this.remove();
	} else {
		for (var i = 0; i < this.drops.length; i++)
			if (this.drops[i].reqDamage != 0 && ((((this.initialHealth - this.health) % this.drops[i].reqDamage) < ((this.initialHealth - this.health - damage) % this.drops[i].reqDamage) && damage > 0) || damage > this.drops[i].reqDamage))
				new Bonus(this.parentWorld, this.x + Math.random() * 12 - 6, this.y + Math.random() * 12 - 6, this.drops[i].cat, this.drops[i].small, false);
		for (var i = 0; i < damage; i++)
			new Particle(this.parentWorld, this.x + (-0.5 + Math.random()) * this.width * 2, this.y + (-0.5 + Math.random()) * this.width * 2, Math.sqrt(this.initialHealth), 8, true, true, 1, 0);
	}

	this.onDamage(damage);
}

Enemy.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Enemy.prototype.setSprite = Entity.prototype.setSprite;
Enemy.prototype.setVectors = Entity.prototype.setVectors;

Enemy.prototype.initHealth = function(health) {
	this.initialHealth = health;
	this.health = health;
}

Enemy.prototype.addDrops = function(cat, small, amount, reqDamage) {
	for (var i = 0; i < amount; i++)	
		this.drops[this.drops.length] = {cat: cat, small: small, reqDamage: reqDamage || 0};
}

Enemy.prototype.headToEntity = Entity.prototype.headToEntity;

////////////////////////////////////////////////////////////////

function Projectile(parentWorld, x, y, x1, y1, x2, y2, width, playerside, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
	this.create(parentWorld, x, y, x1, y1, x2, y2, width,
		sprite || (this.playerside ? 1 : 0), frameCount > 0 ? frameCount : (imgProjectile.height / IMAGEPROJECTILEHEIGHT), animPeriod, spriteWidth, spriteDir);
	this.playerside = playerside || false;
	this.grazed = false;
}

Projectile.prototype.draw = function(context) {

	var ePos = vp.toScreen(this.x, this.y);

	context.translate(ePos.x, ePos.y);
	if (this.spriteDir)
		context.rotate(Math.atan2(this.y1, this.x1) - Math.PI / 2);

	context.drawImage(this.customSprite ? this.customSprite :imgProjectile,
		this.sprite * (this.customSprite ? this.customSpriteWidth : IMAGEPROJECTILEWIDTH),
		Math.floor(this.parentWorld.time / this.animPeriod) % this.frameCount * (this.customSprite ? this.customSpriteHeight : IMAGEPROJECTILEHEIGHT),
		this.customSprite ? this.customSpriteWidth : IMAGEPROJECTILEWIDTH,
		this.customSprite ? this.customSpriteHeight : IMAGEPROJECTILEHEIGHT,
		- this.width * vp.zoom,
		- this.width * vp.zoom,
		this.width * 2 * vp.zoom,
		this.width * 2 * vp.zoom);

	if (this.spriteDir)
		context.rotate(-Math.atan2(this.y1, this.x1) + Math.PI / 2);
	context.translate(-ePos.x, -ePos.y);

	if (this.parentWorld.drawHitboxes) {
		context.fillStyle = "white";

		context.beginPath();

		context.arc(ePos.x, ePos.y, 1 * vp.zoom * this.width, 0, Math.PI*2, false);

		context.fill();
		context.closePath();
	}
}

Projectile.prototype.create = Entity.prototype.create;
Projectile.prototype.remove = Entity.prototype.remove;

Projectile.prototype.flush = Entity.prototype.flush;
Projectile.prototype.baseStep = Entity.prototype.step;
Projectile.prototype.step = function() {
	this.baseStep();

	//remove from world
	if (this.x > this.parentWorld.width / 2 + this.width * 2
		|| this.x < -this.parentWorld.width / 2 - this.width * 2
		|| this.y > this.parentWorld.height / 2 + this.width * 2
		|| this.y < -this.parentWorld.height / 2 - this.width * 2)
		this.remove();

	if (!this.playerside) {
		//collision
		var d = this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player);
		if (d < (this.width + this.parentWorld.player.width)) {
			this.remove();
			if (this.parentWorld.player.invulnTime == 0)
				this.parentWorld.player.respawn();
		} else if (d < (this.width + this.parentWorld.player.grazeWidth) && !this.grazed && this.parentWorld.player.invulnTime == 0) {
			this.parentWorld.player.graze ++;
			new Particle(this.parentWorld, (this.x + this.parentWorld.player.x) / 2, (this.y + this.parentWorld.player.y) / 2, 4, 8, false, false, 1, 0, 1);
			this.grazed = true;
		}
	}

	this.behavior();
}

Projectile.prototype.behavior = function() {}

Projectile.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Projectile.prototype.setSprite = Entity.prototype.setSprite;
Projectile.prototype.setVectors = Entity.prototype.setVectors;
Projectile.prototype.headToEntity = Entity.prototype.headToEntity;

////////////////////////////////////////////////////////////////

function Bonus(parentWorld, x, y, cat, small, autoGather) {
	var lShift = 5;
	if (cat == "power") lShift = 0; else
	if (cat == "point") lShift = 1; else
	if (cat == "bombs") lShift = 2; else
	if (cat == "lives") lShift = 3; else
	if (cat == "gauge") lShift = 4;

	this.create(parentWorld, x, y, 0, -2, 0, 0.1, 0, lShift);

	this.cat = cat;
	this.small = small;
	this.autoGather = autoGather || false;
}

Bonus.prototype.create = Entity.prototype.create;
Bonus.prototype.remove = Entity.prototype.remove;


Bonus.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);
	context.drawImage(imgBonus, this.sprite * IMAGEBONUSWIDTH, (this.small ? IMAGEBONUSHEIGHT : 0),
		IMAGEBONUSWIDTH, IMAGEBONUSHEIGHT,
		ePos.x - 3 * vp.zoom,
		ePos.y - 3 * vp.zoom,
		6 * vp.zoom,
		6 * vp.zoom);
}

Bonus.prototype.flush = Entity.prototype.flush;
Bonus.prototype.baseStep = Entity.prototype.step;
Bonus.prototype.step = function() {
	this.baseStep();

	//remove from world
	if (this.y > this.parentWorld.height / 2 + 5)
		this.remove();

	//collision
	var d = this.parentWorld.distanceBetweenEntities(this, this.parentWorld.player);

	if (this.autoGather)
		this.headToEntity(this.parentWorld.player, 5, 0)

	if (d < this.parentWorld.player.gatherWidth || this.parentWorld.player.autoGatherTime > 0) {
		this.autoGather = true;
	}

	if (d < this.parentWorld.player.gatherWidthFinal) {
		this.remove();
		switch (this.cat) {
			case "point":
				this.parentWorld.player.points += (this.small ? 0 : 1);
				this.parentWorld.player.score += (this.small ? 100 : 200);
				this.parentWorld.player.gatherValue +=  (this.small ? 1 : 2);
			break;
			case "power":
				this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
				fixedPower = this.parentWorld.player.power;
				if (this.parentWorld.player.power < 4)
					this.parentWorld.player.power += (this.small ? 0.01 : 0.1); 
				else
					this.parentWorld.player.score += (this.small ? 100 : 200);
				if (this.parentWorld.player.power > 4)
					this.parentWorld.player.power = 4;
				if (fixedPower < 4 && this.parentWorld.player.power == 4) {
					var tEntity = this.parentWorld.firstEntity;
					while (tEntity != null) {
						if (tEntity instanceof Projectile && !tEntity.playerside) {
							tEntity.remove();
							new Bonus(this.parentWorld, tEntity.x, tEntity.y, "point", true, true);				
						}
						tEntity = tEntity.next;
						if (tEntity == this.parentWorld.firstEntity)
							break;
					};
				}
			break;
			case "gauge":
				this.parentWorld.player.power += (this.small ? 1 : 3);
				if (this.parentWorld.player.power > 4) {
					this.parentWorld.player.power = 4;
					var tEntity = this.parentWorld.firstEntity;
					while (tEntity != null) {
						if (tEntity instanceof Projectile && !tEntity.playerside) {
							tEntity.remove();
							new Bonus(this.parentWorld, tEntity.x, tEntity.y, "point", true, true);				
						}
						tEntity = tEntity.next;
						if (tEntity == this.parentWorld.firstEntity)
							break;
					};
				}
			break;
			case "bombs":
				if (this.parentWorld.player.bombs <= 9)
					this.parentWorld.player.bombs += (this.small ? 1/4 : 1); 
				else {
					this.parentWorld.player.score += (this.small ? 300 : 500); 
					this.parentWorld.player.bombs = 10;
				}
			break;
			case "lives":
				if (this.parentWorld.player.lives <= 9)
					this.parentWorld.player.lives += (this.small ? 1/3 : 1); 
				else {
					this.parentWorld.player.score += (this.small ? 500 : 2000); 
					this.parentWorld.player.lives = 10;
				}
			break;
		}
	}

}

Bonus.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Bonus.prototype.setSprite = Entity.prototype.setSprite;
Bonus.prototype.setVectors = Entity.prototype.setVectors;
Bonus.prototype.headToEntity = Entity.prototype.headToEntity;

////////////////////////////////////////////////////////////////

function Particle(parentWorld, x, y, removeAt, width, randomFrame, moving, sprite, frameCount, animPeriod, spriteWidth, spriteDir) {
	this.create(parentWorld, x, y, moving ? (-0.5 + Math.random()) * 3 : 0, moving ? (-Math.random()) * 4 : 0, 0, 0, width,
		sprite, frameCount > 0 ? frameCount : (imgParticle.height / IMAGEENEMYHEIGHT), animPeriod, spriteWidth, spriteDir);
	this.removeAt = removeAt || 20;
	this.frame = randomFrame ? Math.floor(Math.random() * imgParticle.height / IMAGEPARTICLEHEIGHT) : -1;
}

Particle.prototype.create = Entity.prototype.create;
Particle.prototype.remove = Entity.prototype.remove;


Particle.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);
	context.drawImage(imgParticle,
		this.sprite * IMAGEPARTICLEWIDTH,
		(this.frame == -1 ? (Math.floor(this.lifetime / this.animPeriod) % (imgParticle.height / IMAGEPARTICLEHEIGHT)) : this.frame) * IMAGEPARTICLEHEIGHT,
		IMAGEPARTICLEWIDTH, IMAGEPARTICLEHEIGHT,
		ePos.x - vp.zoom * this.width / 2,
		ePos.y - vp.zoom * this.width / 2,
		vp.zoom * this.width,
		vp.zoom * this.width);
}

Particle.prototype.flush = Entity.prototype.flush;
Particle.prototype.baseStep = Entity.prototype.step;
Particle.prototype.step = function() {
	this.baseStep();

	//remove from world
	if (this.lifetime > this.removeAt)
		this.remove();
}

Particle.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Particle.prototype.setSprite = Entity.prototype.setSprite;
Particle.prototype.setVectors = Entity.prototype.setVectors;
Particle.prototype.headToEntity = Entity.prototype.headToEntity;

////////////////////////////////////////////////////////////////

var vp = new ViewPort();
setInterval(function() { vp.draw() }, 50);	

var imgPlayer = new Image();
imgPlayer.src = IMAGEPLAYER;
var imgEnemy = new Image();
imgEnemy.src = IMAGEENEMY;
var imgBonus = new Image();
imgBonus.src = IMAGEBONUS;
var imgProjectile = new Image();
imgProjectile.src = IMAGEPROJECTILE;
var imgParticle = new Image();
imgParticle.src = IMAGEPARTICLE;

var imgBG = new Image();
imgBG.src = IMAGESTAGE;
var imgBGUI = new Image();
imgBGUI.src = IMAGEUIBG;
var imgGUI = new Image();
imgGUI.src = IMAGEGUI;

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);

function keyDown(event) {	
	if (event.keyCode == 37)
		vp.world.player.moveLeft = true;
	if (event.keyCode == 39)
		vp.world.player.moveRight = true;

	if (event.keyCode == 38)
		vp.world.player.moveUp = true;
	if (event.keyCode == 40)
		vp.world.player.moveDown = true;

	if (event.keyCode == 16)
		vp.world.player.focused = true;

	if (event.keyCode == "Z".charCodeAt(0))
		vp.world.player.shooting = true;

	if (event.keyCode == "X".charCodeAt(0))
		vp.world.player.bomb();

	if (event.keyCode == "A".charCodeAt(0))
		vp.world.clearField(100);

	if (event.keyCode == "S".charCodeAt(0))
		vp.world.time = vp.world.time + 100;

	if (event.keyCode == "D".charCodeAt(0))
		vp.world.drawHitboxes = !vp.world.drawHitboxes;

	if (event.keyCode == 27)
		vp.world.pause = !vp.world.pause;

}

function keyUp(event) {	
	if (event.keyCode == 37)
		vp.world.player.moveLeft = false;
	if (event.keyCode == 39)
		vp.world.player.moveRight = false;

	if (event.keyCode == 38)
		vp.world.player.moveUp = false;
	if (event.keyCode == 40)
		vp.world.player.moveDown = false;

	if (event.keyCode == 16)
		vp.world.player.focused = false;

	if (event.keyCode == "Z".charCodeAt(0))
		vp.world.player.shooting = false;
}