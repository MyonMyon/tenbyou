var ENGINEVER = "v0.2.01 (alpha)"

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

	this.messageText = "";
	this.messageText2 = "";
	this.messageAltStyle = false;
	this.messageStart = 0;
	this.messageTime = 0;
}

ViewPort.prototype.showMessage = function(text, text2, time, altStyle) {
	this.messageText = text;
	this.messageText2 = text2 || "";
	this.messageStart = this.world.time;
	this.messageTime = time;
	this.messageAltStyle = altStyle || false;
}

ViewPort.prototype.fixedInt = function(value, width) {
	var wS = (value + "").length;
	for (var i = wS; i < width; ++i)
		value = "0" + value;
	return value; 
}

ViewPort.prototype.starText = function(value, char) {
	var text = "";
	for (var i = 0; i < Math.floor(value); ++i)
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
	this.context.strokeText(info, boundaryRight.x + 20 + tab * INFOTAB, boundaryRight.y + 30 + (line + 1) * INFOLINE);
	this.context.fillText(info, boundaryRight.x + 20 + tab * INFOTAB, boundaryRight.y + 30 + (line + 1) * INFOLINE);
}

ViewPort.prototype.starShow = function(line, sprite, count, parts) {
	var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
	var i;
	for (var i = 0; i < count; ++i)
		this.context.drawImage(imgGUI, sprite * IMAGEGUIWIDTH, 0, IMAGEGUIWIDTH, IMAGEGUIHEIGHT,
			boundaryRight.x + 16 + INFOTAB + (IMAGEGUIWIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 30 - this.zoom * 4 + (line + 1) * INFOLINE, IMAGEGUIWIDTH * this.zoom / 4, IMAGEGUIHEIGHT * this.zoom / 4);
	if (parts > 0) {
		this.context.drawImage(imgGUI, sprite * IMAGEGUIWIDTH, (4 - parts) * IMAGEGUIHEIGHT, IMAGEGUIWIDTH, IMAGEGUIHEIGHT,
			boundaryRight.x + 16 + INFOTAB + (IMAGEGUIWIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 30 - this.zoom * 4 + (line + 1) * INFOLINE, IMAGEGUIWIDTH * this.zoom / 4, IMAGEGUIHEIGHT * this.zoom / 4);		
	}
	for (var i = count + (parts > 0 ? 1 : 0); i < 9; ++i)
		this.context.drawImage(imgGUI, sprite * IMAGEGUIWIDTH, 4 * IMAGEGUIHEIGHT, IMAGEGUIWIDTH, IMAGEGUIHEIGHT,
			boundaryRight.x + 16 + INFOTAB + (IMAGEGUIWIDTH - 4) * i * this.zoom / 4, boundaryRight.y + 30 - this.zoom * 4 + (line + 1) * INFOLINE, IMAGEGUIWIDTH * this.zoom / 4, IMAGEGUIHEIGHT * this.zoom / 4);
	
}

ViewPort.prototype.draw = function() {

	this.context.textAlign = "left";

	this.context.fillStyle = "black";
	var boundaryStart = this.toScreen(-this.world.width / 2, -this.world.height / 2);
	var boundaryEnd = this.toScreen(this.world.width / 2, this.world.height / 2);
	this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);

	var stg = (this.world.time < this.world.stageInterval / 2) ? (this.world.stage - 1) : this.world.stage;
	var spell = (this.world.boss && this.world.boss.attackCurrent >= 0 && this.world.boss.attacks[this.world.boss.attackCurrent].spell);
	if (stg != 0) {
		imgBG.src = spell ? IMAGESTAGESPELL : this.world.stages[stg].background;
		var t = imgBG.height - (imgBG.width / this.world.width * this.world.height) - this.world.time * (spell ? 2 : this.world.stages[stg].backgroundSpeed) % (imgBG.height);
		this.context.drawImage(imgBG,
			0, Math.max(0, t),
			imgBG.width, imgBG.width / this.world.width * this.world.height,
			boundaryStart.x, boundaryStart.y - Math.min(0, t / (imgBG.width / this.world.width) * this.zoom),
			this.world.width * this.zoom, this.world.height * this.zoom);
		if (t < 0) {
			this.context.drawImage(imgBG,
				0, imgBG.height + t,
				imgBG.width, -t,
				boundaryStart.x, boundaryStart.y,
				this.world.width * this.zoom, - Math.min(0, t / (imgBG.width / this.world.width) * this.zoom));
		}
	}

	if (spell)
		for (var i = 0; i < 2; ++i)
			for (var j = 0; j < 2 + (boundaryEnd.x + boundaryStart.x) / (imgSpell.width * this.zoom / 4); ++j)
				this.context.drawImage(imgSpell,
					0, 0,
					imgSpell.width, imgSpell.height,
					boundaryStart.x + this.world.time * (i == 0 ? 6 : -6) % (imgSpell.width * this.zoom / 4) + (j - 1) * (imgSpell.width * this.zoom / 4),
					(boundaryStart.y * (0.25 + (1 - i) * 0.5) + boundaryEnd.y * (0.25 + i * 0.5)) - imgSpell.height / 2,
					imgSpell.width * this.zoom / 4, imgSpell.height * this.zoom / 4);

    this.context.globalAlpha = Math.max(Math.min(Math.min(this.world.time / 5, (this.world.stageInterval - this.world.time) / 5), 1), 0);
    this.context.fillRect(boundaryStart.x, boundaryStart.y, this.world.width * this.zoom, this.world.height * this.zoom);
	this.context.globalAlpha = 1;

	var tEntity = this.world.firstEntity;
	while (tEntity != null) {
		tEntity.draw(this.context);
		tEntity = tEntity.next;
		if (tEntity == this.world.firstEntity)
			break;
	}

	if (this.world.boss) {
		this.context.fillStyle = DESCCOLOR;
		this.context.font = DESCFONT;
		this.context.lineWidth = DESCSTROKE;
		this.context.strokeStyle = DESCSTROKECOLOR;
		this.context.textAlign = "left";

		this.context.strokeText(this.world.boss.title, boundaryStart.x + 10, boundaryStart.y + 20);
		this.context.fillText(this.world.boss.title, boundaryStart.x + 10, boundaryStart.y + 20);

		if (this.world.boss.attackCurrent >= 0)
			for (var i = 0; i < (this.world.boss.attackGroups.length - this.world.boss.attackGroupCurrent - 1); ++i)
				this.context.drawImage(imgGUI, 0, 0, IMAGEGUIWIDTH, IMAGEGUIHEIGHT,
				boundaryStart.x + 8 + (IMAGEGUIWIDTH - 4) * i * this.zoom / 4, boundaryStart.y + 24, IMAGEGUIWIDTH * this.zoom / 4, IMAGEGUIHEIGHT * this.zoom / 4);	

		if (this.world.boss.attackCurrent >= 0 && this.world.boss.attackCurrent < this.world.boss.attacks.length && this.world.boss.attacks[this.world.boss.attackCurrent].spell) {
			this.context.textAlign = "right";
			this.context.strokeText(this.world.boss.attacks[this.world.boss.attackCurrent].title, boundaryEnd.x - 10, boundaryStart.y + 20);
			this.context.fillText(this.world.boss.attacks[this.world.boss.attackCurrent].title, boundaryEnd.x - 10, boundaryStart.y + 20);
		}
	}

	this.context.lineJoin = "round";
	this.context.lineCap = "round";

	this.context.fillStyle = BACKGROUND;
	var x1 = boundaryStart.x;
	var x2 = boundaryEnd.x;

	var xN = this.canvas.width;
	var yN = this.canvas.height;

	var y1 = boundaryStart.y;
	var y2 = yN - boundaryStart.y;

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

	this.context.textAlign = "left";

	this.infoShow("HiScore", 0, 0);	this.infoShow(this.fixedInt(this.world.player.hiscore,11), 0, 1);
	this.infoShow("Score", 1, 0);		this.infoShow(this.fixedInt(this.world.player.score,11), 1, 1);

	this.infoShow("Lives", 3, 0);		this.starShow(3, 0, this.world.player.lives, this.world.player.lifeParts);
	this.infoShow("Bombs", 4, 0);		this.starShow(4, 1, this.world.player.bombs, this.world.player.bombParts);

	this.infoShow("Power", 6, 0);		this.infoShow(this.world.player.power.toFixed(2), 6, 1);
	this.infoShow("Points", 7, 0);		this.infoShow(this.world.player.points, 7, 1);
	this.infoShow("Graze", 8, 0);		this.infoShow(this.world.player.graze, 8, 1);

	this.context.textAlign = "center";
	if (ENGINEVERSHOW) {
		this.context.strokeText("Tenbyou " + ENGINEVER, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y);
		this.context.fillText("Tenbyou " + ENGINEVER, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y);		
	}
	this.context.strokeText("PROTO", (boundaryEnd.x + this.canvas.width) / 2, boundaryStart.y + 6 * this.zoom);
	this.context.fillText("PROTO", (boundaryEnd.x + this.canvas.width) / 2, boundaryStart.y + 6 * this.zoom);

	this.context.fillStyle = GAMETITLECOLOR;
	this.context.font = GAMETITLEFONT;
	this.context.lineWidth = GAMETITLESTROKE;
	this.context.strokeStyle = GAMETITLESTROKECOLOR;

	this.context.strokeText(GAMETITLE, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y - 40);
	this.context.fillText(GAMETITLE, (boundaryEnd.x + this.canvas.width) / 2, boundaryEnd.y - 40);

	if (this.world.time < (this.messageStart + this.messageTime)) {
    	this.context.globalAlpha = Math.min(Math.min((this.world.time - this.messageStart) / 10, (this.messageStart + this.messageTime - this.world.time) / 20), 1);
		this.context.strokeText(this.messageText, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2);
		this.context.fillText(this.messageText, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2);	
		
		if (this.messageAltStyle) {
			this.context.fillStyle = INFOCOLOR;
			this.context.font = INFOFONT;
			this.context.lineWidth = INFOSTROKE;
			this.context.strokeStyle = INFOSTROKECOLOR;
		}

		this.context.strokeText(this.messageText2, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2 + this.zoom * 10);
		this.context.fillText(this.messageText2, (boundaryStart.x + boundaryEnd.x) / 2, (boundaryStart.y + boundaryEnd.y) / 2 + this.zoom * 10);
    	this.context.globalAlpha = 1;
	}	

	if (this.world.pause) {
		this.context.fillStyle = "rgba(0, 0, 0, 0.5)";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = GAMETITLECOLOR;
		this.context.font = GAMETITLEFONT;
		this.context.lineWidth = GAMETITLESTROKE;
		this.context.strokeStyle = GAMETITLESTROKECOLOR;

		this.context.textAlign = "center";
		this.context.strokeText("Press Esc to continue", this.canvas.width / 2, this.canvas.height / 2);
		this.context.fillText("Press Esc to continue", this.canvas.width / 2, this.canvas.height / 2);

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
	this.stageInterval = 80;

	this.player = new Player(this);
	this.pause = false;
	this.drawHitboxes = false;
	this.boss = null;
	this.bossLast = false;

	this.difficulty = 0;
	this.stages = new Array();
	this.stages[0] = {title: "", desc: "", titleAppears: 0, background: ""}; //to be used for the spell spractice
	this.stage = 1;
	this.stageChangeTime = -1;

	setTimeout(function() { vp.world.init() }, 20);

	setInterval(function() { vp.world.tick() }, 40);
}

World.prototype.addStage = function(title, desc, titleAppears, background, backgroundSpeed) {	
	var n = this.stages.length;
	this.stages[n] = {title: title, desc: desc || "", titleAppears: titleAppears, background: background, backgroundSpeed: backgroundSpeed};
}

World.prototype.nextStage = function(timeout) {
	var timeout = timeout || 0;
	if (timeout == 0) {
		this.time = 0;
		var bonus = this.stage * 100000;
		vp.showMessage("Stage Clear!", "Bonus: " + bonus, this.stageInterval);
		this.player.score += bonus

		++this.stage;
		this.stageChangeTime = -1;

		if (this.stage >= this.stages.length) {
			this.pause = true;
			this.stage = 1;
		}
	} else {
		this.stageChangeTime = this.time + timeout;
	}
}

World.prototype.vectorLength = function(x, y) {
	return Math.sqrt(x * x + y * y);
}

World.prototype.distanceBetweenEntities = function(entity1, entity2) {
	return Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));
}

World.prototype.distanceBetweenPoints = function(point1x, point1y, point2x, point2y) {
	return Math.sqrt(Math.pow(point1x - point2x, 2) + Math.pow(point1y - point2y, 2));
}

World.prototype.init = function() {}

World.prototype.events = function() {}

World.prototype.setBoss = function(enemy, title, isLast) {
	this.boss = enemy;
	this.bossLast = isLast;
	enemy.title = title;
}

World.prototype.tick = function(interval) {
	if (!this.pause) {
		++this.time;
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
				++c;
				tEntity.flush(); //refreshing fixed coords
				tEntity = tEntity.next;
				if (tEntity == this.firstEntity) {
					this.countEntity = c;
					break;
				}
			}
		}
		if (this.time == this.stages[this.stage].titleAppears) {
			vp.showMessage("Stage " + this.stage + ": " + this.stages[this.stage].title, this.stages[this.stage].desc, 120, true);
		}
		if (this.time == this.stageChangeTime) {
			this.nextStage();
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
		if (tEntity instanceof Enemy && damageForEnemies > 0) {
			tEntity.hurt(damageForEnemies);
		}
		tEntity = tEntity.next;
		if (tEntity == this.firstEntity)
			break;
	};
}

World.prototype.replaceBonus = function(catWhat, smallWhat, catWith, smallWith) {
	var tEntity = this.firstEntity;
	while (tEntity != null) {
		if (tEntity instanceof Bonus && tEntity.cat == catWhat && tEntity.small == smallWhat) {
			tEntity.cat = catWith;
			tEntity.small = smallWith;
			var p = new Particle(this, tEntity.x, tEntity.y, 8, 8, true, false, 1, 0, 2);
			p.setVectors(null, null, null, tEntity.y1, null, tEntity.y2)
		}
		tEntity = tEntity.next;
		if (tEntity == this.firstEntity)
			break;
	}
}

World.prototype.splash = function(entity, count, area, time) {
	for (var i = 0; i < count; ++i) {
		new Particle(this, entity.x, entity.y, time + (Math.random() - 0.5) * time, 8, true, true, 1, 0);
	}
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

	++parentWorld.lastID;

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
	++this.lifetime;

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
	if (d != 0)
		this.setVectors(null, null,
			(target.x - this.x) / d * speed,
			(target.y - this.y) / d * speed,
			(target.x - this.x) / d * acc,
			(target.y - this.y) / d * acc)
}

Entity.prototype.headToPoint = function(targetX, targetY, speed, acc) {	
	var d = this.parentWorld.distanceBetweenPoints(this.x, this.y, targetX, targetY);
	if (d != 0)
		this.setVectors(null, null,
			(targetX - this.x) / d * speed,
			(targetY - this.y) / d * speed,
			(targetX - this.x) / d * acc,
			(targetY - this.y) / d * acc)
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
	this.lifeParts = 0;
	this.bombsDefault = 3;
	this.bombs = this.bombsDefault;
	this.bombParts = 0;

	this.spellCompleteTerms = true;

	this.powerMax = 4;
	this.power = 1;
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

	if (this.invulnTime > 0) {
		context.fillStyle = SHIELDCOLOR;
		context.beginPath();
		context.arc(ePos.x, ePos.y, (200 / (100 - this.invulnTime) + 2) * vp.zoom * this.width, 0, Math.PI*2, false);
		context.fill();
		context.closePath();
	}

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

}

Player.prototype.shoot = function() {
	var count = Math.floor(this.power);
	for (var i = 0; i < count; ++i) {
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
		this.spellCompleteTerms = false;
	}
}

Player.prototype.respawn = function() {
	this.spellCompleteTerms = false;

	new Particle(this.parentWorld, this.x, this.y, 30, 12, false, false, 0, 4, 4);
	this.parentWorld.splash(this, 20, 10, 16);

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
	for (var i = 0; i < 5; ++i) {
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
	this.cost = this.initialHealth * 100;
	this.title = "";
	this.drops = new Array();
	this.attacks = new Array();
	this.attackCurrent = -1;
	this.attackGroups = new Array();
	this.attackGroupCurrent = 0;
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

	if (this == this.parentWorld.boss && this.attackCurrent >= 0 && this.attackCurrent < this.attacks.length) {
		context.lineJoin = "square";
		context.lineCap = "butt";

		this.drawBossWheel(context, 22, 0, 1, BOSSWHEELCOLOR, 2);
		this.drawBossWheel(context, 24, 0, 1, BOSSWHEELCOLOR, 2);
		this.drawBossWheel(context, 25, 0, 1, BOSSWHEELCOLOR, 2);

		var sectionsS = this.attackGroups[this.attackGroupCurrent].spells;
		var sectionsN = this.attackGroups[this.attackGroupCurrent].nonspells;
		var thisSection = this.attackCurrent - this.attackGroups[this.attackGroupCurrent].start;

		var fullWheel = (sectionsS == 0 || sectionsN == 0);

		//this.drawBossWheel(context, 23, 0, this.initialHealth * this.health, BOSSHEALTHCOLOR, 7);
		for (var i = thisSection; i < sectionsN; ++i)
			this.drawBossWheel(context, 23,
				(i + ((i == thisSection) ? 1 - this.health / this.initialHealth : 0)) / sectionsN * (fullWheel ? 1 : 0.75),
				(i + 1) / sectionsN * (fullWheel ? 1 : 0.75),
				(i % 2 == 0) ? BOSSHEALTHCOLOR : BOSSHEALTHALTCOLOR, 7);
		for (var i = Math.max(thisSection - sectionsN, 0); i < sectionsS; ++i)
			this.drawBossWheel(context, 23,
				(i + ((i == (thisSection - sectionsN)) ? 1 - this.health / this.initialHealth : 0)) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
				(i + 1) / sectionsS * (fullWheel ? 1 : 0.25) + (fullWheel ? 0 : 0.75),
				(i % 2 == 0) ? BOSSHEALTHSPELLCOLOR : BOSSHEALTHSPELLALTCOLOR, 7);

		this.drawBossWheel(context, 24.5, this.lifetime / this.attacks[this.attackCurrent].time, 1, BOSSTIMERCOLOR, 3);
	}
}

Enemy.prototype.drawBossWheel = function(context, r, from, to, color, lineWidth) {
	if(from != to) {
		var ePos = vp.toScreen(this.x, this.y);
		context.lineWidth = lineWidth;
		context.strokeStyle = color;

		context.beginPath();
		context.arc(ePos.x, ePos.y, r * vp.zoom, - Math.PI / 2 + Math.PI * from * 2, - Math.PI / 2 + Math.PI * to * 2, false);
		context.stroke();
		context.closePath();	
	}
}

Enemy.prototype.create = Entity.prototype.create;
Enemy.prototype.remove = Entity.prototype.remove;

Enemy.prototype.flush = Entity.prototype.flush;
Enemy.prototype.baseStep = Entity.prototype.step;
Enemy.prototype.step = function() {
	this.baseStep();

	if (this.health <= 0) {
		for (var i = 0; i < this.drops.length; ++i)
			if (this.drops[i].reqDamage == 0 && this.attackCurrent == this.drops[i].attackID) {
				var a = Math.random() * Math.PI * 2;
				var r = Math.random() * this.initialHealth / 5;
				var p = this.drops[i].cat == "power" && this.parentWorld.player.power >= this.parentWorld.player.powerMax;

				new Bonus(this.parentWorld, this.x + Math.sin(a) * r, this.y + Math.cos(a) * r,
					p ? "point" : this.drops[i].cat, p ? false : this.drops[i].small, false);
			}

		if (this.attackCurrent == -1) {
			this.behaviorFinal();
			this.parentWorld.player.score += this.cost;
		} else {
			this.nextAttack();
		}
	}

	//remove from world
	if ((this.x > this.parentWorld.width / 2 + this.width * 2
		|| this.x < -this.parentWorld.width / 2 - this.width * 2
		|| this.y > this.parentWorld.height / 2 + this.width * 2
		|| this.y < -this.parentWorld.height / 2 - this.width * 2) && this != this.parentWorld.boss) //DO NOT DELETE BOSSES
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

	if (this.attackCurrent == -1)
		this.behavior();
	else if (this.attackCurrent < this.attacks.length) {
		this.attacks[this.attackCurrent].func(this);
		if (this.lifetime >= this.attacks[this.attackCurrent].time) {
			this.nextAttack();
		}
	}
}

Enemy.prototype.behavior = function() {}

Enemy.prototype.behaviorFinal = function() {
	new Particle(this.parentWorld, this.x, this.y, this.initialHealth < 100 ? 20 : 40, this.initialHealth < 100 ? 8 : 16, false, false, 0, this.initialHealth < 100 ? 4 : 8); //splash
	this.parentWorld.splash(this, this.initialHealth / 5, 8, 10);
	this.remove();
}

Enemy.prototype.onDamage = function(damage) {}
Enemy.prototype.onDestroy = function() {}

Enemy.prototype.hurt = function(damage) {

	if (this.parentWorld.boss != this || (this.attackCurrent >= 0 && this.attackCurrent < this.attacks.length))
		this.health -= damage;
	
	if (this.health > 0) {
		for (var i = 0; i < this.drops.length; ++i)
			if (this.drops[i].reqDamage != 0 && this.attackCurrent == this.drops[i].attackID && ((((this.initialHealth - this.health) % this.drops[i].reqDamage) < ((this.initialHealth - this.health - damage) % this.drops[i].reqDamage) && damage > 0) || damage > this.drops[i].reqDamage))
				new Bonus(this.parentWorld, this.x + Math.random() * 12 - 6, this.y + Math.random() * 12 - 6,
					(this.drops[i].cat == "power" && this.parentWorld.player.power >= this.parentWorld.player.powerMax) ? "point" : this.drops[i].cat, this.drops[i].small, false);
	}
	this.parentWorld.splash(this, damage, this.spriteWidth * 5, this.spriteWidth * 5);

	this.onDamage(damage);
}

Enemy.prototype.setCustomSpriteFile = Entity.prototype.setCustomSpriteFile;
Enemy.prototype.setSprite = Entity.prototype.setSprite;
Enemy.prototype.setVectors = Entity.prototype.setVectors;

Enemy.prototype.initHealth = function(health) {
	this.initialHealth = health;
	this.health = health;
}

Enemy.prototype.addDrops = function(cat, small, amount, reqDamage, afterAttack) {
	for (var i = 0; i < amount; ++i)	
		this.drops[this.drops.length] = {cat: cat, small: small, reqDamage: reqDamage || 0, attackID: afterAttack ? (this.attacks.length - 1) : -1};
}

Enemy.prototype.addAttack = function(spell, title, func, health, time, bonus, newGroup) {
	var n = this.attacks.length;
	var m = this.attackGroups.length - 1;

	if (n == 0 || (this.attacks[n - 1].spell && !spell) || newGroup)
		this.attackGroups[++m] = {start: n, nonspells: 0, spells: 0};
	if (spell)
		++this.attackGroups[m].spells;
	else
		++this.attackGroups[m].nonspells;

	this.attacks[n] = {spell: spell, title: title || "", func: func, health: health, time: time, bonus: bonus};
}

Enemy.prototype.nextAttack = function() {
	if (this.parentWorld.boss == this && this.attackCurrent >= 0 && this.attacks[this.attackCurrent].spell) {
		var bonus = parseInt((1 - (this.lifetime / this.attacks[this.attackCurrent].time)) * this.attacks[this.attackCurrent].bonus / 100, 10) * 100;
		if (this.health <= 0 && this.parentWorld.player.spellCompleteTerms && bonus > 0) {
			this.parentWorld.player.score += bonus;
			vp.showMessage("Spell Card Bonus!", bonus, 100)
		}
		else
			vp.showMessage("Bonus failed", null, 50);
	}

	var g = this.attackGroups[this.attackGroupCurrent];
	++this.attackCurrent;

	if (this.attackCurrent >= this.attacks.length) {
		this.behaviorFinal();		
		this.parentWorld.boss = null;
		if (this.parentWorld.bossLast)
			this.parentWorld.nextStage(50);
	} else {
		this.parentWorld.player.spellCompleteTerms = true;
		this.initHealth(this.attacks[this.attackCurrent].health);
	}

	if (g && (this.attackCurrent >= (g.start + g.nonspells + g.spells))) {
		++this.attackGroupCurrent;
	}

	this.parentWorld.clearField(0);

	this.lifetime = 0;
}

Enemy.prototype.headToEntity = Entity.prototype.headToEntity;
Enemy.prototype.headToPoint = Entity.prototype.headToPoint;

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
			++this.parentWorld.player.graze;
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
Projectile.prototype.headToPoint = Entity.prototype.headToPoint;

////////////////////////////////////////////////////////////////

function Bonus(parentWorld, x, y, cat, small, autoGather) {
	this.shifts = new Object(); //to redo
	this.shifts.power = 0;
	this.shifts.point = 1;
	this.shifts.bombs = 2;
	this.shifts.lives = 3;
	this.shifts.gauge = 4;

	this.create(parentWorld, x, y, 0, -2, 0, 0.1, 0);

	this.cat = cat;
	this.small = small;
	this.autoGather = autoGather || false;
}

Bonus.prototype.create = Entity.prototype.create;
Bonus.prototype.remove = Entity.prototype.remove;

Bonus.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);
	context.drawImage(imgBonus, (this.shifts[this.cat] | 0) * IMAGEBONUSWIDTH, (this.small ? IMAGEBONUSHEIGHT : 0),
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
				var fixedPower = this.parentWorld.player.power;
				this.parentWorld.player.gatherValue += (this.small ? 1 : 2);
				if (this.parentWorld.player.power < this.parentWorld.player.powerMax)
					this.parentWorld.player.power += (this.small ? 0.01 : 0.1);
				else
					this.parentWorld.player.score += (this.small ? 100 : 200);
				if (this.parentWorld.player.power > this.parentWorld.player.powerMax)
					this.parentWorld.player.power = this.parentWorld.player.powerMax;
				if (fixedPower < this.parentWorld.player.powerMax && this.parentWorld.player.power == this.parentWorld.player.powerMax) {
					this.parentWorld.clearField(0);
					this.parentWorld.replaceBonus("power", true, "point", false);
				}
			break;
			case "gauge":
				this.parentWorld.player.power += (this.small ? 1 : this.parentWorld.player.powerMax - 1);
				if (this.parentWorld.player.power > this.parentWorld.player.powerMax) {
					this.parentWorld.player.power = this.parentWorld.player.powerMax;
					this.parentWorld.clearField(0);
					this.parentWorld.replaceBonus("power", true, "point", false);
				}
			break;
			case "bombs":
				if (this.parentWorld.player.bombs <= 8)
					if (this.small)
						++this.parentWorld.player.bombParts;
					else
						++this.parentWorld.player.bombs;
				else {
					this.parentWorld.player.score += (this.small ? 300 : 500);
					this.parentWorld.player.bombs = 9;
					this.parentWorld.player.bombParts = 0;
				}
				if (this.parentWorld.player.bombParts >= 4) {
					this.parentWorld.player.bombParts -= 4;
					++this.parentWorld.player.bombs;
				}
			break;
			case "lives":
				if (this.parentWorld.player.lives <= 8)
					if (this.small)
						++this.parentWorld.player.lifeParts;
					else
						++this.parentWorld.player.lives;
				else {
					this.parentWorld.player.score += (this.small ? 500 : 2000);
					this.parentWorld.player.lives = 9;
					this.parentWorld.player.lifeParts = 0;
				}
				if (this.parentWorld.player.lifeParts >= 3) {
					this.parentWorld.player.lifeParts -= 3;
					++this.parentWorld.player.lives;
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
	var a = Math.random() * Math.PI * 2;
	var r = Math.random() + 0.1;
	this.create(parentWorld, x, y, moving ? r * Math.cos(a) : 0, moving ? r * Math.sin(a) : 0, 0, 0, width,
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
setInterval(function() { vp.draw() }, 40);	

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
var imgSpell = new Image();
imgSpell.src = IMAGESTAGESPELLSTRIP;

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
		vp.world.randomBonus();

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