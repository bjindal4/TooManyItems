define(['Screen' ,'Input'], function(Screen, Input) {

    var Game = function(main, renderer, sound) {
        Screen.call(this, main, renderer, sound);
        this.loadStage();
        this.setupInputs();
        this.mouse = {x: 0, y: 0};

        this.last = new Date().getTime();
    };

    Game.constructor = Game;
    Game.prototype = Object.create(Screen.prototype);

    Game.prototype.loadStage = function() {
        // tile texture
        var texture = PIXI.Texture.fromImage("assets/sprites/tiles.png");
        this.tilingSprite = new PIXI.TilingSprite(texture, Conf.canvas.width, Conf.canvas.height);
        this.tilingSprite.tileScale.x = 1;
        this.tilingSprite.tileScale.y = 1;
        this.stage.addChild(this.tilingSprite);

        // player
        this.player = PIXI.Sprite.fromFrame("player.png");
        this.player.anchor.x = this.player.anchor.y = 0.5;
        this.player.position.x = Conf.canvas.width/2;
        this.player.position.y = Conf.canvas.height/2;
        this.stage.addChild(this.player);

        this.beam = PIXI.Sprite.fromFrame("beam.png");
        this.beam.anchor.x = 0.5;
        this.beam.position = this.player.position;
        this.beam.scale.y = 10;
        this.beam.scale.x = 2;
        this.stage.addChild(this.beam);

        // add enemies container
        this.enemies = new PIXI.DisplayObjectContainer();
        this.stage.addChild(this.enemies);
    };

    Game.prototype.setupInputs = function() {
        var self = this;
        this.renderer.renderer.view.addEventListener("mousemove", function(data) {
            self.mouse.x = data.x;
            self.mouse.y = data.y;
        }, true);

        this.renderer.renderer.view.addEventListener("click", function(data) {
            console.log("click on stage");
            self.sound.play("sound_muted");
        }, true);
    };

    Game.prototype.tick = function() {
        if (!this.focus) return;
        this.renderer.stats.begin();
        var current = new Date().getTime();
        var dt = (current - this.last) / 1000;
        this.update(dt);
        this.renderer.render(this.stage);
        this.last = current;
        this.renderer.stats.end();
        requestAnimFrame(this.tick.bind(this));
    };

    Game.prototype.update = function(dt) {
        //this.tilingSprite.tilePosition.x += 1;
        var deltaX = this.mouse.x - this.player.position.x;
        var deltaY = this.mouse.y - this.player.position.y;
        this.player.rotation = Math.atan2(deltaY, deltaX) - Math.PI/2;

        this.beam.rotation = this.player.rotation;

        if (Math.random() < 0.1) this.spawEnemy();

        // update enemies
        for (var i = 0; i < this.enemies.children.length; i++) {
            var enemy = this.enemies.children[i];
            enemy.position.x -= 3;
            deltaX = this.player.position.x - enemy.position.x;
            deltaY = this.player.position.y - enemy.position.y;
            enemy.rotation = Math.atan2(deltaY, deltaX) - Math.PI/2;
            var self = this;
            if (enemy.position.x < -enemy.width) {
                console.log("removed an enemy");
                this.enemies.removeChild(enemy);
            }
        }
    };

    Game.prototype.spawEnemy = function() {
        // new enemy
        var enemy = PIXI.Sprite.fromFrame("enemy.png");
        enemy.anchor.x = enemy.anchor.y = 0.5;
        enemy.position.x = Conf.canvas.width + enemy.width;
        enemy.position.y = Utils.random(0, Conf.canvas.height);
        this.enemies.addChild(enemy);
    };

    return Game;

});