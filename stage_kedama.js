vp.world.events = function(){
	if(Math.random() < 0.06 && this.time < 500) {
		if(Math.random() < 0.4) {				
			var kedama = new Enemy(this, Math.random() * (this.width - 40) - this.width / 2 + 20, -this.height / 2 + 20, 0, 0.2, 0, 0, 5, 20);
			kedama.behaviour = function() {
				if(Math.random() < 0.01)
					new Projectile(this.parentWorld, this.x, this.y, 0, 2 + Math.random() * 2);
			}
		}
		else if(Math.random() < 0.8) {
			var orb = new Enemy(this, Math.random() * (this.width - 40) - this.width / 2 + 20, -this.height / 2 + 20, 0, 0.5, 0, 0, 5, 25, 1, 3, 1);
			orb.behaviour = function() {
				var d = Math.sqrt(Math.pow(this.x - this.parentWorld.player.x, 2) + Math.pow(this.y - this.parentWorld.player.y, 2));
				if(Math.random() < 0.05)
					new Projectile(this.parentWorld, this.x, this.y, -(this.x - this.parentWorld.player.x) / d, -(this.y - this.parentWorld.player.y) / d);
			}
		}
		else {
			var mine = new Enemy(this, Math.random() * (this.width - 40) - this.width / 2 + 20, -this.height / 2 + 20, 0, 0.25, 0, 0, 5, 30, 1, 1, 0);
			mine.behaviour = function() {
				if(this.health <= 0)
					for (i = 0; i < 8; i++)							
						new Projectile(this.parentWorld, this.x, this.y, Math.random() - 0.5, Math.random() - 0.5, 0, 0, 3, false, 2, 1, 0);

			}
		}
		this.bossApperared = false;
	} else if(this.time > 750 && !this.bossApperared) {
		this.bossApperared = true;

		//deleting remains
		var tEntity = this.firstEntity;
		while (tEntity != null) {
			if(tEntity instanceof Projectile && !tEntity.playerside) {
				tEntity.remove();
				new Bonus(this, tEntity.x, tEntity.y, "point", true, true);				
			}
			if(tEntity instanceof Enemy) {
				tEntity.hurt(100);
			}
			tEntity = tEntity.next;
			if (tEntity == this.firstEntity)
				break;
		};

		var giant = new Enemy(this, 0, -this.height / 2 - 15, 0, 0.5, 0, 0, 5, 1000, 1, 3, 2);
		giant.behaviour = function() {
			var d = Math.sqrt(Math.pow(this.x - this.parentWorld.player.x, 2) + Math.pow(this.y - this.parentWorld.player.y, 2));
			if(this.parentWorld.time % 10 == 0 && this.lifetime > 50) {
				for(i = -1; i < 2; i++)
					new Projectile(this.parentWorld, this.x + (i * 10), this.y, -(this.x + (i * 10) - this.parentWorld.player.x) / d * 2, -(this.y - this.parentWorld.player.y) / d * 2, 0, 0, 4, false, i == 0 ? 2 : 0, 2, 8);
			}
			if(this.y > -this.parentWorld.height / 4)
				this.y1 = 0;			
		}
	}
}