function Weapon(player, name, anchored) {
    extend(this, new Entity(player.parentWorld, 0, 0));
    if (anchored) {
        this.setAnchor(player);
    } else {
        this.x = player.x;
        this.y = player.y;
    }
    this.player = player;
    var data = CHAR[player.name].weapons[name];
    this.name = name;
    var propImport = ["behavior", "onShoot", "onHit", "onDestroy", "width"];
    for (var i in propImport) {
        var d = data[propImport[i]];
        if (d) {
            this[propImport[i]] = d;
        }
    }
    this.sprite.set(SPRITE.player);
    this.sprite.set(SPRITE.player[player.name].weapons[name]);
}

Weapon.prototype.step = function () {
    this.$step();
    this.behavior();
};

Weapon.prototype.hit = function () {
    this.parentWorld.splash(this, 3, 8, 0.33);
    this.onHit();
};

Weapon.prototype.destroy = function () {
    new Particle(this.parentWorld, this.x, this.y, 0.66, 8, false, false, "splash");
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

Weapon.prototype.draw = function (context) {
    var ctx = this.parentWorld.vp.context
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    ctx.save();
    ctx.translate(ePos.x, ePos.y);
    if (this.angle !== undefined) {
        ctx.rotate(Math.PI - this.angle);
    }
    this.sprite.draw(ctx, 0, 0, this.relTime(), this.width * 2 * this.parentWorld.vp.zoom, true);
    ctx.restore();
    if (this.parentWorld.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * this.parentWorld.vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }
};
