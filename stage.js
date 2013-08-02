vp.world.init = function() {
	this.addStage("Nest of Precursors", "The place you will never return to.", 40, "resources/bg1.jpg", 10);
	this.addStage("The Assembly", "Remains of the abandoned paradise.", 120, "resources/bg2.jpg", 2);
}

vp.world.events = function(){
	if (this.stage == 1) {
		if (this.relTime() < 20 && this.time % Math.floor(64 / (this.difficulty + 1)) == 1 && this.substage == 0) {
			for (var i = 0; i < 2; i++) { //two sides
				var fairy = this.addEntity(Enemy); //new fairy!
					fairy.setVectors((i == 0 ? -this.width - 4 : this.width + 4) / 2, -this.height / 2 - 2,
						(i == 0 ? 20 : -20), 25,
						(i == 0 ? -0.25 : 0.25), 0); //setting position, speed and acceleration for a fairy
					fairy.width = 2; //setting hitbox
					fairy.initHealth(10); //setting initial health (and current health too)
					fairy.setSprite(i + 2, 2, 4, 1, true); //sprite index, frame count, frame length, sprite width, direction-dependence
					fairy.addDrops(i == 0 ? "power" : "point", i == 0, 5); //type, size (false — big), amount
					if (Math.random() < 0.1) fairy.addDrops("power", false, 1); //10% chance of big power item;				
					fairy.bulletSprite = i + 3; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
				fairy.behavior = function() { //and now let's code the fairy's behavior!
					if (this.lifetime % Math.floor(32 / (this.parentWorld.difficulty + 1)) == 0 && this.lifetime > 20) { //doing things every 7 ticks, starting from fairy's tick #20+
						var bullet = new Projectile(this.parentWorld, this.x, this.y); //new bullet here
						bullet.width = 2; //bullet hitbox
						bullet.setSprite(this.bulletSprite, 7, 6, 1, false); //spite set, as described above
						bullet.headToEntity(this.parentWorld.player, 0, 2.5); //starting moving to the player (comment to easy graze), parameters: target entity, initial speed, acceleration
						bullet.behavior = function() { //and bullet's behavior!
							if (this.parentWorld.vectorLength(this.x1, this.y1) > 2) //if speed > 2
								this.setVectors(null, null, null, null, 0, 0); //stop accelerating
							if (this.parentWorld.time % 50 == 0) { //doing things every 50 ticks. this.parentWorld.time is for a sync move, you can replace it with this.lifetime and see what will happen
								this.headToEntity(this.parentWorld.player, 0, 2.5); //stop and refresh directions
								//this.headToEntity(this.whoShotThis, 0, -0.1); //stop and refresh directions
								this.sprite = (this.sprite == 3) ? 4 : 3; //swap sprites for bullets
							}
						}
					}
				}
			}
		}

		if (this.relTime() == 24 && this.substage == 0) {
			this.eventKedamaMidboss(false);
		}

		if (this.relTime() == 4 && this.substage == 1) {
			this.eventOrb();
		}
	}
	if (this.stage == 2) {
		if (this.relTime() == 4 && this.substage == 0) {
			this.eventKedamaMidboss(true);
		}

		if (this.relTime() == 4 && this.substage == 1) {
			this.eventOkuu();
		}
	}
}

vp.world.eventKedamaMidboss = function(power) {
	var nonSpell = function(entity, difficulty) {
		var c = power ? 8 : 6;
		c *= difficulty + 1;
		if (entity.lifetime > 10 && entity.lifetime % 3 == 0 && entity.lifetime % 50 < 30)
			for (var i = 0; i < c; ++i) {
				var v = entity.lifetime % 100 < 50;
				var a = i / c * Math.PI * 2;
				var d = (v ? entity.lifetime : - entity.lifetime) / 20;
				var p = new Projectile(entity.parentWorld);
				p.setVectors(entity.x + entity.width * Math.sin(a + d), entity.y + entity.width * Math.cos(a + d), Math.sin(a + d) * 50, Math.cos(a + d) * 50);
				p.width = 2.5;
				p.setSprite(d > 0 ? 6 : 7, 1, 6, 1, true);				
			}
	}

	var spellAlpha = function(entity) {
		var c = 8;
		if (entity.lifetime > 10 && entity.lifetime % 3 == 0)
			for (var i = 0; i < c; ++i) {
				var a = i / c * Math.PI * 2;
				var d = entity.lifetime / 20;
				var p = new Projectile(entity.parentWorld)
				p.setVectors(entity.x + entity.width * Math.sin(a), entity.y + entity.width * Math.cos(a), Math.sin(a + d) * 25, Math.cos(a + d) * 25);
				p.width = 2.5;
				p.setSprite(entity.lifetime % 2 + 6, 1, 6, 1, true);				
			}
	}

	var spellBeta = function(entity) {
		var c = 5;
		if (entity.lifetime > 10 && entity.lifetime % 6 == 0)
			for (var i = 0; i < c; ++i) {
				var a = i / c * Math.PI * 2;
				var p = new Projectile(entity.parentWorld)
				p.setVectors(entity.x + entity.width * Math.sin(a), entity.y + entity.width * Math.cos(a), Math.sin(a) * 25, Math.cos(a) * 25);
				p.width = 2.5;
				p.behavior = function() {
				if (this.lifetime % 60 == 10)			
					this.headToEntity(entity.parentWorld.player, 0, 2);
				}
				p.setSprite(entity.lifetime / 6 % 2 + 6, 1, 6, 1, true);				
			}
	}

	var kedama = new Enemy(this)
		kedama.setVectors(0, -this.width / 2 - 40);

		kedama.width = 12;

		kedama.setCustomSpriteFile("resources/g_kedama.png", 128, 128);
		kedama.setSprite(0, 4, 8, 4, false);

		kedama.addAttack(false, null, nonSpell, this.difficulty, 400, 500);
		if (this.difficulty > 0)
			if (power)
				kedama.addAttack(true, [null, "Soft Sign \"Fluffy Thorns\"", "Soft Sign \"Not so Fluffy Thorns\""][this.difficulty], spellBeta, this.difficulty, 200, 600, 50, 30000, 5000);
			else
				kedama.addAttack(true, [null, "Soft Sign \"Fluffy Revenge\"", "Soft Sign \"Not so Fluffy Revenge\""][this.difficulty], spellAlpha, this.difficulty, 400, 500, 50, 30000, 5000);

	this.setBoss(kedama, "The Kedama", false);	

	kedama.behavior = function() {
		if (this.lifetime == 1)
			this.headToPointSmoothly(0, -this.parentWorld.height / 4, 3);
		if (this.lifetime == 100)
			this.nextAttack();
	}
}

vp.world.eventOrb = function() {

	var nonSpell = function(entity, difficulty) {
		entity.x1 = Math.cos(entity.lifetime / 20);
		if (entity.lifetime % 4 == 0) {
			var c = 4 * (entity.attackGroupCurrent + 1) * (difficulty + 1);
			for (var i = 0; i < c; ++i) {
				var a = i / c * Math.PI * 2;
				var d = entity.lifetime / 20 * 2;
				var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a), entity.y + Math.cos(a), Math.sin(a + d), Math.cos(a + d));
				p.setSprite(i % 2 + 6, 1, 1);
			}
		}	
	}
	
	var spellAlpha = function(entity, difficulty) {
		if (entity.lifetime == 1)
			entity.headToPointSmoothly(0, -entity.parentWorld.height / 4, 0.5);
		if (entity.lifetime % 4 == 0 && entity.lifetime > 20) {
			entity.x = 0;
			entity.x1 = 0;
			var c = 2 + difficulty;
			var r = 24;
			var s = 2;
			for (var i = 0; i < c; ++i) {
				var a = i / c * Math.PI * 2 + Math.cos(entity.lifetime / 40);
				var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a) * r, entity.y + Math.cos(a) * r, Math.sin(a) * s, Math.cos(a) * s);
				p.setSprite(0, 1);
				p.reflects = 1;
				p.behavior = function() {
					if ((this.x > this.parentWorld.width / 2 || this.x < -this.parentWorld.width / 2) && this.reflects > 0) {
						this.x1 = -this.x1;
						--this.reflects;
					}
					if ((this.y > this.parentWorld.height / 2 || this.y < -this.parentWorld.height / 2) && this.reflects > 0) {
						this.y1 = -this.y1;
						--this.reflects;
					}
				}				
			} 
		}
	}

	var spellBeta = function(entity, difficulty) {
		if (entity.lifetime < 20) {
			entity.headToPointSmoothly(0, -entity.parentWorld.height / 4, 0.5);
		} else {
			entity.x = 0;
			entity.x1 = 0;
			var r = 2;
			var s = 2;
			var a = Math.PI - entity.lifetime / 15;
			var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a) * r, entity.y + Math.cos(a) * r, Math.sin(a) * s, Math.cos(a) * s);
			p.width = 4;
			p.setSprite(6 + entity.lifetime % 2, 1);
			if (entity.lifetime % 100 > 80) {
				if (entity.lifetime % 200 > 100) {
					if (entity.lifetime % 4 == 0) {
						s = 3;
						var c = 2 + difficulty;
						for (var i = -c; i <= c; ++i) {
							a = - Math.atan2(entity.y - entity.parentWorld.player.y, entity.x - entity.parentWorld.player.x) - Math.PI / 2 + Math.PI / 20 * i;
							p = new Projectile(entity.parentWorld, entity.x + Math.sin(a) * r, entity.y + Math.cos(a) * r, Math.sin(a) * s, Math.cos(a) * s);
							p.setSprite(0,1);
							p.width = 2;
						}
					}
				} else {
					if (entity.lifetime % 4 == 0) {
						p = new Projectile(entity.parentWorld, entity.x, entity.y);
						p.headToEntity(entity.parentWorld.player, 100, -1.2);
						p.width = 6;
						p.behavior = function() {
							if(this.lifetime % (32 / (difficulty + 1)) == 0)
								this.headToEntity(this.parentWorld.player, 80, -1.2);
						}
						p.setSprite(0,1);
					}					
				}
			}
		}
	}

	var orb = new Enemy(this)
		orb.setVectors(0, -this.width / 2 - 40);

		orb.width = 2;

		orb.setCustomSpriteFile("resources/orb.png", 128, 128);
		orb.setSprite(0, 1, 0, 4, false);

		orb.addAttack(false, null, nonSpell, this.difficulty, 100, 500);
		//this.parentWorld.extractSpell(46);
		orb.addAttack(true, ["Half-headed Sign \"Regards\"", "Half-headed Sign \"Best Regards\"", "Hard-headed Sign \"Awww\""][this.difficulty], spellAlpha, this.difficulty, 200, 1000, 200, 30000, 5000);
		orb.addAttack(false, null, nonSpell, this.difficulty, 100, 800);
		orb.addAttack(true, ["Reference Sign \"Midly Responsive Legacy\"", "Reference Sign \"Highly Responsive Legacy\"", "Reference Sign \"Nope\""][this.difficulty], spellBeta, this.difficulty, 160, 1500, 200, 40000, 5000);
		
	this.setBoss(orb, "O.R.B.", true);	

	orb.behavior = function() {
		if (this.lifetime == 1)
			this.headToPointSmoothly(0, -this.parentWorld.height / 4, 3);
		if (this.lifetime == 100)
			this.nextAttack();
	}
}

vp.world.eventOkuu = function() {

	var okuu = new Enemy(this)
		okuu.setVectors(0, -this.width / 2 - 40);
		okuu.width = 2; 
		okuu.setCustomSpriteFile("resources/okuu.png", 64, 64);
		okuu.setSprite(0, 1, 0, 2, false);

	var spellAlpha = function(entity, difficulty) {
		if (entity.lifetime % Math.floor(12 / (difficulty + 1)) == 0) {
			var nuclearBall = new Projectile(entity.parentWorld, (Math.random() * (entity.lifetime / 6 % 2 == 0 ? 0.5 : -0.5)) * entity.parentWorld.width, - entity.parentWorld.height / 2 - 5, 0, 6, 0, -0.09);
				nuclearBall.setCustomSpriteFile("resources/nuclear.png", 128, 128);
				nuclearBall.setSprite(0, 1, 1, 1, false)
				nuclearBall.width = 20;
			nuclearBall.behavior = function() {
				if (this.width <= 0.2)
					this.remove()
				else
					this.width -= this.lifetime / 100;
			}
		}
	}

	okuu.addAttack(true, ["Explosion Sign \"Not a Flare at all\"", "Explosion Sign \"Not a Flare at all yet\"", "Explosion Sign \"Lol Easy Modo\""][this.difficulty], spellAlpha, this.difficulty, 300, 1500, 200, 600000, 5000);
	
	this.setBoss(okuu, "Utsuho Reiuji", true);

	okuu.behavior = function() {
		if (this.lifetime == 1)
			this.headToPointSmoothly(0, -this.parentWorld.height / 4, 3);
		if (this.lifetime == 100)
			this.nextAttack();
	}
}