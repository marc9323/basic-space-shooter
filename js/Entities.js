// These should be broken down into separate class files
// for readability

class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, type) {
        super(scene, x, y, key);

        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0); // dynamic
        this.setData('type', type);
        this.setData('isDead', false);
    }

    // upon collision with other entities or otherwise destruction
    explode(canDestroy) {
        if (!this.getData('isDead')) {
            // Set the texture to the explosion image, then play the animation
            this.setTexture('sprExplosion'); // this refers to the same animation key we used when we added this.anims.create previously
            this.play('sprExplosion'); // play the animation
            // pick a random explosion sound within the array we defined in this.sfx in SceneMain
            this.scene.sfx.explosions[
                Phaser.Math.Between(0, this.scene.sfx.explosions.length - 1)
            ].play();
            if (this.shootTimer !== undefined) {
                if (this.shootTimer) {
                    this.shootTimer.remove(false);
                }
            }
            this.setAngle(0);
            this.body.setVelocity(0, 0);
            this.on(
                'animationcomplete',
                function() {
                    if (canDestroy) {
                        this.destroy();
                    } else {
                        this.setVisible(false);
                    }
                },
                this
            );
            this.setData('isDead', true);
        }
    }
}

class Player extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key, 'Player'); // type
        this.setData('speed', 200);
        this.setData('isShooting', false);
        this.setData('timerShootDelay', 10);
        this.setData('timerShootTick', this.getData('timerShootDelay') - 1);
        this.play('sprPlayer');
    }

    moveUp() {
        this.body.velocity.y = -this.getData('speed');
    }
    moveDown() {
        this.body.velocity.y = this.getData('speed');
    }
    moveLeft() {
        this.body.velocity.x = -this.getData('speed');
    }
    moveRight() {
        this.body.velocity.x = this.getData('speed');
    }

    update() {
        this.body.setVelocity(0, 0);
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);

        // logic for our 'manual timer'
        // the player can fire a laser every ten ticks (ten updates)
        if (this.getData('isShooting')) {
            // space key
            if (
                this.getData('timerShootTick') < this.getData('timerShootDelay')
            ) {
                // every game update increase timerShootTick by one
                // until we reach the value of timerShootDelay
                this.setData(
                    'timerShootTick',
                    this.getData('timerShootTick') + 1
                );
            } else {
                // when the manual timer is triggered
                var laser = new PlayerLaser(this.scene, this.x, this.y);
                this.scene.playerLasers.add(laser);

                this.scene.sfx.laser.play();
                // reset timerShootTick to zero
                this.setData('timerShootTick', 0);
            }
        }
    }

    onDestroy() {
        this.scene.time.addEvent({
            // go to game over scene
            delay: 1000,
            callback: function() {
                this.scene.scene.start('SceneGameOver');
            },
            callbackScope: this,
            loop: false
        });
    }
}

class ChaserShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprEnemy1', 'ChaserShip');

        this.body.velocity.y = Phaser.Math.Between(50, 100);

        this.states = {
            MOVE_DOWN: 'MOVE_DOWN',
            CHASE: 'CHASE'
        };
        this.state = this.states.MOVE_DOWN;
    }

    update() {
        if (!this.getData('isDead') && this.scene.player) {
            // if the distance between the player and the
            // chaser is less than 320 px we're in CHASE state
            if (
                Phaser.Math.Distance.Between(
                    this.x,
                    this.y,
                    this.scene.player.x,
                    this.scene.player.y
                ) < 320
            ) {
                this.state = this.states.CHASE;
            }
            if (this.state == this.states.CHASE) {
                // if CHASE state, rotate toward player
                // yields a spinning toward player kind of effect
                if (this.x < this.scene.player.x) {
                    this.angle -= 5;
                } else {
                    this.angle += 5;
                }
                // chase the player
                // get distance x and y between player and chaser
                var dx = this.scene.player.x - this.x;
                var dy = this.scene.player.y - this.y;
                // use the distance to calculate the angle
                // using arctangent
                var angle = Math.atan2(dy, dx);
                // set the chase speed
                var speed = 100;
                // set the velocity to a vector calculated
                // using sin and cos of the angle just calculated
                this.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        }
    }
}
class GunShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprEnemy0', 'GunShip');
        this.play('sprEnemy0');

        this.body.velocity.y = Phaser.Math.Between(50, 100);

        // fire a laser every 1000 ms.
        this.shootTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: function() {
                var laser = new EnemyLaser(this.scene, this.x, this.y);
                laser.setScale(this.scaleX);
                this.scene.enemyLasers.add(laser);
            },
            callbackScope: this,
            loop: true
        });
    }

    // remove the shootTimer
    onDestroy() {
        if (this.shootTimer !== undefined) {
            if (this.shootTimer) {
                this.shootTimer.remove(false);
            }
        }
    }
}
class CarrierShip extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprEnemy2', 'CarrierShip');
        this.play('sprEnemy2');

        this.body.velocity.y = Phaser.Math.Between(50, 100);
    }
}

class EnemyLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprLaserEnemy0');
        this.body.velocity.y = 200;
    }
}

class PlayerLaser extends Entity {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprLaserPlayer');
        this.body.velocity.y -= 200;
    }
}

// Scrolling Background
class ScrollingBackground {
    constructor(scene, key, velocityY) {
        this.scene = scene;
        this.key = key;
        this.velocityY = velocityY;

        this.layers = this.scene.add.group();

        this.createLayers();
    }

    createLayers() {
        for (var i = 0; i < 2; i++) {
            // two backgrounds for continuous scroll
            var layer = this.scene.add.sprite(0, 0, this.key);
            layer.y = layer.displayHeight * i;
            var flipX = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
            var flipY = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
            layer.setScale(flipX * 2, flipY * 2);
            layer.setDepth(-5 - (i - 1));
            this.scene.physics.world.enableBody(layer, 0);
            layer.body.velocity.y = this.velocityY;

            this.layers.add(layer);
        }
    }

    update() {
        if (this.layers.getChildren()[0].y > 0) {
            for (var i = 0; i < this.layers.getChildren().length; i++) {
                var layer = this.layers.getChildren()[i];
                layer.y = -layer.displayHeight + layer.displayHeight * i;
            }
        }
    }
}
