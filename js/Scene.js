"use strict";
/* exported Scene*/
class Scene extends UniformProvider {
  constructor(gl) {
    super("scene");
    this.programs = [];

    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");
    this.vsBackground = new Shader(gl, gl.VERTEX_SHADER, "background-vs.glsl");
    this.vsTransform = new Shader(gl, gl.VERTEX_SHADER, "transform-vs.glsl");
    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid-fs.glsl");
    
    this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured);
    this.solidProgram = new Program(gl, this.vsTransform, this.fsSolid);
    this.backgroundProgram = new TexturedProgram(gl, this.vsBackground, this.fsTextured);
    
    this.programs.push(this.texturedProgram);
    this.programs.push(this.solidProgram);
    this.programs.push(this.backgroundProgram);

    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);
    this.quadGeometry = new QuadGeometry(gl);
    this.circleGeometry = new CircleGeometry(gl);

    this.gameObjects = [];
    this.projectiles = [];
    this.platforms = [];
    this.bombs = [];
    this.coins = [];
    this.collected = [];

    this.backgroundMaterial = new Material(this.backgroundProgram);
    this.avatarMaterial = new Material(this.texturedProgram);
    this.plasmaMaterial = new Material(this.texturedProgram);
    this.shootMaterial = new Material(this.texturedProgram);
    this.boomMaterial = new Material(this.texturedProgram);
    this.coinMaterial = new Material(this.texturedProgram);
    this.collectedMaterial = new Material(this.texturedProgram);
    this.hintMaterial = new Material(this.solidProgram);
    this.platformMaterial = new Material(this.solidProgram);

    this.backgroundMaterial.colorTexture.set(new Texture2D(gl, "media/background.jpg"));
    this.avatarMaterial.colorTexture.set(new Texture2D(gl, "media/avatar.png"));
    this.plasmaMaterial.colorTexture.set(new Texture2D(gl, "media/plasma.png"));
    this.shootMaterial.colorTexture.set(new Texture2D(gl, "media/asteroid.png"));
    this.boomMaterial.colorTexture.set(new Texture2D(gl, "media/boom.png"));
    this.coinMaterial.colorTexture.set(new Texture2D(gl, "media/coins.png"));
    this.collectedMaterial.colorTexture.set(new Texture2D(gl, "media/coin.png"));
    this.platformMaterial.color.set(0.6, 0.9, 0.6, 1.0);

    this.backgroundMesh = new Mesh(this.backgroundMaterial, this.texturedQuadGeometry);
    this.avatarMesh = new Mesh(this.avatarMaterial, this.texturedQuadGeometry);
    this.plasmaMesh = new Mesh(this.plasmaMaterial, this.texturedQuadGeometry);
    this.shootMesh = new Mesh(this.shootMaterial, this.texturedQuadGeometry);
    this.boomMesh = new Mesh(this.boomMaterial, this.texturedQuadGeometry);
    this.coinMesh = new Mesh(this.coinMaterial, this.texturedQuadGeometry);
    this.collectedMesh = new Mesh(this.collectedMaterial, this.texturedQuadGeometry);
    this.hintMesh = new Mesh(this.hintMaterial, this.circleGeometry);
    this.platformMesh = new Mesh(this.platformMaterial, this.quadGeometry);

    this.background = new GameObject(this.backgroundMesh);
    this.background.update = function() {};

    this.avatar = new GameObject(this.avatarMesh);
    this.avatar.offset.set(0.0, 0.0, .16666);
    this.avatar.position.set(-18, -13);

    this.plasma = new GameObject(this.plasmaMesh);
    this.plasma.position.set(3, -13);
    this.plasma.force.x = -20;

    this.coin = new GameObject(this.coinMesh);
    this.coin.position.set(-3, -6);
    this.coin.scale.set(0.75, 0.75, 1.0);
    this.coin.offset.set(0.0, 0.0, .16666);
    this.coin1 = new GameObject(this.coinMesh);
    this.coin1.position.set(3, -6);
    this.coin1.scale.set(0.75, 0.75, 1.0);
    this.coin1.offset.set(0.0, 0.0, .16666);

    this.gameObjects.push(this.background);
    this.gameObjects.push(this.avatar);
    this.gameObjects.push(this.plasma);
    this.projectiles.push(this.plasma);
    this.gameObjects.push(this.coin);
    this.coins.push(this.coin);
    this.gameObjects.push(this.coin1);
    this.coins.push(this.coin1);


    for (var i = 0; i < 2; i++) {
      this.hint = new GameObject(this.hintMesh);
      this.hint.position.set(this.avatar.position);
      this.hint.position.x -= (11 - (2 * i));
      this.hint.position.y += 8.5;
      this.collected.push(this.hint);
      this.gameObjects.push(this.hint);
    }

    for (var i = 0; i < 20; i++) {
      var add = 0.5 * i;
      this.platform = new GameObject(this.platformMesh);
      this.platform.position.set(-18 + add, -15);
      this.gameObjects.push(this.platform);
      this.platforms.push(this.platform);
    }
    for (var i = 0; i < 10; i++) {
      var add = 0.5 * i;
      this.platform = new GameObject(this.platformMesh);
      this.platform.position.set(-5 + add, -8);
      this.gameObjects.push(this.platform);
      this.platforms.push(this.platform);
    }
    for (var i = 0; i < 20; i++) {
      var add = 0.5 * i;
      this.platform = new GameObject(this.platformMesh);
      this.platform.position.set(3 + add, -15);
      this.gameObjects.push(this.platform);
      this.platforms.push(this.platform);
    }

    const genericMove = function(t, dt) {
      const acceleration = this.force.mul(this.invMass);
      this.velocity.addScaled(dt, acceleration);
      this.position.addScaled(dt, this.velocity);
      this.velocity.x *= 0.96;
    };

    this.avatar.control = function(t, dt, keysPressed, platforms, firstTime) {
        this.force.set();
        this.force.y = -40;
        var currentTime = new Date().getTime();

        if (keysPressed.RIGHT) {
          this.force.x = 40;
          if (this.offset.y < 3) {
            this.offset.x += 1;            
          }
        }
        if (keysPressed.LEFT) {
          this.force.x = -40;
          if (this.offset.y < 3) {
            this.offset.x += 1;            
          }
        }
        if (keysPressed.UP) {
          if (this.timeAtPreviousJump == null) {
            this.timeAtPreviousJump = 0;
          }
          if (t - this.timeAtPreviousJump > 1) {
            this.timeAtPreviousJump = t;
            this.force.y = 1500;
            this.offset.y = 3;
            console.log("jump newest!");
          }
        }

        for (const other of platforms) {
          const dist = this.position.minus(other.position);
          var dist2 = dist.dot(dist);
          dist2 = Math.sqrt(dist2);

          if (dist2 < 2) {
            this.velocity.y = 0;
            var factor = 100 / dist2;
            this.force.y += factor;   
          }
        }
    };

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    this.avatar.move = genericMove;
    this.plasma.move = genericMove;

    this.camera = new OrthoCamera(...this.programs);
    this.addComponentsAndGatherUniforms(...this.programs);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.setAspectRatio(canvas.width / canvas.height);
  }

  update(gl, keysPressed) {
    //jshint bitwise:false
    //jshint unused:false
    const timeAtThisFrame = new Date().getTime();
    const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0;
    this.timeAtLastFrame = timeAtThisFrame;

    this.camera.position = new Vec3(-13, -13, 0);
    this.camera.position.x = this.avatar.position.x;
    this.camera.update();

    if (keysPressed.W) {
        this.camera.windowSize.x -= 0.1; //* (16/7);
        this.camera.windowSize.y -= 0.1;
    }
    if (keysPressed.S) {
        this.camera.windowSize.x += 0.1; //* (16/7);
        this.camera.windowSize.y += 0.1;
    }

    for (var i = 0; i < this.collected.length; i ++) {
      this.collected[i].position.x = this.avatar.position.x - (11 - (2 * i));
    }

    // clear the screen
    gl.clearColor(0.1, 0.7, 0.99, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const bomb of this.bombs) {
      if (bomb.offset.x == 5 && bomb.offset.y == 5) {
        this.bombs = this.bombs.filter(function(value, index, arr){ return value != bomb});
        this.gameObjects = this.gameObjects.filter(function(value, index, arr){ return value != bomb});
      } else {
        if (bomb.offset.x == 5) {
          bomb.offset.y += 1;
          bomb.offset.x = 0;
        }
        bomb.offset.x += 1;
      }
    }

    if ((this.avatar.offset.x == 5 && this.avatar.offset.y == 5)||
        (this.avatar.offset.x == 5 && this.avatar.offset.y == 2)) {
        this.avatar.offset.x = 0;
        this.avatar.offset.y = 0;
      } else {
        if (this.avatar.offset.x == 5) {
          this.avatar.offset.y += 1;
          this.avatar.offset.x = 0;
        }
        if (this.avatar.offset.y > 2) {
          this.avatar.offset.x += 1;
        }
    }

    if (this.avatar.position.y < -26) {
      this.avatar.position.set(-18, -13);
    }

    for (var i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      const dist = this.avatar.position.minus(coin.position);
      var dist2 = dist.dot(dist);
      dist2 = Math.sqrt(dist2);

      if (dist2 < 2) {
        // remove the coin from remaining coins to collect and game objects
        this.coins.splice(i, 1);
        this.gameObjects = this.gameObjects.filter(function(value, index, arr){ return value != coin});
        console.log("nice!")
        // create a new static coin
        this.new = new GameObject(this.collectedMesh);
        this.new.scale.set(0.75, 0.75, 1.0);
        const index = this.collected.length - 1 - this.coins.length;
        const remove = this.collected[index];
        // replace the hint with the static coin and add it to game objects
        this.new.position.set(this.collected[index].position.x, this.collected[index].position.y);
        this.collected[index] = this.new;
        this.gameObjects = this.gameObjects.filter(function(value, index, arr){ return value != remove});
        this.gameObjects.push(this.new);
      }

      if (coin.offset.x == 5 && coin.offset.y == 5) {
        coin.offset.x = 0;
        coin.offset.y = 0;
      } else {
        if (coin.offset.x == 5) {
          coin.offset.y += 1;
          coin.offset.x = 0;
        }
        coin.offset.x += 1;
      }
    }


    for (var i = 0; i < this.projectiles.length; i++) {
      const projectile = this.projectiles[i];
      for (const gameObject of this.gameObjects) {
        if (gameObject == projectile) {
          continue;
        } else {
          const dist = gameObject.position.minus(projectile.position);
          var dist2 = dist.dot(dist);
          dist2 = Math.sqrt(dist2);

          if (dist2 < 2) {
            this.projectiles.splice(i, 1);
            this.gameObjects = this.gameObjects.filter(function(value, index, arr){ return value != projectile});
            console.log("kaboom!")
            this.new = new GameObject(this.boomMesh);
            this.new.offset.set(0.0, 0.0, .16666);
            this.new.position.set(projectile.position.x, projectile.position.y);
            this.gameObjects.push(this.new);
            this.bombs.push(this.new);
          }
        }
      }
    }

    if (keysPressed.SPACE) {
      if (this.timeAtPreviousShoot == null) {
        this.timeAtPreviousShoot = 0;
      }
      if (t - this.timeAtPreviousShoot > 1) {
        this.timeAtPreviousShoot = t;
        console.log("shoot!");
        this.shot = new GameObject(this.shootMesh);
        this.shot.position.set(this.avatar.position.x + 2.1, this.avatar.position.y + 0.1);
        this.shot.scale.set(0.5,0.5,1.0);
        this.shot.force.x = 40;
        this.shot.move = function(t, dt) {
          const acceleration = this.force.mul(this.invMass);
          this.velocity.addScaled(dt, acceleration);
          this.position.addScaled(dt, this.velocity);
          this.velocity.x *= 0.96;
        };
        this.gameObjects.push(this.shot);
        this.projectiles.push(this.shot);
      }
    }

    for (const gameObject of this.gameObjects) {
      gameObject.control(t, dt, keysPressed, this.platforms, this.timeAtFirstFrame);
    }

    for (const gameObject of this.gameObjects) {
      gameObject.move(t, dt);
    }

    for (const gameObject of this.gameObjects) {
      gameObject.update();
    }

    for (const gameObject of this.gameObjects) {
      gameObject.draw(this, this.camera);
    }
  }
}
