  var fps = 30; 
  var canvas = document.getElementById("game");
  var pa = document.getElementById("out");
  var mouse = {x: 0 , y: 0, width: 10, height: 10, isdown: false};
  var graphics = canvas.getContext('2d');
  var pl = new player(0,40,100,100);
  var playerdrops = []
  var enemies = []
  var pickups = []
  var particles = [] 
  var fliers = [] 
  var jetparticles = []
  var level = 1
  var states = [ "start" , "playing", "end" ];
  var currentstate = "start";
  var numpickups 
  var clickrec = new rectangle(0, 0, 500, 100); 

  // Load Content
  var right = new Image(); 
  right.src = "jetpackguy.png";
  var img1 = new Image();
  img1.src = "enemy.png"; 
  var pickupimg = new Image();
  pickupimg.src = "pickup.png"; 
  var back = new Image();
  back.src = "back.png"; 
  var oflier = new Image();
  oflier.src = "flieropen.png";
  var cflier = new Image();
  cflier.src = "flierclosed.png"; 
  var start = new Image();
  start.src = "start.png";
  var end = new Image();
  end.src = "end.png"; 
  var fire = new Image();
  fire.src = "fire.png";
  var blood = new Image();
  blood.src = "blood.png"; 
  var left = new Image();
  left.src = "jetpackguyflip.png"; 

  // Load Content 
  for (var i = 0; i < 1000; i++) {
    particles.push(new particle(0,0,0,0,0)); 
  }
  for (var i = 0; i < 1000; i++) {
    jetparticles.push(new particle(0,0,0,0,0)); 
  }
  
  canvas.addEventListener("mouseup",upsies, false); 
  canvas.addEventListener("mousedown",downsies, false); 
  canvas.addEventListener("click", clickie, false);
  document.onmousemove = movesies;
   
  // start main gameloop  
  window.setInterval(gameloop, 1000 / fps);

// CLICK EVENT
function clickie(e) {
  var x = new drop(pl.x + pl.width / 2, pl.y + pl.height,10,10);
  playerdrops.push(x);
  if (currentstate == "start") currentstate = "playing";
  if (currentstate == "end"&& intersect(mouse,clickrec)) currentstate = "playing";

}

// mouse releaseevent
function upsies(e) {
   mouse.isdown = false;
}

function downsies(e) {
  mouse.isdown = true;
}


function addEnemy(x , y) {
  var x = new enemy(x, y, 50,50);
  enemies.push(x); 
}

function addPickup(x, y) {
  var y = new pickup(x, y, 30, 30);
  pickups.push(y);
}

function removeEnemy(en) {
    enemies.pop(en);
}

function removePickup(pu) {
  pickups.pop(pu);
}

function fliercreation() {
 if (Math.random() < .08) {
   if (Math.random() < .5) {
     var f = new flier(canvas.width,canvas.height * Math.random(),50,50);
     fliers.push(f);
   } else {
     var f = new flier(0, canvas.height * Math.random(),50,50);
     fliers.push(f);
   }
 }
} 
function enemycreation() {
  if (Math.random() * 100 < 15) {
    addEnemy((Math.random() * canvas.width), canvas.height - 60);
  }
}

function pickupcreation() {
 if (pickups.length < level) {
   addPickup( 
     Math.random() *(canvas.width - 30), 
     canvas.height - 40);  

 }
}
function dyingalways() {
  if (pl.health <= 0) {
   currentstate = "end";
   level = 1
   numpickups = pl.pickups
   pl.die()
   fliers = new Array();
   playerdrops = new Array();
   pickups = new Array();
   enemies = [] 
   for (var i in particles) {
     particles[i].isactive = false;
   }

  }
}
function particlecreation(x, y) {
  var num = 50;
  var counter = 0;
  var pportion = Math.random() * particles.length - num; 
  for (var i = 0; i < 50; i++) {
    var xvel = Math.random() * 8 - 4;
    var yval = Math.random() * 8 - 4;
    var acceleration = Math.random() * 1;
      particles[i + Math.floor(pportion) + 1].reset(x,y,xvel,yval,acceleration);
  }
}

function jetparticlecreation(x , y, direction) {
  var num = 1;
  var counter = 0;
  y = y + pl.height / 2;
  var pportion = Math.random() * particles.length - num; 
  for (var i = 0; i < num; i++) {
    if (direction == "right") {
      var xvel = 15;
      x = x + pl.width;
    }
    if (direction == "left") {
      var xvel = -15;
    }
    var yvel = 0;
    var acceleration = 0;
    jetparticles[i + Math.floor(pportion)].reset(x,y,xvel,yvel,acceleration);
  }
}
function particledeletion() {
  var sc = { x: 0 , y: 0, width: canvas.width, height: canvas.height }
  for (var i in particles) {
    if (!intersect(particles[i],sc)) {
      particle[i].isactive = true;
    } else {
      particle[i].isactive = false;
    }
  }

}  

function intersect(r1, r2) {
  return (r1.x < r2.x + r2.width 
          && r1.x + r1.width > r2.x
	  && r1.y < r2.y + r2.height
 	  && r1.y + r1.height > r2.y);
}



function enemycollision() {
  for (var i in enemies) {
    for (var j in playerdrops) {
      var e = enemies[i];
      var d = playerdrops[j];
      if (e == undefined) return;
      if (intersect(e,d)) {
        delete enemies[i];
        particlecreation(e.x,e.y);     
      }
    } 
  }
}

function playerenemycollision() {
  for (var i in enemies) {
    var e = enemies[i];
    if (intersect(pl,e)) {
      pl.takedamage(e.damage);
    }
  }
}

function playerfliercollision() {
  for (var i in fliers) {
   var f = fliers[i]
   if (f == undefined) return;
   if (intersect(f, pl)) 
     pl.takedamage(f.damage);
  }
}

function pickupcollision() {
  for (var i in pickups) {
    var p = pickups[i];
    if (intersect(p, pl)) {
      removePickup(p);
      pl.pickups++
    } 
  }
}

function fliercollision() {
  for (var i in fliers) {
    for (var j in jetparticles) {
      var f = fliers[i]
      var p = jetparticles[j]
      var rec = new rectangle(
        pl.x - 20, 
        pl.y - 20, 
        pl.width -20, 
        pl.height - 20);
      if (f == undefined) return;
      if (intersect(f,p) || (intersect(f,rec) && mouse.isdown)) {
	particlecreation(f.x,f.y);
        delete fliers[i];
      }
    }
  }
} 

function movesies(e) {
  mouse.x = e.pageX - findPos(canvas).x;
  mouse.y = e.pageY - findPos(canvas).y;
}

function rectangle(x,y,w,h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
}

function player(x, y, w, h) {
  this.x = x
  this.y = y
  this.width = w
  this.height = h
  this.speed = 10 
  this.health = 100
  this.isattacking = false
  this.pickups = 0 
  this.direction = "right"
  this.update = function() {
    	if (mouse.x > this.x) {
          if (mouse.isdown) { if (Math.random() < .2)
	    jetparticlecreation(
	      this.x,
	      this.y,
              "right");
          }
          this.x += this.speed;
          this.direction = "right";
	}
       	
        if (mouse.x < this.x) {
          if (mouse.isdown) { if (Math.random() < .5)
	    jetparticlecreation(
	      this.x,
	      this.y,
              "left");
          }

          this.x -= this.speed
          this.direction = "left";
	}

	if (mouse.y > this.y) {
          this.y += this.speed;
	}

	if (mouse.y < this.y) {
          this.y -= this.speed;
          if (this.y < mouse.y + 3 && this.y > mouse.y - 3) return;
        } 
  }
  this.takedamage = function(hp) {
    this.health -= hp;
  }

  this.die = function() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 3;
    this.health = 100; 
    this.pickups = 0
  }

}

function enemy(x, y, w, h) {
  this.x = x
  this.y = y
  this.ystart
  this.xstart
  this.width = w
  this.height = h
  this.damage = .6 
  this.ticker = 0
  this.acceleration = 0

  this.state = 1 //state walking = 1 , jumping = 0 
  this.speed = 1//this is the speed that the enemy moves towards player
  this.update = function() {
    if (pl.x >= canvas.width || pl.x <= 0) return;	
    if (pl.x >= this.x) this.x += this.speed;
    if (pl.x <= this.x) this.x -= this.speed;
  }
} 

function drop(x, y, w, h) {
  this.x = x
  this.y = y
  this.width = w
  this.height = h
  this.speed = 1.5
  this.update = function() { this.y += this.speed }
}
 
function pickup(x, y, w, h) {
  this.x = x
  this.y = y
  this.width = w
  this.height = h
 } 

function particle(x , y, xvel, yvel, acceleration) {
  this.x = x
  this.y = y
  this.ystart = y
  this.xstart = x
  this.width = 10
  this.height = 10
  this.xvel = xvel
  this.yvel = yvel
  this. acceleration  = acceleration
  this.isactive = false
  this.tickcounter = 0

  this.reset = function(x , y, xvel, yvel, acceleration) {
    this.x = x
    this.y = y
    this.ystart = y
    this.xstart = x
    this.width = 10
    this.height = 10
    this.xvel = xvel
    this.yvel = yvel
    this. acceleration  = acceleration
    this.isactive = true; 
    this.tickcounter = 0
   }
 
  this.update = function() {
    this.tickcounter++
    this.y = this.ystart + this.yvel * this.tickcounter + this.acceleration * Math.pow(this.tickcounter, 2) / 2;
    this.x = this.xvel *  this.tickcounter + this.xstart; 

  }
}

function flier(x , y, w, h) {
  this.x = x
  this.y = y
  this.width = w
  this.height = h
  this.speed = 6 
  this.imagearray = []
  this.imageindex = 0 
  this.damage = 2;   
  this.update = function() {
    if (this.x > pl.x + pl.height) {
      this.x -= this.speed 
    }
    if (this.x < pl.x) {
      this.x += this.speed
    }

    if (this.y > pl.y + pl.height) {
      this.y -= this.speed 
    }
    
    if (this.y < pl.y) {
      this.y += this.speed
    } 
  }
  this.draw = function(graphics) {
  }
}
 
  
function gameloop() {
  Draw()
  Update()
  if (currentstate == "playing") {
  enemycreation()
  pickupcreation()
  fliercreation()
  fliercollision()
  enemycollision()
  pickupcollision()
  playerenemycollision()
  playerfliercollision()
  dyingalways()
  } 
}

function slopeMouseToPoint(x1, y1) {
  return slope(mouse.x, mouse.y, x1, y1); 
}

function slope( x1, y1, x2, y2 ) {
  return (x2 - x1) / (y2 -y1);
}

function Update() {
  if (currentstate == "playing") { 
	  pl.update();
	  for (var i in particles) {
	      particles[i].update();
	  } 
	  for (var i in jetparticles) {
	      jetparticles[i].update();
	  }  
	  for (var i in playerdrops) {
	    playerdrops[i].update(); 
	  } 
	  for (var i in enemies) {
	    enemies[i].update();
	  }
	  for (var i in fliers) {
	    fliers[i].update();
	  }
  }
}

function Draw() {
  if (currentstate == "start") {
    graphics.clearRect(0,0,canvas.width, canvas.height);
    graphics.drawImage(start,0,0);
    graphics.font = "30px Arial"; 
    graphics.fillText("The red things on the ground will kill you.", 0,30);
    graphics.fillText("So will the flying red things.",0,70); 
    graphics.fillText("These things are whatever you want.  Use you imagination.",0 ,110);
   graphics.fillText("Click to drop things that will kill the other things",0,150);
   graphics.fillText("Drag to shoot things that will kill the flying things",0,190);
  graphics.fillText("Your goal is to collect as many red balls as possible. ", 0, 230);

  
  }
  if (currentstate == "end") {
    graphics.clearRect(0,0, canvas.width, canvas.height);
    graphics.drawImage(end, 0, 0);
    graphics.fillText("SHINEY RED BALLS: " + numpickups, 200,500);
    graphics.fillText("CLICK HERE TO PLAY AGAIN!!!!",0,80); 
  } 
  if (currentstate == "playing") {
  graphics.clearRect(0,0,canvas.width,canvas.height);
  graphics.drawImage(back,findPos(canvas).x,0);
  graphics.drawImage(back,0 + canvas.width/ 2, 0); 
  graphics.font = "40px Arial"; 
  graphics.fillText("SHINEY RED BALLS! = " + pl.pickups, canvas.width /3, 40);
  if (pl.direction == "right") 
    graphics.drawImage(right, pl.x,pl.y);
  if (pl.direction == "left")
    graphics.drawImage(left, pl.x , pl.y); 
  // draw particles
  for (var m in particles) {
    var pr = particles[m];
    if (pr.isactive)
      graphics.drawImage(blood, pr.x,pr.y);
  }
   for (var m in jetparticles) {
    var pr = jetparticles[m];
    if (pr.isactive)
      graphics.drawImage(fire, pr.x,pr.y);
  } 
   
  // draw drops
  for (var i = 0; i < playerdrops.length; i++) {
    var ar = playerdrops[i];
    graphics.drawImage(fire,ar.x,ar.y);
  }
  // draw enemies
  for (var j in enemies) {
   var enim = enemies[j];
   graphics.drawImage(img1, enim.x, enim.y);
  }
  //draw pickups
  for (var k in pickups) {
    var pic = pickups[k]; 
    graphics.drawImage(pickupimg, pic.x,pic.y);
  }
  // draw fliers
  for (var m in fliers) {
    var f = fliers[m];
    graphics.drawImage(cflier, f.x, f.y);
  }
  // draw healthbar
  graphics.fillText("Health: ", findPos(canvas).x, 33);
  graphics.fillStyle = "red"; 
  graphics.fillRect(10, 45, pl.health * 2, 20);
   
  }


  //draw boarders
  graphics.fillStyle = "black";
  graphics.fillRect(canvas.width- 10, 0,10,canvas.height);
  graphics.fillRect(0,canvas.height -10,canvas.width,10);
  
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
