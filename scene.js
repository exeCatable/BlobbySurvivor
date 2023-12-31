class Scene extends Phaser.Scene {
    preload(){
        // load background
        this.load.spritesheet("background", "assets/Sprout Lands/Tilesets/Grass.png",{
            frameWidth: 31,
            frameHeight: 31
        });

        // load player
        this.load.spritesheet("player", "assets/Sprout Lands/Characters/Basic Charakter Spritesheet.png",{
            frameWidth: 17,
            frameHeight: 18,
            margin: 15
        });

        // load enemy
        this.load.spritesheet("enemy", "assets/Sprout Lands/Characters/Basic Enemy Spritesheet.png",{
            frameWidth: 17,
            frameHeight: 18,
            margin: 15
        });

        // add spell
        this.load.spritesheet("beam", "assets/spritesheets/beam.png",{
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create(){
        // add background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);
        this.background.setScale(2);

        // add player
        this.player = this.physics.add.sprite(config.width / 2, config.height / 2, "player");
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);
        this.player.isInvulnerable = false;
        this.player.direction = "right";
        
        // add items
        this.powerUp = new Powerup(this);

        // add "enemy"
        this.enemies = this.physics.add.sprite(config.width, config.height, "enemy");
        this.enemies.health = 4;

        // health bar
        this.healthBarShadow = this.makeBarShadow(0,0,0x320612);
        this.healthBar = this.makeBar(0,0,0xe7153c);
        this.healtbarValue = 100;
        this.setValue(this.healthBar, this.healtbarValue);
        
        // add physics to player and enemy
        this.physics.add.overlap(this.player, this.enemies);
        
        // camera logic to follow player
        this.cameras.main.setBounds(0, 0, 600 * 2, 500 * 2);
        this.physics.world.setBounds(0, 0, 600 * 2, 500 * 2);
        this.cameras.main.startFollow(this.player);

        // animate spell
        this.anims.create({
            key: "beam_anim",
            frames: this.anims.generateFrameNumbers("beam"),
            frameRate: 20,
            repeat: -1
        });

        // spacebar
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.projectiles = this.add.group();
    }

    update(){
        // update player movement
        this.movePlayerManager();
        
        // update enemy movement
        this.enemyFollows();
        
        // update items
        this.powerUp.update();
        
        // damage calc
        let damageIntervalId = undefined;
        const touching = !this.player.body.touching.none;
        if (!touching) {
            clearInterval(damageIntervalId);
            // this.player.isInvulnerable = false;
            this.player.clearTint();
        } else {
            this.player.setTintFill(0xfff345f);
            if (!damageIntervalId) {
                damageIntervalId = setInterval(() => {

                    const damage = 0.5;
                    this.healthBar.scaleX = (this.healthBar.scaleX - damage) /100;

                }, 10000)
            }
        }
            
        // attach healthBar to player
        this.healthBarShadow.y = this.player.body.position.y+19;  
        this.healthBarShadow.x = this.player.body.position.x-5; 
        
        this.healthBar.x = this.player.body.position.x-5; 
        this.healthBar.y = this.player.body.position.y+19;  
    }

    makeBar(x,y,color) {
        const bar = this.add.graphics();

        bar.fillStyle(color);
        bar.fillRect(0, 0, 30, 5);

        bar.x = x;
        bar.y = y;
        
        return bar;
    }

    makeBarShadow(x,y,color) {
        const bar = this.add.graphics();

        bar.fillStyle(color);
        bar.fillRect(0, 0, 30, 5);

        bar.x = x;
        bar.y = y;
        
        return bar;
    }

    setValue(bar,percentage) {
        bar.scaleX = percentage/100;
    }

    movePlayerManager() {
        const Move = 200;
        this.player.setDrag(5000);

        let currentDir = "";
        
        if (this.cursorKeys.left.isDown) {
            this.player.setVelocityX(-Move);
            currentDir += "left";
        } else if(this.cursorKeys.right.isDown) {
            this.player.setVelocityX(Move);
            currentDir += "right";
        }

         if (this.cursorKeys.up.isDown) {
            this.player.setVelocityY(-Move);
            currentDir += "up";
        } else if(this.cursorKeys.down.isDown) {
            this.player.setVelocityY(Move);
            currentDir += "down";
        }
        if(currentDir !== "") {
            this.player.direction = currentDir;
        }
    }

    enemyFollows () {
        this.physics.moveToObject(this.enemies, this.player, 50);
    }
}