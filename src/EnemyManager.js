define(['Enemy'], function(Enemy){

    var EnemyManager = function(game) {
        this.game = game;
        this.nb = 0; // current number of enemies
        this.enemies = [];
        this.proba = 0.01;
        this.enemiesSprites = new PIXI.DisplayObjectContainer();
        this.itemsSprites = new PIXI.DisplayObjectContainer();
    };

    EnemyManager.prototype.addContainersToStage = function(stage) {
        this.game.addToStage(this.enemiesSprites);
        this.game.addToStage(this.itemsSprites);
    };

    EnemyManager.prototype.dispose = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            if (enemy.item !== null) this.itemsSprites.removeChild(enemy.item.sprite);
            this.enemiesSprites.removeChild(enemy.sprite);
        }
    };

    EnemyManager.prototype.update = function(dt, fireEvent) {
        var g = this.game;
        this.toDie = [];
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];

            // get action from enemy
            var action = enemy.update(dt);
            switch(action) {
                case Conf.enemy.actions.NEW_ITEM:
                    this.itemsSprites.addChild(enemy.item.sprite);
                    break;
                case Conf.enemy.actions.GAVE_ITEM:
                    g.sound.play("hurt");
                    g.items++;
                    console.log("Haha you got an item!");
                    this.removeItem(enemy);
                    break;
            }

            // enemy killed
            if (fireEvent && g.physics.lineCircle(g.player.pos, fireEvent, enemy)) {
                this.toDie.push(i);
            }
        }

        this.killEnemies();
        this.increaseDifficulty();
        // spawn new enemies
        if (Math.random() < this.proba && this.nb < Conf.enemy.max) this.spawEnemy();
    };

    EnemyManager.prototype.updateCamera = function() {
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            this.game.updateEntityCamera(enemy);
            if (enemy.item !== null) {
                this.game.updateEntityCamera(enemy.item);
            }
        }
    };

    EnemyManager.prototype.removeItem = function(enemy) {
        if (enemy.item !== null) {
            this.itemsSprites.removeChild(enemy.item.sprite);
            enemy.item = null;
        }
    };

    EnemyManager.prototype.killEnemies = function() {
        for (var i = this.toDie.length-1; i >= 0; --i) {
            this.removeItem(this.enemies[i]);
            this.enemiesSprites.removeChild(this.enemies[i].sprite);
            this.enemies.splice(i, 1);
            this.nb--;
        }
    };

    EnemyManager.prototype.increaseDifficulty = function() {
        //this.proba += 0.01;
    };

    EnemyManager.prototype.spawEnemy = function() {
        var enemyWalkingTextures = [];
        for (var i = 0; i < 5; i++)  {
            var texture = PIXI.Texture.fromFrame("oldEnemy_" + (i+1) + ".png");
            enemyWalkingTextures.push(texture);
        }
        var enemyWalking = new PIXI.MovieClip(enemyWalkingTextures);

        var enemy = new Enemy(enemyWalking);
        enemy.anchor.x = enemy.anchor.y = 0.5;
        enemy.pos.x = Conf.canvas.width;
        enemy.pos.y = Utils.random(0, Conf.canvas.height);
        enemy.game = this.game;
        enemy.setTarget(this.game.map.randomSourceSpot());
        enemy.state = Conf.enemy.states.FETCHING;

        this.enemies.push(enemy);
        this.enemiesSprites.addChild(enemy.sprite);

        // start animation
        enemyWalking.loop = true;
        enemyWalking.animationSpeed = 0.3;
        enemyWalking.play();

        this.nb++;
    };

    return EnemyManager;
});