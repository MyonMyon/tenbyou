function Weapon(player, name) {
    extend(this, new Entity(player.parentWorld, 0, 0));
    this.setAnchor(player);
    this.player = player;
    var data = CHAR[player.name].weapons[name];
    this.name = name;
    var propImport = ["behavior", "onShoot", "width"];
    for (var i in propImport) {
        var d = data[propImport[i]];
        if (d) {
            this[propImport[i]] = d;
        }
    };
    this.sprite.set(SPRITE.player);
    this.sprite.set(SPRITE.player[player.name].weapons[name]);
}

Weapon.prototype.step = function () {
    this.$step();
    this.behavior();
};

Weapon.prototype.behavior = function () {
    //Override with CHAR data!
};

Weapon.prototype.onShoot = function () {
    //Override with CHAR data!
};

Weapon.prototype.draw = function (context) {
    var ePos = this.parentWorld.vp.toScreen(this.x, this.y);
    this.sprite.draw(this.parentWorld.vp.context, ePos.x, ePos.y, this.relTime(), this.width * 2 * this.parentWorld.vp.zoom, true);
    if (this.parentWorld.drawHitboxes) {
        context.fillStyle = "white";

        context.beginPath();

        context.arc(ePos.x, ePos.y, 1 * this.parentWorld.vp.zoom * this.width, 0, Math.PI * 2, false);

        context.fill();
        context.closePath();
    }

};