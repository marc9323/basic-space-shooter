class SceneMainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMainMenu' });
    }

    preload() {
        this.load.image('sprBtnPlay', 'content/sprBtnPlay.png');
        this.load.image('sprBtnPlayHover', 'content/sprBtnPlayHover.png');
        this.load.image('sprBtnPlayDown', 'content/sprBtnPlayDown.png');
        this.load.image('sprBtnRestart', 'content/sprBtnRestart.png');
        this.load.image('sprBtnRestartHover', 'content/sprBtnRestartHover.png');
        this.load.image('sprBtnRestartDown', 'content/sprBtnRestartDown.png');
        this.load.audio('sndBtnOver', 'content/sndBtnOver.wav');
        this.load.audio('sndBtnDown', 'content/sndBtnDown.wav');

        this.load.image('sprBg0', 'content/sprBg0.png');
        this.load.image('sprBg1', 'content/sprBg1.png');
        this.load.spritesheet('sprExplosion', 'content/sprExplosion.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('sprEnemy0', 'content/sprEnemy0.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('sprEnemy1', 'content/sprEnemy1.png');
        this.load.spritesheet('sprEnemy2', 'content/sprEnemy2.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('sprLaserEnemy0', 'content/sprLaserEnemy0.png');
        this.load.image('sprLaserPlayer', 'content/sprLaserPlayer.png');
        this.load.spritesheet('sprPlayer', 'content/sprPlayer.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.audio('sndExplode0', 'content/sndExplode0.wav');
        this.load.audio('sndExplode1', 'content/sndExplode1.wav');
        this.load.audio('sndLaser', 'content/sndLaser.wav');
    }

    create() {
        this.sfx = {
            btnOver: this.sound.add('sndBtnOver'),
            btnDown: this.sound.add('sndBtnDown')
        };

        this.btnPlay = this.add.sprite(
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            'sprBtnPlay'
        );

        this.btnPlay.setInteractive();

        this.btnPlay.on(
            'pointerover',
            function() {
                this.btnPlay.setTexture('sprBtnPlayHover'); // set the button texture to sprBtnPlayHover
                this.sfx.btnOver.play(); // play the button over sound
            },
            this
        );

        this.btnPlay.on('pointerout', function() {
            this.setTexture('sprBtnPlay');
        });

        this.btnPlay.on(
            'pointerdown',
            function() {
                this.btnPlay.setTexture('sprBtnPlayDown');
                this.sfx.btnDown.play();
            },
            this
        );

        this.btnPlay.on(
            'pointerup',
            function() {
                this.btnPlay.setTexture('sprBtnPlay');
                this.scene.start('SceneMain');
            },
            this
        );

        this.title = this.add.text(
            this.game.config.width * 0.5,
            128,
            'SPACE SHOOTER',
            {
                fontFamily: 'monospace',
                fontSize: 48,
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        );

        this.title.setOrigin(0.5);

        // background
        this.backgrounds = [];
        for (var i = 0; i < 5; i++) {
            var keys = ['sprBg0', 'sprBg1'];
            var key = keys[Phaser.Math.Between(0, keys.length - 1)];
            var bg = new ScrollingBackground(this, key, i * 10);
            this.backgrounds.push(bg);
        }

        //this.scene.start('SceneMain');
    }

    update() {
        for (var i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].update();
        }
    }
}
