vp.world.events = function(){
	if(this.time % 160 == 20 && this.time < 1000) { //doing things every 160 ticks, starting from tick #20 till #2000
		for(i = 0; i < 2; i++) { //two sides
			var fairy = new Enemy(this); //new fairy!
				fairy.setVectors((i == 0 ? -this.width - 4 : this.width + 4) / 2, -this.height / 2 - 2, (i == 0 ? 1 : -1), 1, 0); //setting position and speed for a fairy, acceleration is 0 by default
				fairy.width = 2; //setting hitbox
				fairy.initHealth(20); //setting initial health (and current health too)
				fairy.setSprite(2, 2, 4, 1, true); //sprite index, frame count, frame length, sprite width, direction-dependence
				fairy.bulletSprite = i + 3; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
			fairy.behavior = function() { //and now let's code the fairy's behavior!
				if(this.lifetime % 7 == 0 && this.lifetime > 20) { //doing things every 7 ticks, starting from fairy's tick #20+
					var bullet = new Projectile(this.parentWorld, this.x, this.y); //new bullet here
					bullet.width = 2; //bullet hitbox
					bullet.setSprite(this.bulletSprite, 4, 8, 1, false); //spite set, as described above
					bullet.headToEntity(this.parentWorld.player, 0, 0.1); //starting moving to the player (comment to easy graze), parameters: target entity, initial speed, acceleration
					bullet.behavior = function() { //and bullet's behavior!
						if(this.parentWorld.vectorLength(this.x1, this.y1) > 2) //if speed > 2
							this.setVectors(null, null, null, null, 0, 0); //stop accelerating
						if(this.parentWorld.time % 50 == 0) { //doing things every 50 ticks. this.parentWorld.time is for a sync move, you can replace it with this.lifetime and see what will happen
							this.headToEntity(this.parentWorld.player, 0, 0.1); //stop and refresh directions
							this.sprite = (this.sprite == 3) ? 4 : 3; //swap sprites for bullets
						}
					}
				}
			}
		}
	}
	if(this.time == 1200) { //event at tick #2200
		this.pause = true; //you can pause it, lol
		alert("To be done :D"); //and even use standard js functions
	}
}