// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = document.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = document.getElementById("platforms");
   
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = document.getElementById("platforms");
    
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var GOOD_THING_SIZE = new Size(30, 30);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 3;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 20;                     // The time interval of running the game
var DISAPPEAR_INTERVAL = 160;                     // The time interval of running the game
var ANIMATE_INTERVAL = 250;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 20.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The speed of a bullet
var bullets_remaining = 8;
var score = 0;
var time_remaining = 80;
var finished=false;
var count_down_timer; // Declare the two timers
var PORTAL_SIZE = new Size(50, 50);
var portal1 = new Point(0,270);
var portal2 = new Point(560, 230);
var EXIT_PORTAL_SIZE = new Size(40, 80);
var goodThingCount = 8;
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var player = null;                          // The player object
var gameInterval = null;                    // The interval
var disappearRate = 0;
var animateRate = 0;
var flip = false;
var name = "Anonymous";
var cheatMode = false;
var animateBack = false;
var ding = new Audio('ding.wav');
var shoot = new Audio('shoot.mp3');
var sad_game_over = new Audio('game_over.wav');
var win = new Audio('win.wav');
var monster_die = new Audio('monsterdie.wav');
var game_music = new Audio('tonightbyjin.mp3');

//
// The load function
//



function load() {
    // trigger prompt for name 
    // set name
    name = prompt("Please enter your name", name);
    if(!name) name = "Anonymous";
    document.getElementById("startUp").style.setProperty("visibility", "hidden", null);
    document.getElementById("startAgain").style.setProperty("visibility", "hidden", null);
    document.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    // Attach keyboard events
    document.documentElement.addEventListener("keydown", keydown, false);
    document.documentElement.addEventListener("keyup", keyup, false);
    game_music.volume = 0.30;
    game_music.play();
    // Create the player
    createName(20, 438);
    player = new Player();

    // Create the monsters
    for (var i = 0; i < 6; i++) {
        var x = Math.random() * 560; 
        var y = Math.random() * 500;
        while (x < 100 && (y > 340 && y < 500)) {
            x = Math.random() * 560;
            y = Math.random() * 520;
        }
        createMonster(x, y);
    }
    for (var j = 0; j < 8; j++) {
        var x = Math.random() * 560; 
        var y = Math.random() * 500;
        while (inPlatform(x, y)) {
            x = Math.random() * 560;
            y = Math.random() * 500;
        }
        createGoodThing(x, y);
    }

    // Create exit
    createEntrance(0, 400);

    // Create entrance
    createExit(60, 20);

    createPortal(portal1.x, portal1.y);
    createPortal(portal2.x, portal2.y)

    setInterval("throughPortal()", DISAPPEAR_INTERVAL);
    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

    //Start countdown
    count_down();
}

function inPlatform(x, y) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var platform = platforms.childNodes.item(i);
        if (platform.nodeName != "rect") continue;
        var px = parseInt(platform.getAttribute("x"));
        var py = parseInt(platform.getAttribute("y"));
        var width = parseInt(platform.getAttribute("width"));
        var height = parseInt(platform.getAttribute("height"));
        var platform_size = new Size(width, height);
        if (intersect(new Point(px, py), platform_size, new Point(x, y), GOOD_THING_SIZE)) {
            return true;
        }
    }   
    return false;
}

//
// This function creates the monsters in the game
//
function createName(x, y) {
    var playerName = document.getElementById("playerName");
    playerName.setAttribute("x", x);
    playerName.setAttribute("y", y);
    playerName.firstChild.data = name;
    playerName.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#playerName");
    document.getElementById("name").appendChild(playerName);
}


//
// This function creates the monsters in the game
//
function createGoodThing(x, y) {
    var coffee = document.createElementNS("http://www.w3.org/2000/svg", "use");
    coffee.setAttribute("x", x);
    coffee.setAttribute("y", y);
    coffee.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#coffee");
    document.getElementById("goodThing").appendChild(coffee);
}


//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    document.getElementById("monsters").appendChild(monster);
}

// function monsterShootBullets() {
//     if ()
//     var monster = document.getElementById("monsters").childNodes.item(0);
//      // Create the bullet using the use node
//     var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
//     bullet.setAttribute("x", monster.getAttribute("x") + MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2);
//     bullet.setAttribute("y", monster.getAttribute("y") + MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2);
//     bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
//     document.getElementById("monsterBullets").appendChild(bullet);
// }

//
// This function creates the exit in the game
//
function createExit(x, y) {
    var exit = document.createElementNS("http://www.w3.org/2000/svg", "use");
    exit.setAttribute("x", x);
    exit.setAttribute("y", y);
    exit.setAttribute("id", "exitP");
    exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exitPortal");
    document.getElementById("exit").appendChild(exit);
}


//
// This function creates the exit in the game
//
function createPortal(x, y) {
    var portal = document.createElementNS("http://www.w3.org/2000/svg", "use");
    portal.setAttribute("x", x);
    portal.setAttribute("y", y);
    portal.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#portal");
    document.getElementById("portals").appendChild(portal);
}


//
// This function creates the entrance in the game
//
function createEntrance(x, y) {
    var entrance = document.createElementNS("http://www.w3.org/2000/svg", "use");
    entrance.setAttribute("x", x);
    entrance.setAttribute("y", y);
    entrance.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#entrancePortal");
    document.getElementById("entrance").appendChild(entrance);
}

function animateMonsters() {
    if (animateRate % ANIMATE_INTERVAL == 0) {
        var monsters = document.getElementById("monsters");
        var x, y;
        for (var i = 0; i < monsters.childNodes.length; i++) {
            x = Math.random() * 30;
            y = Math.random() * 30;
            
            var monster = monsters.childNodes.item(i); 
            monster.setAttribute("transform", "translate(" + x +  "," + y + ")");   
        }
    }
    animateRate += GAME_INTERVAL;
}


function disappearPlatform() {
    var platforms = document.getElementById("platforms");

    for (var i = 0; i < platforms.childNodes.length; i++) {
        var platform = platforms.childNodes.item(i);
        if (platform.nodeName != "rect") continue;

        if (platform.getAttribute("type") == "disappearing") {
            var platformOpacity = parseFloat(platform.style.getPropertyValue("opacity"));
            var x = parseFloat(platform.getAttribute("x"));
            var y = parseFloat(platform.getAttribute("y"));
            var w = parseFloat(platform.getAttribute("width"));
            var h = parseFloat(platform.getAttribute("height"));

            if (((player.position.x + PLAYER_SIZE.w > x && player.position.x < x + w) ||
                 ((player.position.x + PLAYER_SIZE.w) == x && player.motion == motionType.RIGHT) ||
                 (player.position.x == (x + w) && player.motion == motionType.LEFT)) &&
                player.position.y + PLAYER_SIZE.h == y) {
                    platformOpacity -= 0.1;
                    platform.style.setProperty("opacity", platformOpacity, null);
                }

                if (platformOpacity == 0) {
                    document.getElementById("platforms").removeChild(platform);
                }         
        }
    }
}

function timeDisappear() {
    if (disappearRate % DISAPPEAR_INTERVAL == 0) {
        disappearPlatform();
    }
    disappearRate += GAME_INTERVAL;
}

function throughPortal() {
    var portals = document.getElementById("portals");

    for (var i = 0; i < portals.childNodes.length; i++) {
        var portal = portals.childNodes.item(i);
        var x = parseInt(portal.getAttribute("x"));
        var y = parseInt(portal.getAttribute("y"));
        if (intersect(new Point(x, y), PORTAL_SIZE, player.position, PLAYER_SIZE)) {
            // go to other portal 

            if (x == portal1.x) {
                player.position.x = portal2.x - 45;
                player.position.y = portal2.y;
                break;
            } else {
                player.position.x = portal1.x + 50;
                player.position.y = portal1.y;
                break;
            }
        }
    }
}

//
// This function shoots a bullet from the player
//
function shootBullet() {
    if(!cheatMode) {
        if (bullets_remaining > 0) {
            // Disable shooting for a short period of time
            canShoot = false;
            setTimeout("canShoot = true", SHOOT_INTERVAL);

            // Create the bullet using the use node
            var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
            bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
            bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
            bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
            document.getElementById("bullets").appendChild(bullet);
            bullets_remaining--;
            document.getElementById("bullet remain").innerHTML = bullets_remaining;
        }
    }  else {
        // Disable shooting for a short period of time
            canShoot = false;
            setTimeout("canShoot = true", SHOOT_INTERVAL);

            // Create the bullet using the use node
            var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
            bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
            bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
            bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
            document.getElementById("bullets").appendChild(bullet);
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            flip = true;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            flip = false;
            break;
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case "H".charCodeAt(0):
            if (canShoot) { 
                shoot.play();
                shootBullet();
            }
            break;

        case "C".charCodeAt(0):
            cheatMode = true;
            document.getElementById("bullet remain").innerHTML = "Infinite";
            break;
            //cheat mode

        case "V".charCodeAt(0):
            cheatMode = false;
            bullets_remaining = 8;
            document.getElementById("bullet remain").innerHTML = bullets_remaining;
            break;

        case "L".charCodeAt(0):
            clearHighScoreTable();
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
           if(!cheatMode) { 
                sad_game_over.play();
                game_over();
            }
        }
    }

    // Check whether a bullet hits a monster
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                monster_die.play();
                //write some code to update the score
                score += 10;
                document.getElementById("score").firstChild.data = score;
            }
        }
    }

    var goodThings = document.getElementById("goodThing");
    for (var i = 0; i < goodThings.childNodes.length; i++) {
        var goodThing = goodThings.childNodes.item(i);
        var x = parseInt(goodThing.getAttribute("x"));
        var y = parseInt(goodThing.getAttribute("y"));

        if (intersect(new Point(x, y), GOOD_THING_SIZE, player.position, PLAYER_SIZE)) {
                ding.play();
                score += 1;
                goodThings.removeChild(goodThing);
                goodThingCount--;
                document.getElementById("score").firstChild.data = score;
            }

    }


    if(goodThingCount == 0) {
        // Check if player reach door
        var exit = document.getElementById("exitP");
        var x = parseInt(exit.getAttribute("x"));
        var y = parseInt(exit.getAttribute("y"));            

        if (intersect(new Point(x, y), EXIT_PORTAL_SIZE, player.position, PLAYER_SIZE)) {
            score += time_remaining;
            document.getElementById("score").firstChild.data = score;
            game_over();
        }
    }
}
//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if(flip)
            node.setAttribute("x", x - BULLET_SPEED);
        else
            node.setAttribute("x", x + BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < -SCREEN_SIZE.w ) {
            bullets.removeChild(node);
            i--;
        }
    }

    bullets = document.getElementById("monsterBullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        
        node.setAttribute("x", x - BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < -SCREEN_SIZE.w ) {
            bullets.removeChild(node);
            i--;
        }
    }
}

//
// This function updates the position of the bullets
//
function moveMonsters() {
    // Go through all bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if(flip)
            node.setAttribute("x", x - BULLET_SPEED);
        else
            node.setAttribute("x", x + BULLET_SPEED);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < -SCREEN_SIZE.w ) {
            bullets.removeChild(node);
            i--;
        }
    }
}


var PLATFORM_MAX = 160;
var PLATFORM_MIN = 240;
var platform_speed = 1;

//
// This function updates the position of the platform
//
function movePlatform() {
    var platform = document.getElementById("vert");
    var y = parseInt(platform.getAttribute("y"));
    if(y == PLATFORM_MIN) {
        platform_speed = -platform_speed;
    } else if (y == PLATFORM_MAX) {
        if (platform_speed < 0.0) platform_speed = -platform_speed;
    }

    platform.setAttribute("y", y + platform_speed);
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
  //  monsterShootBullets();
    animateMonsters();
    // Check collisions
    collisionDetection();
    timeDisappear();    
    movePlatform();
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
   
     var playerName = document.getElementById("playerName");
    playerName.setAttribute("x", position.x + 20);
    playerName.setAttribute("y", position.y - 3);
    // Move the bullets
    moveBullets();
    updateScreen();
}

function count_down(){
 // decrease remaining time by one
 time_remaining = time_remaining - 1 ;

 // update the text disply
 document.getElementById("time").firstChild.data = time_remaining;

 // call the function again after one second or finish the game
 if (time_remaining == 0) {
    sad_game_over.play();
    game_over();
 }
 else count_down_timer = setTimeout("count_down()", 1000) ;
}

function game_over(){
 // Clear the game interval
    clearInterval(count_down_timer);
    clearInterval(gameInterval);

    // Get the high score table from cookies
    var highScoreTable = getHighScoreTable();

    // // Create the new score record
    var record = new ScoreRecord(name, score);

    // // Insert the new score record
    var position = 0;
    while (position < highScoreTable.length) {
        var curPositionScore = highScoreTable[position].score;
        if (curPositionScore < score)
            break;

        position++;
    }
    if (position <  5)
        highScoreTable.splice(position, 0, record);

    // Store the new high score table
    setHighScoreTable(highScoreTable);

    // Show the high score table
    showHighScoreTable(highScoreTable);
    document.getElementById("startAgain").style.setProperty("visibility", "visible", null);

    return;
}

function restart() {
    time_remaining = 80;
    bullets_remaining = 8;
    score = 0;

    //clear good things
    // clear monsters
    // remake disappearing platform 
    load();
}

//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    if(flip) {
        var x = player.position.x + 40;
        player.node.setAttribute("transform", "translate(" + x +  "," + player.position.y + ") scale(-1, 1)");   
    } else { 
        player.node.setAttribute("transform", "translate(" + player.position.x  + "," + player.position.y + ")");   
    }
} 

 