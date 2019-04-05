class Sound {
    constructor(vp) {
        this.vp = vp;
    }

    play(data) {
        if (!Settings.get("sound.enabled")) {
            return;
        }
        let vol = Settings.get("sound.volume_sfx") / 100;
        if (vol === 0) {
            return;
        }
        let object = this.vp.res.getSound(data.file);
        if (!data.noSeek && object.ended) {
            object = new Audio(object.src);
        }
        object.volume = vol;
        object.play();
    };
}
