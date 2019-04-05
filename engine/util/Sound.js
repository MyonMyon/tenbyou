class Sound {
    static play(data) {
        if (!Settings.get("sound.enabled")) {
            return;
        }
        let vol = Settings.get("sound.volume_sfx") / 100;
        if (vol === 0) {
            return;
        }
        if (!data.noSeek && !data.object.ended) {
            data.object = new Audio(data.object.src);
        }
        data.object.volume = vol;
        data.object.play();
    };
}
