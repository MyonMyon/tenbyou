vp.world.events = function(){
	/*
	if (this.time == 20) {
		this.eventOkuu();
	}*/
	if (this.time % 60 == 20 && (this.time < 400 || (this.time > 1100 && this.time < 1600))) { //doing things every 60 ticks, starting from tick #20 till #400
		for (var i = 0; i < 2; i++) { //two sides
			var fairy = new Enemy(this); //new fairy!
				fairy.setVectors((i == 0 ? -this.width - 4 : this.width + 4) / 2, -this.height / 2 - 2, (i == 0 ? 1.5 : -1.5), 1, (i == 0 ? -0.03 : 0.03), 0); //setting position, speed and acceleration for a fairy
				fairy.width = 2; //setting hitbox
				fairy.initHealth(10); //setting initial health (and current health too)
				fairy.setSprite(i + 2, 2, 4, 1, true); //sprite index, frame count, frame length, sprite width, direction-dependence
				fairy.addDrops(i == 0 ? "power" : "point", i == 0, 5); //type, size (false — big), amount
				if (Math.random() < 0.1) fairy.addDrops("power", false, 1); //10% chance of big power item;				
				fairy.bulletSprite = i + 3; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
			fairy.behavior = function() { //and now let's code the fairy's behavior!
				if (this.lifetime % 7 == 0 && this.lifetime > 20) { //doing things every 7 ticks, starting from fairy's tick #20+
					var bullet = new Projectile(this.parentWorld, this.x, this.y); //new bullet here
					bullet.width = 2; //bullet hitbox
					bullet.setSprite(this.bulletSprite, 7, 6, 1, false); //spite set, as described above
					bullet.headToEntity(this.parentWorld.player, 0, 0.1); //starting moving to the player (comment to easy graze), parameters: target entity, initial speed, acceleration
					//bullet.whoShotThis = fairy;
					bullet.behavior = function() { //and bullet's behavior!
						if (this.parentWorld.vectorLength(this.x1, this.y1) > 2) //if speed > 2
							this.setVectors(null, null, null, null, 0, 0); //stop accelerating
						if (this.parentWorld.time % 50 == 0) { //doing things every 50 ticks. this.parentWorld.time is for a sync move, you can replace it with this.lifetime and see what will happen
							this.headToEntity(this.parentWorld.player, 0, 0.1); //stop and refresh directions
							//this.headToEntity(this.whoShotThis, 0, -0.1); //stop and refresh directions
							this.sprite = (this.sprite == 3) ? 4 : 3; //swap sprites for bullets
						}
					}
				}
			}
		}
	}
	if (this.time == 420 || this.time == 1800) { //BOSSES! (TO DESCRIBE!)
		this.clearField(100);
		var kedama = new Enemy(this);
			kedama.great = (this.time == 1800);
			kedama.setVectors(0, -this.width / 2 - 15, 0, 2, 0, -0.03);
			kedama.width = kedama.great ? 4 : 3;
			kedama.initHealth(kedama.great ? 500 : 250);

			kedama.setCustomSpriteFile("resources/g_kedama.png", 128, 128);
			kedama.setSprite(0, 4, kedama.great ? 4: 2, kedama.great ? 4 : 2, false);

			kedama.addDrops("power", false, kedama.great ? 12 : 8);
			kedama.addDrops("point", false, kedama.great ? 100 : 50);

			kedama.addDrops("bombs", true, 1, 100);
			kedama.addDrops("lives", true, 1);

			kedama.addDrops("point", true, 1, 5);
			kedama.addDrops("power", true, 1, 50);

		this.setBoss(kedama, kedama.great ? "The Ke." : "The Ke.Jr.");

		kedama.behavior = function() {
			var streams = kedama.great ? 16 : 12;
			if (this.y1 < 0 && this.lifetime < 100)
				this.y2 = 0;
			if (this.lifetime > 40 && (this.lifetime < 700 || kedama.great) && this.lifetime % 3 == 0 && this.lifetime % (kedama.great ? 60 : 120) > 10)
				for (var i = 0; i < streams; i++) {
					var direction = this.lifetime % (kedama.great ? 120 : 240) > (kedama.great ? 60 : 120);
					var dX = Math.cos(i / (streams) * Math.PI * 2 + (direction ? -this.lifetime : this.lifetime) / 200) * (kedama.great ? 3 : 1.5);
					var dY = Math.sin(i / (streams) * Math.PI * 2 + (direction ? -this.lifetime : this.lifetime) / 200) * (kedama.great ? 3 : 1.5);
					var bullet = new Projectile(this.parentWorld, this.x + dX * 5, this.y + dY * 5, dX, dY);
					bullet.width = 2.5;
					bullet.setSprite(direction ? 5 : 6, 1, 6, 1, true);				
				}
			if (this.lifetime == 600 && !kedama.great)
				this.y2 = -0.004;
		}

		kedama.onDamage = function(damage) {
			if (this.health <= 0 && (this.health + damage > 0) && kedama.great)
				this.parentWorld.eventOkuu();
		}
	}
}

vp.world.eventOkuu = function() {

	var okuu = new Enemy(this)
		okuu.setVectors(0, -this.width / 2 - 15, 0, 2, 0, -0.03);

		okuu.width = 2; //SOO HARDCORE
		okuu.initHealth(666);

		//okuu.setCustomSpriteFile("resources/okuu.png", 32, 32);
		okuu.setSprite(4, 2, 8, 2, false);

		okuu.addDrops("gauge", true, 5);
		okuu.addDrops("nuclear", false, 5);
		okuu.addDrops("power", true, 1, 10);
	
	this.setBoss(okuu, "Utsuho R.");

	okuu.behavior = function() {
		if (this.lifetime == 6)
			this.parentWorld.clearField(6);

		if (this.y1 < 0)
			this.y2 = 0;

		if (this.lifetime % 6 == 0 && this.lifetime > 40) {
			this.userDefinedExample(0);
		}
	}

	okuu.onDamage = function(damage) {
		if((((this.health - damage) % 10) > (this.health % 10) && damage > 0 && this.lifetime > 40 && this.health < 166) || damage > 10) {			
			this.userDefinedExample(1);
		}
	}

	okuu.userDefinedExample = function(cause) {
		var nuclearBall = new Projectile(this.parentWorld, (Math.random() * (this.lifetime % (cause ? 2 : 12) == 0 ? 0.5 : -0.5)) * this.parentWorld.width, - this.parentWorld.height / 2 - 5, 0, 6, 0, -0.09);
			nuclearBall.setCustomSpriteFile("resources/nuclear.png", 128, 128);
			nuclearBall.setSprite(cause, 1, 1, 1, false)
			nuclearBall.width = 20;
		nuclearBall.behavior = function() {
			if (this.width <= 0.2)
				this.remove()
			else
				this.width -= this.lifetime / 150;
		}		
	}
}