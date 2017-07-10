var playState = {
    create: function(){
        // Stage setting
        game.stage.backgroundColor = '#6441A4';
        background = game.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, levelData[level].background);
        background.anchor.setTo(0.5, 0.5);
        // Player set up
        player = game.add.sprite(50, 500, 'desk');
        player.anchor.setTo(0.5, 1);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.collideWorldBounds = true;
        speed = 400;
        lives = 5;
        // Player bullets
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);
        //control keys
        cursors = game.input.keyboard.createCursorKeys();
        wasd = {
          up: game.input.keyboard.addKey(Phaser.Keyboard.W),
          down: game.input.keyboard.addKey(Phaser.Keyboard.S),
          left: game.input.keyboard.addKey(Phaser.Keyboard.A),
          right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //enemy init
        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i =0; i < levelData[level].enms.length; i++){
            for (var j = 0; j <3; j++){
                enemies.add(new Enemy(game,
                                      levelData[level].enms[i],
                                      level,
                                      levelData[level].enemybullets[i]));
            }
        }
        enemies.shuffle();
        enemies.callAll('kill');
        enemyBullets = game.add.group();
        //UI setup
        score = 0;
        liveLabel = game.add.text(50,50, "Lives: " + lives);
        scoreLabel = game.add.text(50,100, "pages: " + score);
        warningLabel = game.add.text(400, 50, levelData[level].enmsAvoidText,
                                    {fill: "#ff0000", align: "center"});
        warningLabel.alpha = 0;
        //timers and flags
        enemySpawnTime = game.time.now;
        bulletFireTime = game.time.now;
        enemyFireTime = game.time.now;
    },
    update: function(){
        // enemy spawn
        if (game.time.now > enemySpawnTime){
            enemy = enemies.getFirstExists(false);
            if (enemy){
                height = game.rnd.integerInRange(100, 700)
                enemy.reset(1200, height);
                enemy.body.velocity.x = -200;
                enemySpawnTime = game.time.now + 1000;
            }
        }
        // enemy fire
        if (game.time.now > enemyFireTime){
            enemy = this.getRandomSprite(enemies);
            if (enemy){
                if (enemy.alive && enemy.key != levelData[level].enmsAvoid){
                    enemyBullet = enemy.bullets.getFirstExists(false);
                    if (enemyBullet){
                        enemyBullet.reset(enemy.x-200, enemy.y);
                        enemyBullet.body.velocity.x = -1000;
                        enemyBullets.add(enemyBullet);
                        enemyFireTime = game.time.now + 2000;
                    }
                }
            }
        }
        // player controls
        if (cursors.up.isDown || wasd.up.isDown){
            player.body.velocity.y = -speed;
        }
        else if (cursors.down.isDown || wasd.down.isDown){
            player.body.velocity.y = speed;
        } else {
            player.body.velocity.y = 0;
        }
        if (cursors.right.isDown || wasd.right.isDown){
            player.body.velocity.x = speed;
        }
        else if (cursors.left.isDown || wasd.left.isDown){
            player.body.velocity.x = -speed;
        } else {
            player.body.velocity.x = 0;
        }
        if (fireButton.isDown && game.time.now > bulletFireTime){
            if (player.alive){
                bullet = bullets.getFirstExists(false);
                if (bullet){
                    bullet.reset(player.x+50, player.y-50);
                    bullet.body.velocity.x = 1000;
                    bulletFireTime = game.time.now +200;
                }
            }
        }
        game.physics.arcade.overlap(
            bullets, enemies, this.playerKill, null, this);
        game.physics.arcade.overlap(
            bullets, enemyBullets, this.playerKill, null, this);
        game.physics.arcade.overlap(
            player, enemies, this.playerDeath, null, this);
        game.physics.arcade.overlap(
            player, enemyBullets, this.playerDeath, null, this);
    },
    playerKill: function(bullet, enemy){
        bullet.kill();
        enemy.kill();
        if (enemy.key == levelData[level].enmsAvoid){
            score -= 10;
            warningLabel.alpha = 1;
            warningLabel.x = enemy.x-100;
            warningLabel.y = enemy.y;
            game.time.events.add(1000,
                function() {
                    game.add.tween(warningLabel).to({alpha: 0},
                    1000, Phaser.Easing.Linear.None, true);
                }, this);
            if (score < 0){
                score = 0;
            }
        } else {
            score += 1;
        }
        scoreLabel.text = "Pages: " + score;
        if (score > 99){
            game.add.text(600, 400, "Level complete");
            player.kill();
        }
    },
    playerDeath: function(player, killer){
        killer.kill();
        lives -= 1;
        liveLabel.text = "Lives: " + lives;
        if (lives >0){
            player.reset(50,500);
            enemies.callAll('kill');
            bullets.callAll('kill');
            enemyBullets.callAll('kill');
            enemies.shuffle();
        } else {
            player.kill();
            game.add.text(600, 400, "Game Over!");
        }
        // game.state.start(game.state.current);
    },
    getRandomSprite: function(group) {
        var randomSprite = null, cnt = 0;
        group.forEachAlive(function(sprite) {
            if (sprite.visible && sprite.inCamera) {
                ++cnt;
                if (Math.random() <= 1 / cnt) {
                    randomSprite = sprite;
                }
            }
        });
        return randomSprite;
    }

};