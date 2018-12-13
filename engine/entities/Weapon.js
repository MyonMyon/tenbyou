function Weapon(player, name, anchored) {
    extend(this, new Entity(player.world, 0, 0));
    if (anchored) {
        this.setAnchor(player);
    } else {
        this.x = player.x;
        this.y = player.y;
    }
    this.player = player;
    var data = CHAR[player.name].weapons[name];
    this.name = name;
    this.drops = [];
    var propImport = ["behavior", "onShoot", "onHit", "onDestroy", "width"];
    for (var i in propImport) {
        var d = data[propImport[i]];
        if (d) {
            this[propImport[i]] = d;
        }
    }
    this.angle = -Math.PI / 2; //look north by default
    this.sprite.set(SPRITE.player);
    this.sprite.set(player.name);
    this.sprite.set(SPRITE.player[player.name].weapons[name]);
}

Weapon.prototype.step = function () {
    this.$step();

    if (!this.isInvulnerable()) {
        for (var i in this.world.entities) {
            var e = this.world.entities[i];
            if (e instanceof Projectile && !e.playerSide && e.width && this.world.collisionCheck(e, this)) {
                //collision
                this.hit();
            }
        }
    }

    this.behavior();
};

Weapon.prototype.hit = function () {
    this.world.splash(this, 3, 8, 0.33);
    this.onHit();
};

Weapon.prototype.destroy = function () {
    new Particle(this.world, this.x, this.y, 0.66, 8, false, false, "splash");
    for (var i in this.drops) {
        this.dropBonus(
                Math.random() * Math.PI * 2,
                Math.random() * 5,
                this.drops[i].cat);
    }
    this.onDestroy();
    this.remove();
};

Weapon.prototype.behavior = function () {
    //Override with CHAR data!
};

Weapon.prototype.onShoot = function () {
    //Override with CHAR data!
};

Weapon.prototype.onHit = function () {
    //Override with CHAR data!
    //default behavior:
    this.destroy();
};

Weapon.prototype.onDestroy = function () {
    //Override with CHAR data!
};

//TODO: unite with Enemy method?
Weapon.prototype.addDrops = function (cat, amount) {
    for (var i = 0; i < amount; ++i) {
        this.drops.push({
            cat: cat
        });
    }
};

Weapon.prototype.draw = function (context) {
    if (this.removalMark) {
        return; //bye-bye!
    }
    var ctx = this.world.vp.context;
    var ePos = this.world.vp.toScreen(this.x, this.y);
    ctx.save();
    ctx.translate(ePos.x, ePos.y);
    ctx.rotate(Math.PI / 2 + this.angle);
    this.sprite.draw(ctx, 0, 0, this.relTime(), this.width * 2 * this.world.vp.zoom, true);
    ctx.restore();
    if (this.world.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * this.world.vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }
};
