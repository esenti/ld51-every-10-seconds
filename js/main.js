(function() {
  const canvas = document.getElementById('draw');
  canvas.width = 800;
  canvas.height = 600;

  const ctx = canvas.getContext('2d');

  let delta = 0;
  let now = 0;

  let before = Date.now();

  let elapsed = 0;
  let loading = 0;

  // const DEBUG = false;
  const DEBUG = true;

  const keysDown = {};
  let keysPressed = {};

  const images = [];
  const audios = [];

  let framesThisSecond = 0;
  let fpsElapsed = 0;
  let fps = 0;

  let toShoot;
  const shootPeriod = 0.06;

  let toEnemy;
  let enemyPeriod;
  let toEnemyPeriodUpdate;
  const enemyPeriodUpdatePeriod = 10;

  let toRandomize = 10;

  const particles = []
  const enemies = []
  const bullets = []

  let controls;
  let colors;

  window.addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
    return keysPressed[e.keyCode] = true;
  }, false);

  window.addEventListener("keyup", function(e) {
    return delete keysDown[e.keyCode];
  }, false);

  const setDelta = function() {
    now = Date.now();
    delta = (now - before) / 1000;
    return before = now;
  };

  if (!DEBUG) {
    console.log = function() {
      return null;
    };
  }

  let ogre = false;
  let fired = false;

  let player;

  const init = function() {
    elapsed = 0;

    score = 0;

    player = {
      x: 385,
      y: 590,
      w: 30,
      h: 10,
      speed: 250,
    }

    controls = {
      left: 65,
      right: 68,
      shoot: 32,
    }

    colors = {
      bg: "#000000",
      player: "#ffffff",
      bullet: "#ffffff",
      enemy: "#ffffff",
      score: "#ffffff",
      particles: "#ffffff",
    }

    document.getElementsByTagName("html")[0].style.background = colors.bg;
    document.getElementById("instructions").style.color = colors.score;
    document.getElementById("instructions").textContent = "A/D to move, SPACE to shoot";

    toShoot = 0;

    toEnemy = 1;
    enemyPeriod = 3;
    toEnemyPeriodUpdate = 10;

    toRandomize = 10;

    particles.splice(0, particles.length);

    ogre = false;
    fired = false;
  }

  const collides = (bullet, enemy) => {
    return bullet.x + bullet.w > enemy.x && bullet.x < enemy.x + enemy.w &&
      bullet.y + bullet.h > enemy.y && bullet.y < enemy.y + enemy.h;
  }

  const spawnEnemy = () => {
    enemies.push({
      x: Math.random() * 780,
      y: 0,
      w: 10,
      h: 10,
      dx: 0,
      dy: Math.random() * 20,
    })
  }

  const explode = (enemy) => {
    for(var k = 0; k < 25; k++) {
      particles.push({
        x: enemy.x,
        y: enemy.y,
        w: Math.random() * 3 + 1,
        h: Math.random() * 3 + 1,
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 2 - 1,
        ttl: Math.random() * 3 + 1,
        speed: 30,
      })
    }
  }

  const tick = function() {
    setDelta();
    elapsed += delta;
    update(delta);
    draw(delta);
    keysPressed = {};
    click = null;
    return window.requestAnimationFrame(tick);
  };

  const randomColor = function() {
    return "#" +
     (Math.floor(Math.random() * 255)).toString(16).padStart(2, "0") +
     (Math.floor(Math.random() * 255)).toString(16).padStart(2, "0") +
     (Math.floor(Math.random() * 255)).toString(16).padStart(2, "0");
  }

  const randomString  = function(length) {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz    ";
    const charactersLength = characters.length;

    for (var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

  let points = 0;

  const update = function(delta) {

     framesThisSecond += 1;
     fpsElapsed += delta;

     if(fpsElapsed >= 1) {
        fps = framesThisSecond / fpsElapsed;
        framesThisSecond = fpsElapsed = 0;
     }

    toRandomize -= delta;
    if(toRandomize <= 0 && ogre == false)
    {
      toRandomize = 10;

      colors.bg = randomColor();
      colors.player = randomColor();
      colors.bullet = randomColor();
      colors.enemy = randomColor();
      colors.score = randomColor();
      colors.particles = randomColor();

      document.getElementsByTagName("html")[0].style.background = colors.bg;
      document.getElementById("instructions").style.color = colors.score;
      document.getElementById("instructions").textContent = randomString(Math.floor(Math.random() * 10) + 20);

      controls.left = 65 + Math.floor(Math.random() * 25);

      do {
        controls.right = 65 + Math.floor(Math.random() * 25);
      } while(controls.right == controls.left);

      do {
        controls.shoot = 65 + Math.floor(Math.random() * 25);
      } while(controls.shoot == controls.left || controls.shoot == controls.right);

      console.log(controls)
    }

    toShoot -= delta;

     if(keysDown[controls.shoot] && toShoot <= 0 && ogre == false)
     {
        toShoot = shootPeriod;

        bullets.push({
          x: player.x + player.w * 0.5 - 2,
          y: player.y,
          w: 4,
          h: 4,
          dx: 0,
          dy: -400,
        })
     }

    if(keysDown[controls.left] && (player.x > 0) && ogre == false)
    {
      player.x -= delta * player.speed;
    }

    if(keysDown[controls.right] && (player.x + player.w < 800) && ogre == false)
    {
      player.x += delta * player.speed;
    }

     if(!ogre)
     {
     } else {
       if(keysDown[82]) {
         init();
       }
     }

      if(ogre && !fired) {
        fired = true;

        for(var i = enemies.length - 1; i >= 0; i--) {
          explode(enemies[i]);
          enemies.splice(i, 1);
        }

        for(var i = bullets.length - 1; i >= 0; i--) {
          explode(bullets[i]);
          bullets.splice(i, 1);
        }

        explode(player);
        player.w = 0;
      }

      toEnemy -= delta;
      if(toEnemy <= 0 && ogre == false) {
        toEnemy = enemyPeriod;
        spawnEnemy();
      }

      toEnemyPeriodUpdate -= delta;
      if(toEnemyPeriodUpdate <= 0) {
        toEnemyPeriodUpdate = enemyPeriodUpdatePeriod;
        enemyPeriod = Math.max(enemyPeriod - 0.2, 1);
      }

      bullets.forEach(function(bullet) {
        bullet.x += bullet.dx * delta;
        bullet.y += bullet.dy * delta;
      });

      for(var i = enemies.length - 1; i >= 0; i--) {
        enemies[i].x += enemies[i].dx * delta;
        enemies[i].y += enemies[i].dy * delta;

        if(enemies[i].y > 600 - enemies[i].h * 0.5)
        {
          ogre = true;
        }

        for(var j = bullets.length - 1; j >= 0; j--) {
          if(collides(bullets[j], enemies[i])) {

            explode(enemies[i]);

            enemies.splice(i, 1);
            bullets.splice(j, 1);

            points += 10;
            break;
          }
        }
     }

     for(var i = particles.length - 1; i >= 0; i--) {
       particles[i].ttl -= delta;

       if(particles[i].ttl <= 0) {
         particles.splice(i, 1)
         continue;
       }

       particles[i].x += particles[i].dx * particles[i].speed * delta;
       particles[i].y += particles[i].dy * particles[i].speed * delta;
       particles[i].a += delta * Math.random();
     }
 };

  const draw = function(delta) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fafafa";

    ctx.fillStyle = colors.player;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    particles.forEach(function(particle) {
      ctx.fillStyle = colors.particles;
      ctx.fillRect(particle.x, particle.y, particle.w, particle.h);
    })

    enemies.forEach(function(enemy) {
      ctx.fillStyle = colors.enemy;
      ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    });

    bullets.forEach(function(bullet) {
      ctx.fillStyle = colors.bullet;
      ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
    });

    ctx.fillStyle = colors.score;
    ctx.font = "32px Visitor";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(points), 400, 30);

     if(ogre) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "80px Visitor";
        ctx.fillText("oh no", 400, 350);

        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Visitor";
        ctx.fillText("[r] to restart", 400, 400);
     }
 };

 (function() {
  var targetTime, vendor, w, _i, _len, _ref;
  w = window;
  _ref = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  vendor = _ref[_i];
  if (w.requestAnimationFrame) {
  break;
  }
  w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
  }
  if (!w.requestAnimationFrame) {
  targetTime = 0;
  return w.requestAnimationFrame = function(callback) {
  var currentTime;
  targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
  return w.setTimeout((function() {
          return callback(+(new Date));
          }), targetTime - currentTime);
  };
  }
 })();

  const loadImage = function(name, callback) {
    var img = new Image()
    console.log('loading')
    loading += 1
    img.onload = function() {
        console.log('loaded ' + name)
        images[name] = img
        loading -= 1
        if(callback) {
            callback(name);
        }
    }

    img.src = 'img/' + name + '.png'
 }

  const load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         window.requestAnimationFrame(tick);
     }
 };

 init();
 load();

}).call(this);
