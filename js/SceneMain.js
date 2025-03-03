class SceneMain extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMain' });
    }

    preload() {}

    create() {
        // create animations
        this.anims.create({
            key: 'sprEnemy0',
            frames: this.anims.generateFrameNumbers('sprEnemy0'),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'sprEnemy2',
            frames: this.anims.generateFrameNumbers('sprEnemy2'),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'sprExplosion',
            frames: this.anims.generateFrameNumbers('sprExplosion'),
            frameRate: 20,
            repeat: 0
        });
        this.anims.create({
            key: 'sprPlayer',
            frames: this.anims.generateFrameNumbers('sprPlayer'),
            frameRate: 20,
            repeat: -1
        });

        // sound fx
        this.sfx = {
            explosions: [
                this.sound.add('sndExplode0'),
                this.sound.add('sndExplode1')
            ],
            laser: this.sound.add('sndLaser')
        };

        this.backgrounds = [];
        for (var i = 0; i < 5; i++) {
            // 5 scrolling backgrounds
            var bg = new ScrollingBackground(this, 'sprBg0', i * 10);
            this.backgrounds.push(bg);
        }

        // add the player
        this.player = new Player(
            this,
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            'sprPlayer'
        );

        // keys
        this.keyW = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.W
        );
        this.keyS = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.keyA = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );
        this.keyD = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D
        );
        this.keySpace = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // groups
        this.enemies = this.add.group();
        this.enemyLasers = this.add.group();
        this.playerLasers = this.add.group();

        // spawn timer
        this.time.addEvent({
            delay: 1000,
            callback: function() {
                // var enemy = new GunShip(
                //     this,
                //     Phaser.Math.Between(0, this.game.config.width),
                //     0
                // );
                // this.enemies.add(enemy);
                var enemy = null;
                if (Phaser.Math.Between(0, 10) >= 3) {
                    enemy = new GunShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0
                    );
                } else if (Phaser.Math.Between(0, 10) >= 5) {
                    if (this.getEnemiesByType('ChaserShip').length < 5) {
                        enemy = new ChaserShip(
                            this,
                            Phaser.Math.Between(0, this.game.config.width),
                            0
                        );
                    }
                } else {
                    enemy = new CarrierShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0
                    );
                }
                if (enemy !== null) {
                    enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
                    this.enemies.add(enemy);
                }
            },
            callbackScope: this,
            loop: true
        });

        // collider - player lasers and enemies
        this.physics.add.collider(this.playerLasers, this.enemies, function(
            playerLaser,
            enemy
        ) {
            if (enemy.onDestroy !== undefined) {
                enemy.onDestroy();
            }

            enemy.explode(true);
            playerLaser.destroy();
        });

        // collider - player and enemies
        this.physics.add.collider(this.player, this.enemies, function(
            player,
            enemy
        ) {
            if (!player.getData('isDead') && !enemy.getData('isDead')) {
                player.explode(false);
                player.onDestroy();
                enemy.explode(true);
            }
        });

        // collider - player and enemy lasers
        this.physics.add.overlap(this.player, this.enemyLasers, function(
            player,
            laser
        ) {
            if (!player.getData('isDead') && !laser.getData('isDead')) {
                player.explode(false);
                player.onDestroy();
                laser.destroy();
            }
        });
    }

    //  this code should be split up into separate functions
    update() {
        // if the player is not dead
        if (!this.player.getData('isDead')) {
            this.player.update();

            // keyboard movement
            if (this.keyW.isDown) {
                this.player.moveUp();
            } else if (this.keyS.isDown) {
                this.player.moveDown();
            }
            if (this.keyA.isDown) {
                this.player.moveLeft();
            } else if (this.keyD.isDown) {
                this.player.moveRight();
            }

            // space key to fire player laser
            // if not space key decrement the manual timer
            if (this.keySpace.isDown) {
                this.player.setData('isShooting', true);
            } else {
                this.player.setData(
                    'timerShootTick',
                    this.player.getData('timerShootDelay') - 1
                );
                this.player.setData('isShooting', false);
            }
        }

        // update enemies in the enemies group
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];
            enemy.update();

            // frustum culling, garbage collection
            if (
                enemy.x < -enemy.displayWidth ||
                enemy.x > this.game.config.width + enemy.displayWidth ||
                enemy.y < -enemy.displayHeight * 4 ||
                enemy.y > this.game.config.height + enemy.displayHeight
            ) {
                if (enemy) {
                    if (enemy.onDestroy !== undefined) {
                        enemy.onDestroy();
                    }

                    enemy.destroy();
                }
            }
        }

        // for enemy lasers
        for (var i = 0; i < this.enemyLasers.getChildren().length; i++) {
            var laser = this.enemyLasers.getChildren()[i];
            laser.update();
            if (
                laser.x < -laser.displayWidth ||
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight
            ) {
                if (laser) {
                    laser.destroy();
                }
            }
        }

        // for player lasers
        for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
            var laser = this.playerLasers.getChildren()[i];
            laser.update();
            if (
                laser.x < -laser.displayWidth ||
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight
            ) {
                if (laser) {
                    laser.destroy();
                }
            }
        }

        // update scrolling backgrounds
        for (var i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].update();
        }
    }

    // returns an array of enemies of the given type
    getEnemiesByType(type) {
        var arr = [];
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];
            if (enemy.getData('type') == type) {
                arr.push(enemy);
            }
        }
        return arr;
    }
}
