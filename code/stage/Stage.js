var STAGE = {
    list: [{
            title: "Nest of Precursors",
            description: "The place you will never return to.",
            appearanceSecond: 1.3,
            background: "bg1.jpg",
            backgroundSpeed: 10
        },{
            title: "The Assembly",
            description: "Remains of the abandoned paradise.",
            appearanceSecond: 4,
            background: "bg2.jpg",
            backgroundSpeed: 2
        }]
};

STAGE.events = function () {
    if (this.stage === 1) {
        if (this.relTime() < 20 && this.time % Math.floor(64 / (this.difficulty + 1)) === 1 && this.substage === 0) {
            for (var i = 0; i < 2; i++) { //two sides
                var fairy = new Enemy(this); //new fairy!
                fairy.setVectors((i === 0 ? -this.width - 4 : this.width + 4) / 2, -this.height / 2 - 2,
                        (i === 0 ? 20 : -20), 25,
                        (i === 0 ? -0.25 : 0.25), 0); //setting position, speed and acceleration for a fairy
                fairy.width = 2; //setting hitbox
                fairy.initHealth(10); //setting initial health (and current health too)
                fairy.setSprite(i + 2, 2, 4, 1, true); //sprite index, frame count, frame length, sprite width, direction-dependence
                fairy.addDrops(i === 0 ? "power" : "point", i === 0, 5); //type, size (false — big), amount
                if (Math.random() < 0.1)
                    fairy.addDrops("power", false, 1); //10% chance of big power item;
                fairy.bulletSprite = i + 3; //left fairy will shoot red eyes, right — the blue ones (this property is not from this class, feel free to use custom names for your purposes)
                fairy.behavior = function () { //and now let's code the fairy's behavior!
                    if (this.lifetime % Math.floor(32 / (this.parentWorld.difficulty + 1)) === 0 && this.lifetime > 20) { //doing things every 7 ticks, starting from fairy's tick #20+
                        var bullet = new Projectile(this.parentWorld, this.x, this.y); //new bullet here
                        bullet.width = 2; //bullet hitbox
                        bullet.setSprite(this.bulletSprite, 7, 6, 1, false); //spite set, as described above
                        bullet.headToEntity(this.parentWorld.player, 0, 2.5); //starting moving to the player (comment to easy graze), parameters: target entity, initial speed, acceleration
                        bullet.behavior = function () { //and bullet's behavior!
                            if (this.parentWorld.vectorLength(this.x1, this.y1) > 2) //if speed > 2
                                this.setVectors(null, null, null, null, 0, 0); //stop accelerating
                            if (this.parentWorld.time % 50 === 0) { //doing things every 50 ticks. this.parentWorld.time is for a sync move, you can replace it with this.lifetime and see what will happen
                                this.headToEntity(this.parentWorld.player, 0, 2.5); //stop and refresh directions
                                //this.headToEntity(this.whoShotThis, 0, -0.1); //stop and refresh directions
                                this.sprite = (this.sprite === 3) ? 4 : 3; //swap sprites for bullets
                            }
                        };
                    }
                };
            }
        }

        if (this.relTime() === 24 && this.substage === 0) {
            this.eventKedamaMidboss(false);
        }

        if (this.relTime() === 4 && this.substage === 1) {
            this.eventOrb();
        }
    }
    if (this.stage === 2) {
        if (this.relTime() === 4 && this.substage === 0) {
            this.eventKedamaMidboss(true);
        }

        if (this.relTime() === 4 && this.substage === 1) {
            this.eventOkuu();
        }
    }
};

STAGE.eventKedamaMidboss = function (power) {
    var nonSpell = function (entity, difficulty) {
        var c = power ? 8 : 6;
        c *= difficulty + 1;
        if (entity.lifetime > 10 && entity.lifetime % 3 === 0 && entity.lifetime % 50 < 30)
            for (var i = 0; i < c; ++i) {
                var v = entity.lifetime % 100 < 50;
                var a = i / c * Math.PI * 2;
                var d = (v ? entity.lifetime : -entity.lifetime) / 20;
                var p = new Projectile(entity.parentWorld);
                p.setVectors(entity.x + entity.width * Math.sin(a + d), entity.y + entity.width * Math.cos(a + d), Math.sin(a + d) * 50, Math.cos(a + d) * 50);
                p.width = 2.5;
                p.setSprite(d > 0 ? 6 : 7, 1, 6, 1, true);
            }
    };

    var kedama = new Enemy(this);

    kedama.addAttack(false, null, nonSpell, this.difficulty, 400, 500);
    if (this.difficulty > 0)
        if (power)
            kedama.addSpell(SPELL.kedamaBeta, this.difficulty);
        else
            kedama.addSpell(SPELL.kedamaAlpha, this.difficulty);

    kedama.setBossData(BOSS.kedama, false);
};

STAGE.eventOrb = function () {
    var nonSpell = function (entity, difficulty) {
        entity.x1 = Math.cos(entity.lifetime / 20);
        if (entity.lifetime % 4 === 0) {
            var c = 4 * (entity.attackGroupCurrent + 1) * (difficulty + 1);
            for (var i = 0; i < c; ++i) {
                var a = i / c * Math.PI * 2;
                var d = entity.lifetime / 20 * 2;
                var p = new Projectile(entity.parentWorld, entity.x + Math.sin(a), entity.y + Math.cos(a), Math.sin(a + d), Math.cos(a + d));
                p.setSprite(i % 2 + 6, 1, 1);
            }
        }
    };

    var orb = new Enemy(this);

    orb.addAttack(false, null, nonSpell, this.difficulty, 100, 500);
    orb.addSpell(SPELL.orbAlpha, this.difficulty);
    orb.addAttack(false, null, nonSpell, this.difficulty, 100, 800);
    orb.addSpell(SPELL.orbBeta, this.difficulty);

    orb.setBossData(BOSS.orb, true);
};

STAGE.eventOkuu = function () {
    var okuu = new Enemy(this);

    okuu.addSpell(SPELL.okuuAlpha, this.difficulty);

    okuu.setBossData(BOSS.okuu, true);
};
