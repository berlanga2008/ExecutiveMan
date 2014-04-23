function ShieldGuy(stage, player, basicCollision, x, y) {

	var printerGuySpriteSheet = new createjs.SpriteSheet({
		"images": ["images/shieldguy.png"],
		"frames": {
			"width": 52, "height": 50, "count": 2
		},
		"animations": {
			"sit": {
				"frames" : [0],
				"next" : "sit"
			},
			"shoot" : {
				"frames" : [1],
				"next" : "shoot"
			}
		}
	}); // new createjs.Bitmap("images/businessmanspritesheet.png");

	this.basicCollision   = basicCollision;
	this.health           = 2;
	this.player           = player;
	this.stage            = stage;
	this.animations       = new createjs.Sprite(printerGuySpriteSheet, "sit");
	this.x                = x;
	this.y                = y;
	this.activated        = false;
	this.jumping          = false;
	this.jumpspeed        = 0;
	this.shootTicks       = 0;
	this.hardshell        = true;
	this.watchedElements  = [];

	this.animations.play();
	this.stage.addChild(this.animations);

 	this.tickActions = function(actions) {
 		this.watchedElements.forEach(function(element) {
			element.tickActions(actions);
		});

		if (this.health <= 0) {
			this.stage.removeChild(this.animations);
			this.activated = false;
			return;
		}

		if (this.shootTicks > 0) {
			this.shootTicks--;
		}

		if (this.player.x < this.x && this.animations.scaleX !== 1) {
			setTimeout(function() {
				this.animations.scaleX = 1;
				this.regX = 0;
			}.bind(this), 500);
		} else if (this.player.x > this.x && this.animations.scaleX !== -1) {
			setTimeout(function() {
				this.animations.scaleX = -1;
				this.animations.regX = this.animations.spriteSheet._frameWidth;
			}.bind(this), 500);
		}

		var collisionResults = this.basicCollision.basicCollision(this);
		if (collisionResults.down && !this.jumping) {
			this.jumpspeed = 0;
			this.jumping = true;
		}

		if (this.jumping && collisionResults.down) {
			this.jumpspeed += 0.5;
			if (this.jumpspeed > 24) {
				this.jumpspeed = 24;
			}

			this.y += this.jumpspeed;
		}

		if (!collisionResults.down && this.jumping) {
			this.jumping = false;
			this.jumpspeed = 0;
		}

		var distanceFromPlayer = this.player.x - this.x;
		if (this.shootTicks === 0 && Math.abs(distanceFromPlayer) < 550) {
			this.watchedElements.push(new Shot(stage, this.x, this.y, -this.animations.scaleX, this));
			this.animations.gotoAndPlay("shoot");
			this.hardshell = false;
			this.activated = true;
			this.shootTicks = 300;
			setTimeout(function() {
				this.animations.gotoAndPlay("sit");
				this.activated = false;
				this.hardshell = true;
			}.bind(this), 1000);
		}

		if (!collisionResults.down) {
			this.y -= (this.y + this.animations.spriteSheet._frameHeight) % 32;
		}

		this.animations.x = this.x;
		this.animations.y = this.y;
	};

	var Shot = function(stage, x, y, direction, owner) {
		var shotSpriteSheet = new createjs.SpriteSheet({
			"images": ["images/enemyshot.png"],
			"frames": {
				"width": 16, "height": 16, "count": 1
			},
			"animations": {
				"shot": {
					"frames" : [0],
					"next" : "shot"
				}
			}
		});

		this.stage      = stage;
		this.direction  = direction;
		this.animations = new createjs.Sprite(shotSpriteSheet, "shot");
		this.x          = x + ((this.direction === 1) ? 33 : -3);
		this.y          = y + 22;
		this.disabled   = false;
		this.owner      = owner;

		this.animations.play();
		this.stage.addChild(this.animations);

		this.tickActions = function(actions) {
			this.x = this.x + (3 * this.direction);
			this.animations.x = this.x;
			this.animations.y = this.y;

			if (!this.checkBounds()) {
				this.removeSelf();
			}
		};

		this.removeSelf = function() {
			this.stage.removeChild(this.animations);
			this.disabled = true;
		};

		this.checkBounds = function() {
			if (this.x < 0 || this.x > this.owner.player.x + 2000) {
				return false;
			}

			return true;
		};
	};
}