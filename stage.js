vp.world.events = function(){
	if(this.time % 160 == 20) {
		for(i = 0; i < 2; i++) {
			//new Enemy(parentWorld, x, y, x1, y1, x2, y2, width, health, sprite, frameCount, animPeriod);
			var fairy = new Enemy(this, (i == 0 ? -this.width - 10 : this.width + 10) / 2, -this.height / 2 - 5, (i == 0 ? 1 : -1), 1, 0, 0, 3, 20, 2, 2, 4);
			fairy.behaviour = function() {
				if(this.lifetime % 7 == 1)
					//new Projectile (parentWorld, x, y, x1, y1, x2, y2, width, playerside, sprite, frameCount, animPeriod) 
					new Projectile (this.parentWorld, this.x, this.y, 0, this.lifetime % 2 == 0 ? 1.5 : 1.4, 0, 0, 2, false, this.lifetime % 2 == 0 ? 0 : 2, 1, 1);	
			}
		}
	}
}