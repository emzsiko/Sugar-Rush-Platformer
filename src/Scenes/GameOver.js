class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOver");
    }

    preload() {
        this.load.setPath("./assets/"); // set load path
    }

    create() {

        // mute sound
        this.sound.mute = true;

        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 120 tiles wide and 20 tiles tall.
        this.map = this.add.tilemap("sugar-rush-platformer", 18, 18, 120, 20);
        this.tilesetBG = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap_bg");
        // Create a layer
        this.bgLayer = this.map.createLayer("background", this.tilesetBG, 0, 0);
        this.bgLayer.setScale(2);

        // key bindings
        this.RKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        let scoreConfig = {
            fontFamily: 'monospace',
            fontSize: '25px',
            fontStyle: 'italic',
            backgroundColor: '#ffffff',
            color: '#FFA7CB',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
                right: 5,
                left: 5,
            },
        }

        this.add.text(game.config.width / 2, (game.config.height / 2) - 50,"LEVEL COMPLETE", scoreConfig).setOrigin(0.5);
        this.add.text(game.config.width / 2, game.config.height / 2, "Press 'R' to restart", scoreConfig).setOrigin(0.5);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.RKey)) {
            this.scene.start("platformerScene");
        }
    }
  }