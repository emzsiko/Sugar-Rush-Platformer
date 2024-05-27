class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.moveUp = false;
    }

    init() {
        // variables and settings
        this.ACCELERATION = 250;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1100;
        this.VELOCITY = 300;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 10;
        this.SCALE = 2.0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 120 tiles wide and 20 tiles tall.
        this.map = this.add.tilemap("sugar-rush-platformer", 18, 18, 120, 20);
        this.physics.world.setBounds(0,0, 120*18 , 20*18);
        this.physics.world.setBoundsCollision(true, true, false, false);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.tilesetFood = this.map.addTilesetImage("tilemap_packed_food", "tilemap_tiles_food");
        this.tilesetBG = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap_bg");

        // Create a layer
        this.bgLayer = this.map.createLayer("background", this.tilesetBG, 0, 0);
        this.groundLayer = this.map.createLayer("blocks-layer", this.tilesetFood, 0, 0);
        this.lockLayer = this.map.createLayer("lock-blocks", this.tileset, 0, 0);
        this.detailLayer = this.map.createLayer("details", this.tilesetFood, 0, 0);
        

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.lockLayer.setCollisionByProperty({
            collides: true
        });

        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        // this.coins = this.map.createFromObjects("Objects", {
        //     name: "coin",
        //     key: "tilemap_sheet",
        //     frame: 151
        // });

        // establishing key
        this.key= this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27
        });
        
        this.hasKey = false;

        // establishing locks
        this.lock = this.map.createFromObjects("Objects", {
            name: "lock",
            key: "tilemap_sheet",
            frame: 28
        });

        // establishing end trigger
        this.endTrigger = this.map.createFromObjects("Objects", {
            name: "end-trigger",
            key: "tilemap_sheet",
            frame: 148
        });

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.lock, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endTrigger, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
       // this.coinGroup = this.add.group(this.coins);
        this.lockGroup = this.add.group(this.lock);
        this.lockArray = this.lockGroup.getChildren();

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(100, 100, "platformer_characters", "tile_0004.png");
        my.sprite.player.setCollideWorldBounds(true, true, false, false);

        // adding enemy
        my.sprite.enemy = this.physics.add.sprite(745, 100, "platformer_characters", "tile_0024.png");

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.lockLayer);
        this.physics.add.collider(my.sprite.enemy, this.groundLayer);

        // collision detection w key
        this.physics.add.overlap(my.sprite.player, this.key, (obj1, obj2) => {
            obj2.destroy();
            this.hasKey = true;
            console.log("key:" + this.hasKey);
        });

        // door open sound
        this.doorOpenSound = this.sound.add("lockSound");

        // opening the locks w the key
        this.physics.add.collider(my.sprite.player, this.lockGroup, () => {
            for (let x of this.lockArray) {
                x.destroy();
            }
            this.doorOpenSound.play();
        });

        // collision w enemy
        this.physics.add.collider(my.sprite.player, my.sprite.enemy, () => {
            this.impactSound.play();
            // puts player back at beginning
            this.scene.restart();
        });

        // triggering game end condition
        this.physics.add.overlap(my.sprite.player, this.endTrigger, () => {
            // stopping walking sounds from continuing
            clearInterval(this.intervalID);
            this.intervalID = null; // Reset interval ID
            // game over scene
            this.scene.start("gameOver");
        });

        // Loop through each object in the endTrigger array
        this.endTrigger.forEach(object => {
            // Make the object invisible by setting its alpha to 0
            object.setAlpha(0);
        });

        // Handle collision detection with coins
        // this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
        //     obj2.destroy(); // remove coin on overlap
        // });
        

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['symbol_01.png', 'smoke_03.png'],
            // TODO: Try:
            addrandom: true,
            scale: {start: 0.03, end: 0.05},
            // TODO: Try: 
            maxAliveParticles: 10,
            lifespan: 400,
            // TODO: Try: gravityY: -400,
            alpha: {start: 0.8, end: 0.1}, 
        });

        my.vfx.walking.stop();
        

        this.cameras.main.setBounds(0, 0, totalWidth, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(100, 100);
        this.cameras.main.setZoom(this.SCALE);

        // audio
        this.walk1 = this.sound.add("walk1");
        this.walk1.setVolume(0.4);
        this.walk2 = this.sound.add("walk2");
        this.walk2.setVolume(0.4);
        this.intervalID = null;
        this.impactSound = this.sound.add("impact"); // falling sound

    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

            // Check if interval is already running
            if (!this.intervalID) {
                // Start the interval to play audio effects
                this.intervalID = setInterval(() => {
                    this.playAudioEffects();
                }, 320);
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

            // Check if interval is already running
            if (!this.intervalID) {
                // Start the interval to play audio effects
                this.intervalID = setInterval(() => {
                    this.playAudioEffects();
                }, 320);
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            my.vfx.walking.stop();

            // Stop the interval if the left arrow key is not down
            clearInterval(this.intervalID);
            this.intervalID = null; // Reset interval ID
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        // enemy movement
        if (this.moveUp === true) {
            my.sprite.enemy.setVelocityY(-100);
            if (my.sprite.enemy.y <= (screenHeight - 650)) {
                this.moveUp = false;
            }
        }

        if (this.moveUp === false) {
            my.sprite.enemy.setVelocityY(100);
            if (my.sprite.enemy.y >= (screenHeight - 500)) {
                this.moveUp = true;
            }
        }

        // checking to see if player is out of bounds and therefore dead
        if(my.sprite.player.y >= screenHeight) {
            this.impactSound.play();
            // puts player back at beginning
            this.scene.restart();
        }
    }

    playAudioEffects() {
        this.walk1.play();

        setTimeout(() => {
            this.walk2.play();
        }, 200);
    }
}