vp.world.init = function() {
	this.addStage("Nest of Precursors", "The place you will never return to.", 40, "resources/bg1.jpg", 20);
	this.addStage("The Assembly", "Remains of the abandoned paradise.", 120, "resources/bg2.jpg", 4);
}

vp.world.events = function(){
	if (this.stage == 1) {
		if (this.time == 100) {
			this.eventKedamaMidboss(false);
		}

		if (this.time == 1200) {
			this.eventOrb();
		}
	}
	if (this.stage == 2) {
		if (this.time == 100) {
			this.eventKedamaMidboss(true);
		}

		if (this.time == 1300) {
			this.eventOkuu();
		}
	}
}

vp.world.eventKedamaMidboss = function(power) {
	var nonSpell = function(entity) {
		var c = power ? 16 : 12;
		if (entity.lifetime > 10 && entity.lifetime % 3 == 0 && entity.lifetime % 50 < 30)
			for (var i = 0; i < c; ++i) {
				var v = entity.lifetime % 100 < 50;
				var a = i / c * Math.PI * 2;
				var d = (v ? entity.lifetime : - entity.lifetime) / 20;
				var p = new Projectile(entity.parentWorld, entity.x + entity.width * Math.sin(a + d), entity.y + entity.width * Math.cos(a + d), Math.sin(a + d) * 2, Math.cos(a + d) * 2);
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
				var p = new Projectile(entity.parentWorld, entity.x + entity.width * Math.sin(a), entity.y + entity.width * Math.cos(a), Math.sin(a + d), Math.cos(a + d));
				p.width = 2.5;
				p.setSprite(entity.lifetime % 2 + 6, 1, 6, 1, true);				
			}
	}

	var spellBeta = function(entity) {
		var c = 5;
		if (entity.lifetime > 10 && entity.lifetime % 6 == 0)
			for (var i = 0; i < c; ++i) {
				var a = i / c * Math.PI * 2;
				var p = new Projectile(entity.parentWorld, entity.x + entity.width * Math.sin(a), entity.y + entity.width * Math.cos(a), Math.sin(a), Math.cos(a));
				p.width = 2.5;
				p.behavior = function() {
				if (this.lifetime % 60 == 10)			
					this.headToEntity(entity.parentWorld.player, 0, 0.08);
				}
				p.setSprite(entity.lifetime / 6 % 2 + 6, 1, 6, 1, true);				
			}
	}

	var kedama = new Enemy(this)
		kedama.setVectors(0, -this.width / 2 - 40, 0, 2, 0, -0.03);

		kedama.width = 12;

		kedama.setCustomSpriteFile("resources/g_kedama.png", 128, 128);
		kedama.setSprite(0, 4, 8, 4, false);

		kedama.addAttack(false, null, nonSpell, 400, 500);
		if (power)
			kedama.addAttack(true, "Soft Sign \"Fluffy Thorns\"", spellBeta, 200, 600, 30000);
		else
			kedama.addAttack(true, "Soft Sign \"Fluffy Revenge\"", spellAlpha, 400, 500, 30000);

	this.setBoss(kedama, "The Kedama", false);	

	kedama.behavior = function() {
		if (this.y1 < 0) {
			this.y2 = 0;
			this.y1 = 0;
			this.nextAttack();
		}
	}
}

vp.world.eventOrb = function() {

	var nonSpell = function(entity) {
		entity.x1 = Math.cos(entity.lifetime / 20);
		if (entity.lifetime % 4 == 0) {
			var c = 4 * (entity.attackGroupCurrent + 1);
			for (var i = 0; i < c; ++i) {
				var a = i / c * Math.PI * 2;
				var d = entity.lifetime / 20;
				var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a), entity.y + Math.cos(a), Math.sin(a + d), Math.cos(a + d));
				p.setSprite(i % 2 + 6, 1, 1);
			}
		}	
	}
	
	var spellAlpha = function(entity) {
		if (entity.lifetime < 20)
			entity.headToPoint(0, entity.y, Math.abs(entity.x / 5), 0);
		if (entity.lifetime % 4 == 0 && entity.lifetime > 20) {
			entity.x = 0;
			entity.x1 = 0;
			var c = 3;
			var r = 24;
			var s = 2;
			for (var i = 0; i < c; ++i) {
				var a = i / c * Math.PI * 2 + Math.cos(entity.lifetime / 40);
				var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a) * r, entity.y + Math.cos(a) * r, Math.sin(a) * s, Math.cos(a) * s);
				p.setSprite(0,1);
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

	var spellBeta = function(entity) {
		if (entity.lifetime < 20) {
			entity.headToPoint(0, entity.y, Math.abs(entity.x / 5), 0);
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
						var c = 3;
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
						p.headToEntity(entity.parentWorld.player, 5, -0.05);
						p.width = 6;
						p.behavior = function() {
							if(this.lifetime % 30 == 0)
								this.headToEntity(this.parentWorld.player, 4, -0.05);
						}
						p.setSprite(0,1);
					}					
				}
			}
		}
	}

	var orb = new Enemy(this)
		orb.setVectors(0, -this.width / 2 - 40, 0, 2, 0, -0.03);

		orb.width = 2;

		orb.setCustomSpriteFile("resources/orb.png", 128, 128);
		orb.setSprite(0, 1, 0, 4, false);

		orb.addAttack(false, null, nonSpell, 100, 500);
		//this.parentWorld.extractSpell(46);
		orb.addAttack(true, "Half-headed Sign \"Best Regards\"", spellAlpha, 200, 1000, 30000);
		orb.addAttack(false, null, nonSpell, 100, 800);
		orb.addAttack(true, "Reference Sign \"Highly Responsive Legacy\"", spellBeta, 160, 1500, 40000);
		
	this.setBoss(orb, "O.R.B.", true);	

	orb.behavior = function() {
		if (this.y1 < 0) {
			this.y2 = 0;
			this.y1 = 0;
			this.nextAttack();
		}
	}
}

vp.world.eventOkuu = function() {

	var okuu = new Enemy(this)
		okuu.setVectors(0, -this.width / 2 - 40, 0, 2, 0, -0.03);
		okuu.width = 2; 
		okuu.setCustomSpriteFile("resources/okuu.png", 64, 64);
		okuu.setSprite(0, 1, 0, 2, false);

	var spellAlpha = function(entity) {
		if (entity.lifetime % 6 == 0) {
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

	okuu.addAttack(true, "Explosion Sign \"Not a Flare at all\"", spellAlpha, 300, 1500, 600000);
	
	this.setBoss(okuu, "Utsuho Reiuji", true);

	okuu.behavior = function() {
		if (this.y1 < 0) {
			this.y2 = 0;
			this.y1 = 0;
			this.nextAttack();
		}
	}
}