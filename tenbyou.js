var ENGINEVER = "v0.0.19 (dev)"

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
	for(i = wS; i < width; i++)
		value = "0" + value;
	return value; 
}

ViewPort.prototype.starText = function(value, char) {
	var text = "";
	for(i = 0; i < value; i++)
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
	this.context.fillStyle = INFOCOLOR;
	this.context.font = INFOFONT;
	var boundaryRight = this.toScreen(this.world.width / 2, -this.world.height / 2);
	this.context.fillText(info, boundaryRight.x + 20 + tab * INFOTAB, boundaryRight.y + 30 + line * INFOLINE);
}

ViewPort.prototype.draw = function() {

	this.context.textAlign = "left";

	//this.context.fillStyle = STAGEBACKGROUND;
	var boundaryLeft = this.toScreen(-this.world.width / 2, -this.world.height / 2);
	//this.context.fillRect(boundaryLeft.x, boundaryLeft.y, this.world.width * this.zoom, this.world.height * this.zoom);
	this.context.drawImage(imgBG, boundaryLeft.x, boundaryLeft.y, this.world.width * this.zoom, this.world.height * this.zoom);

	this.context.lineJoin = "round";
	this.context.lineCap = "round";

	var tEntity = this.world.firstEntity;
	while (1 && tEntity != null) {
			tEntity.draw(this.context);
			tEntity = tEntity.next;
			if (tEntity == this.world.firstEntity)
				break;
	};

	var boundaryTitle = this.toScreen(this.world.width / 2, this.world.height / 2);

	this.context.fillStyle = BACKGROUND;
	this.context.fillRect(0, 0, this.canvas.width, boundaryLeft.y); //top plank
	this.context.fillRect(0, this.canvas.height - boundaryLeft.y, this.canvas.width, boundaryLeft.y); //bottom plank
	this.context.fillRect(0, 0, boundaryLeft.x, this.canvas.height); //left plank
	this.context.fillRect(boundaryTitle.x, 0, this.canvas.width - boundaryTitle.x, this.canvas.height); //left plank

	this.infoShow("HiScore:", 0, 0);	this.infoShow(this.fixedInt(this.world.player.hiscore,11), 0, 1);
	this.infoShow("Score:", 1, 0);		this.infoShow(this.fixedInt(this.world.player.score,11), 1, 1);

	var livesParts = Math.round(this.world.player.lives * 3) % 3;
	var bombsParts = Math.round(this.world.player.bombs * 4) % 4;

	this.infoShow("Lives:", 3, 0);		this.infoShow(this.starText(this.world.player.lives,"♥") + this.starText(livesParts,"•"), 3, 1);
	this.infoShow("Bombs:", 4, 0);		this.infoShow(this.starText(this.world.player.bombs,"¤") + this.starText(bombsParts,"•"), 4, 1);

	this.infoShow("Power:", 6, 0);		this.infoShow(this.world.player.power.toFixed(2), 6, 1);
	this.infoShow("Points:", 7, 0);		this.infoShow(this.world.player.points, 7, 1);
	this.infoShow("Graze:", 8, 0);		this.infoShow(this.world.player.graze, 8, 1);

	this.infoShow("Gather:", 10, 0);	this.infoShow(this.world.player.gatherValue, 10, 1);

	this.context.textAlign = "center";
	this.context.font = INFOFONT;
	if (ENGINEVERSHOW)
		this.context.fillText("Tenbyou Engine " + ENGINEVER, (boundaryTitle.x + this.canvas.width) / 2, boundaryTitle.y);

	this.context.fillStyle = GAMETITLECOLOR;
	this.context.font = GAMETITLEFONT;
	this.context.fillText(GAMETITLE, (boundaryTitle.x + this.canvas.width) / 2, boundaryTitle.y - 40);

	

	if (this.world.pause) {
		this.context.fillStyle = "rgba(128, 128, 128, 0.5)";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = GAMETITLECOLOR;
		this.context.textAlign = "center";
		this.context.fillText("PAUSED!", this.canvas.width / 2, this.canvas.height / 2);

	}
}

function World() {
	this.width = 150;
	this.height = 180;
	this.lastID = 0;
	this.countEntity = 0;
	this.firstEntity = null;
	this.time = 0;

	this.player = new Player(this);
	this.pause = false;

	this.creeps = 100;

	setInterval(function() { vp.world.tick() }, 50);
}

World.prototype.tick = function(interval) {
	if(!this.pause)	{
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
		if(Math.random() < 0.04 && this.creeps > 0) {
			new Enemy(this, Math.random() * (this.width - 40) - this.width / 2 + 20, -this.height / 2 + 20, 0, 0.1, 0, 0, 5, 20);
			this.creeps--;
		} else if(this.creeps == 0) {
			//var b = new Boss(this, 0, -this.height - 20, 300);
			//b.moveTo(0, -20, 0.1);
			this.creeps = -1;
		}
	}
}

function Entity(parentWorld, x, y, x1, y1, x2, y2, width) {
	this.create(parentWorld, x || 0, y || 0, x1 || 0, y1 || 0, x2 || 0, y2 || 0, width || 2);
}

Entity.prototype.create = function(parentWorld, x, y, x1, y1, x2, y2, width) {
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

	this.parentWorld = parentWorld;

	parentWorld.lastID++;

	this.next = parentWorld.firstEntity || this;
	this.prev = parentWorld.firstEntity != null ? parentWorld.firstEntity.prev : this;
	this.id = parentWorld.lastID;
	console.info("Added Entity #" + this.id + " @ " + this.x + ";" + this.y);

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
	var tEntity = this.next;
	this.nearestEntity = this.next;

	this.x1 += this.x2;
	this.y1 += this.y2;

	this.x += this.x1;
	this.y += this.y1;
}

Entity.prototype.draw = function(context) {
}

Entity.prototype.remove = function() {
	console.info("Removed Entity #" + this.id + " @ " + this.x + ";" + this.y);
	this.next.prev = this.prev;
	this.prev.next = this.next;
}

function Player(parentWorld) {
	this.create(parentWorld, 0, parentWorld.height / 2 - 5, 0, 0, 0, 0, 1, true);

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
	if((this.moveLeft || this.moveRight)
		&&(this.moveDown || this.moveUp)
		&&! (this.moveLeft && this.moveRight)
		&&! (this.moveDown && this.moveUp))
		d = Math.sqrt(10);

	if(this.focused)
		d /= 2;

	if(this.moveLeft)
		this.x -= d;
	if(this.moveRight)
		this.x += d;
	if(this.moveUp)
		this.y -= d;
	if(this.moveDown)
		this.y += d;

	if(this.x > this.parentWorld.width / 2 - 5)
		this.x = this.parentWorld.width / 2 - 5;
	if(this.x < -this.parentWorld.width / 2 + 5)
		this.x = -this.parentWorld.width / 2 + 5;
	if(this.y > this.parentWorld.height / 2 - 5)
		this.y = this.parentWorld.height / 2 - 5;
	if(this.y < -this.parentWorld.height / 2 + 5)
		this.y = -this.parentWorld.height / 2 + 5;

	if(this.shooting)
		this.shoot();

	if(this.invulnTime > 0)
		this.invulnTime--;


	if(this.y < -this.parentWorld.width / 3)
		this.autoGatherTime = 20;

	if(this.autoGatherTime > 0) {
		this.autoGatherTime--;
	}

	if(this.gatherValue > 0) {
		this.gatherValueExtremum = Math.max(this.gatherValue, this.gatherValueExtremum);
		this.gatherValue--;
	} else if(this.gatherValueExtremum > 50) {
		if(this.gatherValueExtremum >= 100)
			new Bonus(this.parentWorld, this.x, -this.parentWorld.height + 20, "lives", true, false);
		else
			new Bonus(this.parentWorld, this.x, -this.parentWorld.height + 20, "bombs", true, false);
		this.gatherValueExtremum = 0;
	}

	if (this.score > this.hiscore)
		this.hiscore = this.score;
}

Player.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);

	if(this.parentWorld.time % 2 == 0 || this.invulnTime == 0)
	context.drawImage(imgPlayer, ePos.x - 4 * vp.zoom, ePos.y - 4 * vp.zoom, 8 * vp.zoom, 8 * vp.zoom);

	if(this.focused) {
		context.fillStyle = "white";
		context.strokeStyle = "gray";
		context.lineWidth = 1;

		context.beginPath();

		context.arc(ePos.x, ePos.y, 1 * vp.zoom * this.width, 0, Math.PI*2, false);

		context.fill();
		context.stroke();
		context.closePath();
	}

}

Player.prototype.shoot = function() {
	var count = Math.floor(this.power);
	for (i = 0; i < count; i++)
		new Projectile(this.parentWorld, this.x + i * (this.focused ? 2 : 8) - (this.focused ? 1 : 4) * (count - 1), this.y + Math.abs(i + 0.5 - count / 2) * 6, 0, -8, 0, 0, 2, true);
}

Player.prototype.bomb = function() {
	if(this.invulnTime == 0 && this.bombs >= 1) {
		this.bombs--;
		this.invulnTime = 100;		
		var tEntity = this.parentWorld.firstEntity;
		while (1 && tEntity != null) {
			if(tEntity instanceof Projectile && !tEntity.playerside) {
				tEntity.remove();
				new Bonus(this.parentWorld, tEntity.x, tEntity.y, "point", true, true);				
			}
			if(tEntity instanceof Enemy) {
				tEntity.hurt(20);
			}
			tEntity = tEntity.next;
			if (tEntity == this.parentWorld.firstEntity)
				break;
		};
	}
}

Player.prototype.respawn = function() {
	if(this.lives < 1) {
		this.parentWorld.pause = true;
		this.lives = this.livesDefault;
		this.bombs = this.bombsDefault;
		this.score = this.score % 100 + 1;
		this.power = 1;
	}
	else
		this.lives--;

	this.autoGatherTime = 0;
	this.invulnTime = 50;
	for(i = 0; i < 5; i ++) {
		if(i == 2 && this.lives < 1)
			new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "gauge", false, false);
		else
			new Bonus(this.parentWorld, this.x + (i - 2) * 20, this.y, "power", false, false);
	}
	this.x = 0;
	this.y = this.parentWorld.height / 2 - 5;
	this.bombs = Math.max(this.bombsDefault, this.bombs);
	this.power = Math.max(this.power - 0.6, 1);
}

function Enemy(parentWorld, x, y, x1, y1, x2, y2, width, health) {
	this.create(parentWorld, x, y, x1, y1, x2, y2, width);
	this.initialHealth = health || 20;
	this.health = this.initialHealth;
}

Enemy.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);
	
	context.drawImage(imgEnemy, ePos.x - 4 * vp.zoom, ePos.y - 4 * vp.zoom, 8 * vp.zoom, 8 * vp.zoom);
}

Enemy.prototype.create = Entity.prototype.create;
Enemy.prototype.remove = Entity.prototype.remove;

Enemy.prototype.flush = Entity.prototype.flush;
Enemy.prototype.baseStep = Entity.prototype.step;
Enemy.prototype.step = function() {
	this.baseStep();

	//remove from world
	if (this.x > this.parentWorld.width / 2
		|| this.x < -this.parentWorld.width / 2
		|| this.y > this.parentWorld.height / 2
		|| this.y < -this.parentWorld.height / 2)
		this.remove();

	//collision with player
	var d = Math.sqrt(Math.pow(this.parentWorld.player.x - this.x, 2) + Math.pow(this.parentWorld.player.y - this.y, 2)) 
	if (d < (this.width + this.parentWorld.player.width) && this.parentWorld.player.invulnTime == 0) {
		this.parentWorld.player.respawn();
	};

	//collision with bullets
	var tEntity = this.parentWorld.firstEntity;
	while (1 && tEntity != null) {
		if (tEntity instanceof Projectile && tEntity.playerside) {
			d = Math.sqrt(Math.pow(tEntity.x - this.x, 2) + Math.pow(tEntity.y - this.y, 2)) 
			if(d < (this.width + tEntity.width)) {
				this.hurt(1);
				tEntity.remove();
			}
		}
		tEntity = tEntity.next;
		if (tEntity == this.parentWorld.firstEntity)
			break;
	};
	if(Math.random() < 0.05)
		new Projectile(this.parentWorld, this.x, this.y, 0, 2 + Math.random() * 2);

}

Enemy.prototype.hurt = function(damage) {
	this.health -= damage;
	if (this.health <= 0) {
		this.parentWorld.player.score += this.initialHealth * 100;
		for(i = 0; i < (this.initialHealth / 5); i++) {			
			var bType = (Math.random() > 0.5) ? "point" : "power";
			new Bonus(this.parentWorld, this.x + Math.random() * 12 - 6, this.y + Math.random() * 12 - 6, bType, bType == "power" && Math.random() < 0.95, false);
		}
		this.remove();
	}
}

function Projectile(parentWorld, x, y, x1, y1, x2, y2, width, playerside) {
	this.create(parentWorld, x, y, x1, y1, x2, y2, width);
	this.playerside = playerside;
}

Projectile.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);
	context.drawImage(imgProjectile, this.playerside ? 16 : 0, 0, 16, 16, ePos.x - 2 * vp.zoom, ePos.y - 2 * vp.zoom, 4 * vp.zoom, 4 * vp.zoom);
}

Projectile.prototype.create = Entity.prototype.create;
Projectile.prototype.remove = Entity.prototype.remove;

Projectile.prototype.flush = Entity.prototype.flush;
Projectile.prototype.baseStep = Entity.prototype.step;
Projectile.prototype.step = function() {
	this.baseStep();

	//remove from world
	if (this.x > this.parentWorld.width / 2
		|| this.x < -this.parentWorld.width / 2
		|| this.y > this.parentWorld.height / 2
		|| this.y < -this.parentWorld.height / 2)
		this.remove();

	if(!this.playerside) {
		//collision
		var d = Math.sqrt(Math.pow(this.parentWorld.player.x - this.x, 2) + Math.pow(this.parentWorld.player.y - this.y, 2)) 
		if(d < (this.width + this.parentWorld.player.width)) {
			this.remove();
			if(this.parentWorld.player.invulnTime == 0)
				this.parentWorld.player.respawn();
		} else if (d < (this.width + this.parentWorld.player.grazeWidth))
			this.parentWorld.player.graze ++;
	}

}

function Bonus(parentWorld, x, y, cat, small, autoGather) {
	this.create(parentWorld, x, y, 0, -2, 0, 0.1);
	this.cat = cat; //point/power/bomb/live
	this.small = small;
	this.autoGather = autoGather || false;
}

Bonus.prototype.create = Entity.prototype.create;
Bonus.prototype.remove = Entity.prototype.remove;


Bonus.prototype.draw = function(context) {
	var ePos = vp.toScreen(this.x, this.y);
	context.drawImage(imgBonus, (this.cat == "point") ? 16 : ((this.cat == "bombs") ? 32 : ((this.cat == "lives") ? 48 : ((this.cat == "gauge") ? 64 : 0))), (this.small ? 16 : 0), 16, 16, ePos.x - 2 * vp.zoom, ePos.y - 2 * vp.zoom, 4 * vp.zoom, 4 * vp.zoom);
}

Bonus.prototype.flush = Entity.prototype.flush;
Bonus.prototype.baseStep = Entity.prototype.step;
Bonus.prototype.step = function() {
	this.baseStep();

	//remove from world
	if (this.y > this.parentWorld.height / 2)
		this.remove();

	//collision
	var d = Math.sqrt(Math.pow(this.parentWorld.player.x - this.x, 2) + Math.pow(this.parentWorld.player.y - this.y, 2));


	if (this.autoGather) {
		this.x1 = (this.parentWorld.player.x - this.x) / d * 5;
		this.y1 = (this.parentWorld.player.y - this.y) / d * 5;
	}

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
				if(this.parentWorld.player.power < 4)
					this.parentWorld.player.power += (this.small ? 0.01 : 0.1); 
				else
					this.parentWorld.player.score += (this.small ? 100 : 200);
				if(this.parentWorld.player.power > 4)
					this.parentWorld.player.power = 4;
				if(fixedPower < 4 && this.parentWorld.player.power == 4) {
					var tEntity = this.parentWorld.firstEntity;
					while (tEntity != null) {
						if(tEntity instanceof Projectile && !tEntity.playerside) {
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
				this.parentWorld.player.power = 4;
				var tEntity = this.parentWorld.firstEntity;
				while (tEntity != null) {
					if(tEntity instanceof Projectile && !tEntity.playerside) {
						tEntity.remove();
						new Bonus(this.parentWorld, tEntity.x, tEntity.y, "point", true, true);				
					}
					tEntity = tEntity.next;
					if (tEntity == this.parentWorld.firstEntity)
						break;
				};
			break;
			case "bombs":
				if(this.parentWorld.player.bombs < 10)
					this.parentWorld.player.bombs += (this.small ? 1/4 : 1); 
				else
					this.parentWorld.player.score += (this.small ? 300 : 500); 
			break;
			case "lives":
				if(this.parentWorld.player.lives < 10)
					this.parentWorld.player.lives += (this.small ? 1/3 : 1); 
				else
					this.parentWorld.player.score += (this.small ? 500 : 2000); 
			break;
		}
	}

}

var vp = new ViewPort();
setInterval(function() { vp.draw() }, 50);	

var imgPlayer = new Image();
imgPlayer.src = "player.png";
var imgEnemy = new Image();
imgEnemy.src = "enemy.png";
var imgBonus = new Image();
imgBonus.src = "bonus.png";
var imgProjectile = new Image();
imgProjectile.src = "projectile.png";
var imgBG = new Image();
imgBG.src = "background.jpg";

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);

function keyDown(event) {	
	if(event.keyCode == 37)
		vp.world.player.moveLeft = true;
	if(event.keyCode == 39)
		vp.world.player.moveRight = true;

	if(event.keyCode == 38)
		vp.world.player.moveUp = true;
	if(event.keyCode == 40)
		vp.world.player.moveDown = true;

	if(event.keyCode == 16)
		vp.world.player.focused = true;

	if(event.keyCode == "Z".charCodeAt(0))
		vp.world.player.shooting = true;

	if(event.keyCode == "X".charCodeAt(0))
		vp.world.player.bomb();

	if(event.keyCode == 27)
		vp.world.pause = !vp.world.pause;

}

function keyUp(event) {	
	if(event.keyCode == 37)
		vp.world.player.moveLeft = false;
	if(event.keyCode == 39)
		vp.world.player.moveRight = false;

	if(event.keyCode == 38)
		vp.world.player.moveUp = false;
	if(event.keyCode == 40)
		vp.world.player.moveDown = false;

	if(event.keyCode == 16)
		vp.world.player.focused = false;

	if(event.keyCode == "Z".charCodeAt(0))
		vp.world.player.shooting = false;
}