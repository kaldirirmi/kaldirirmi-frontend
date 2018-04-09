; (function () {
    "use strict";

    // General
    var canvas,
      screen,
      gameSize,
      game;

    // Assets
    var invaderCanvas,
      invaderMultiplier,
      invaderSize = 20,
      initialOffsetInvader,
      invaderAttackRate,
      invaderSpeed,
      invaderSpawnDelay = 250;

    // Counter
    var i = 0,
      kills = 0,
      currentLevel = 0,
      spawnDelayCounter = invaderSpawnDelay;

    var invaderDownTimer;

    // Text
    var blocks = [
          [1, 3, 5, 6, 7, 9, 12, 14, 16, 20, 22, 23, 26, 27, 28],
          [1, 3, 5, 7, 9, 11, 14, 16, 17, 20, 22, 24, 26, 28],
          [1, 2, 3, 5, 6, 7, 9, 10, 14, 16, 18, 20, 22, 24, 26, 27, 28],
          [3, 5, 7, 9, 11, 14, 16, 19, 20, 22, 24, 26, 28],
          [1, 2, 3, 5, 7, 9, 12, 14, 16, 20, 22, 23, 26, 28]
    ];

    // Game Controller
    // ---------------
    var Game = function () {

        this.level = -1;
        this.lost = false;
        this.nextLevelLocker = false;
        this.firstTime = true;

        this.player = new Player();
        this.invaders = [];
        this.invaderShots = [];

        if (invaderDownTimer === undefined) {
            invaderDownTimer = setInterval(function () {
                for (i = 0; i < game.invaders.length; i++) game.invaders[i].move();
            }, 1000 - (this.level * 1.8));

        };
    }

    Game.prototype = {
        update: function () {

            // Bu demektirki hepsini vurdun
            // Next level
            if (game.invaders.length === 0) {

                var nxt = document.getElementById('nextlevelDialog');

                //console.log('Length : ' + game.invaders.length  +  'this.level :' + this.level  + ' this.nextLevelLocker' + this.nextLevelLocker  );

                spawnDelayCounter += 1;
                if (spawnDelayCounter < invaderSpawnDelay) return;

                if(this.firstTime)
                {
                    this.level += 1;
                    currentLevel += 1;
                    invaderAttackRate -= 0.002;
                    invaderSpeed += 10;
                    game.invaders = createInvaders();
                    this.firstTime = false;

                    //console.log('this.firstTime ' + this.firstTime + ' , this.level' + this.level);
                }
                else {
                    //console.log('first tam dğil : => ' + this.firstTime);

                    if (!this.nextLevelLocker) {

                        this.level += 1;
                        currentLevel += 1;
                        invaderAttackRate -= 0.002;
                        invaderSpeed += 10;
                        this.nextLevelLocker = true;
                        document.getElementById('nextLevelText').innerText = 'Tebrikler, ' + this.level + '. Seviyeyi Tamamladın!';
                        nxt.open();
                    }
               
                }


                var nxtButton = document.getElementById('nextLevelButton');
                nxtButton.addEventListener('click', function () {
                    game.nextLevelLocker = false;
                    game.invaders = createInvaders();
                    nxt.close();
                });

                spawnDelayCounter = 0;
            }

            if (!this.lost) {

                // Collision
                game.player.projectile.forEach(function (projectile) {
                    game.invaders.forEach(function (invader) {
                        if (collides(projectile, invader)) {
                            invader.destroy();
                            projectile.active = false;
                        }
                    });
                });

                this.invaderShots.forEach(function (invaderShots) {
                    if (collides(invaderShots, game.player)) {
                        game.player.destroy();
                    }
                });

                for (i = 0; i < game.invaders.length; i++) game.invaders[i].update();

            }

            // Don't stop player & projectiles.. they look nice
            game.player.update();
            for (i = 0; i < game.invaderShots.length; i++) game.invaderShots[i].update();

            this.invaders = game.invaders.filter(function (invader) {
                return invader.active;
            });

        },

        draw: function () {

            if (this.lost) {
                screen.fillStyle = "rgba(0, 0, 0, 0.03)";
                screen.fillRect(0, 0, gameSize.width, gameSize.height);

                document.getElementById('app-box').style.backgroundColor = "#121212";

                screen.font = "55px Lucida Console";
                screen.textAlign = "center";
                screen.fillStyle = "white";
                screen.fillText("Kaybettin, Tekrar Denemelisin!", gameSize.width / 2, gameSize.height / 2);
                screen.font = "20px Lucida Console";
                screen.fillText("Puanın: " + kills, gameSize.width / 2, gameSize.height / 2 + 30);

                document.getElementById('restart').style.display = "inline-flex";
                document.getElementById('instructors').style.display = "none";

            } else {
                screen.clearRect(0, 0, gameSize.width, gameSize.height);

                screen.font = "22px Lucida Console";
                screen.textAlign = "right";
                screen.fillText("Level: " + currentLevel, gameSize.width, gameSize.height - 32);

                screen.font = "20px Lucida Console";
                screen.textAlign = "right";
                screen.fillText("Puan: " + kills, gameSize.width, gameSize.height - 12);
            }

            screen.beginPath();

            var i;
            this.player.draw();
            if (!this.lost)
                for (i = 0; i < this.invaders.length; i++) this.invaders[i].draw();
            for (i = 0; i < this.invaderShots.length; i++) this.invaderShots[i].draw();

            screen.fill();

        },

        invadersBelow: function (invader) {
            return this.invaders.filter(function (b) {
                return Math.abs(invader.coordinates.x - b.coordinates.x) === 0 &&
                  b.coordinates.y > invader.coordinates.y;
            }).length > 0;
        }

    };

    // Invaders
    // --------
    var Invader = function (coordinates) {
        this.active = true;
        this.coordinates = coordinates;
        this.size = {
            width: invaderSize,
            height: invaderSize
        };

        this.patrolX = 0;
        this.speedX = invaderSpeed;

    };

    Invader.prototype = {
        update: function () {

            if (Math.random() > invaderAttackRate && !game.invadersBelow(this)) {
                var projectile = new Projectile({
                    x: this.coordinates.x + this.size.width / 2,
                    y: this.coordinates.y + this.size.height - 5
                }, {
                    x: 0,
                    y: 2
                });
                game.invaderShots.push(projectile);
            }

        },
        draw: function () {
            if (this.active) screen.drawImage(invaderCanvas, this.coordinates.x, this.coordinates.y);

        },
        move: function () {
            if (this.patrolX < 0 || this.patrolX > 100) {
                this.speedX = -this.speedX;
                this.patrolX += this.speedX;
                this.coordinates.y += this.size.height;

                if (this.coordinates.y + this.size.height * 2 > gameSize.height) game.lost = true;

            } else {
                this.coordinates.x += this.speedX;
                this.patrolX += this.speedX;
            }

        },
        destroy: function () {
            this.active = false;
            kills += 1;

        }

    };

    // Player
    // ------
    var Player = function () {
        this.active = true;
        this.size = {
            width: 16,
            height: 8
        };
        this.shooterHeat = -3;
        this.coordinates = {
            x: gameSize.width / 2 - (this.size.width / 2) | 0,
            y: gameSize.height - this.size.height * 2
        };

        this.projectile = [];
        this.keyboarder = new KeyController();
    };

    Player.prototype = {
        update: function () {

            for (var i = 0; i < this.projectile.length; i++) this.projectile[i].update();

            this.projectile = this.projectile.filter(function (projectile) {
                return projectile.active;
            });

            if (!this.active) return;

            if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) && this.coordinates.x > 0) this.coordinates.x -= 2;
            else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT) && this.coordinates.x < gameSize.width - this.size.width) this.coordinates.x += 2;

            if (this.keyboarder.isDown(this.keyboarder.KEYS.Space)) {
                this.shooterHeat += 1;
                if (this.shooterHeat < 0) {
                    var projectile = new Projectile({
                        x: this.coordinates.x + this.size.width / 2 - 1,
                        y: this.coordinates.y - 1
                    }, {
                        x: 0,
                        y: -7
                    });
                    this.projectile.push(projectile);
                } else if (this.shooterHeat > 12) this.shooterHeat = -3;
            } else {
                this.shooterHeat = -3;
            }

        },
        draw: function () {
            if (this.active) {
                screen.rect(this.coordinates.x, this.coordinates.y, this.size.width, this.size.height);
                screen.rect(this.coordinates.x - 2, this.coordinates.y + 2, 20, 6);
                screen.rect(this.coordinates.x + 6, this.coordinates.y - 4, 4, 4);
            }

            for (var i = 0; i < this.projectile.length; i++) this.projectile[i].draw();

        },
        destroy: function () {
            this.active = false;
            game.lost = true;
        }
    };

    // Projectile
    // ------
    var Projectile = function (coordinates, velocity) {
        this.active = true;
        this.coordinates = coordinates;
        this.size = {
            width: 3,
            height: 3
        };
        this.velocity = velocity;
    };

    Projectile.prototype = {
        update: function () {
            this.coordinates.x += this.velocity.x;
            this.coordinates.y += this.velocity.y;

            if (this.coordinates.y > gameSize.height || this.coordinates.y < 0) this.active = false;

        },
        draw: function () {
            if (this.active) screen.rect(this.coordinates.x, this.coordinates.y, this.size.width, this.size.height);

        }
    };

    // Keyboard input tracking
    // -----------------------
    var KeyController = function () {
        this.KEYS = {
            LEFT: 37,
            RIGHT: 39,
            Space: 32
        };
        var keyCode = [37, 39, 32];
        var keyState = {};

        var counter;
        window.addEventListener('keydown', function (e) {
            for (counter = 0; counter < keyCode.length; counter++)
                if (keyCode[counter] == e.keyCode) {
                    keyState[e.keyCode] = true;
                    e.preventDefault();
                }

        });

        window.addEventListener('keyup', function (e) {
            for (counter = 0; counter < keyCode.length; counter++)
                if (keyCode[counter] == e.keyCode) {
                    keyState[e.keyCode] = false;
                    e.preventDefault();
                }
        });

        this.isDown = function (keyCode) {
            return keyState[keyCode] === true;
        };

    };

    // Other functions
    // ---------------
    function collides(a, b) {
        return a.coordinates.x < b.coordinates.x + b.size.width &&
          a.coordinates.x + a.size.width > b.coordinates.x &&
          a.coordinates.y < b.coordinates.y + b.size.height &&
          a.coordinates.y + a.size.height > b.coordinates.y;
    }

    function getPixelRow(rowRaw) {
        var textRow = [],
          placer = 0,
          row = Math.floor(rowRaw / invaderMultiplier);
        if (row >= blocks.length) return [];
        for (var i = 0; i < blocks[row].length; i++) {
            var tmpContent = blocks[row][i] * invaderMultiplier;
            for (var j = 0; j < invaderMultiplier; j++) textRow[placer + j] = tmpContent + j;
            placer += invaderMultiplier;
        }
        return textRow;
    }

    // Write Text
    // -----------
    function createInvaders() {
        var invaders = [];

        var i = blocks.length * invaderMultiplier;
        while (i--) {
            var j = getPixelRow(i);
            for (var k = 0; k < j.length; k++) {
                invaders.push(new Invader({
                    x: j[k] * invaderSize,
                    y: i * invaderSize
                }));
            }
        }
        return invaders;
    }

    // // Start game
    // // ----------
    // window.addEventListener('load', function () {
    //     var invaderAsset = new Image;
    //     invaderAsset.onload = function () {

    //         invaderCanvas = document.createElement('canvas');
    //         invaderCanvas.width = invaderSize;
    //         invaderCanvas.height = invaderSize;
    //         invaderCanvas.getContext("2d").drawImage(invaderAsset, 0, 0);

    //         // Game Creation
    //         canvas = document.getElementById("space-invaders");
    //         screen = canvas.getContext('2d');
    //         initGameStart();

    //     };
    //     invaderAsset.src = "/assets/img/kalspacer.png";


    //     setTimeout(function () {
    //         document.getElementById('dialogAlarma').open();
    //     }, 300);

    //     document.getElementById('pbStartGame').addEventListener('click', function () {
    //         document.getElementById('dialogAlarma').close();
    //         loop();
    //     });

    // });


    // window.addEventListener('resize', function () {
    //     initGameStart();
    // });
    // document.getElementById('restart').addEventListener('click', function () {
    //     document.getElementById('app-box').style.backgroundColor = 'white';
    //     document.getElementById('restart').style.display = "none";
    //     document.getElementById('instructors').style.display = "block";

    //     initGameStart();
    // });

    // function initGameStart() {
    //     if (window.innerWidth > 1200) {
    //         screen.canvas.width = 1200;
    //         screen.canvas.height = 400;
    //         gameSize = {
    //             width: 1200,
    //             height: 400
    //         };
    //         invaderMultiplier = 2;
    //         initialOffsetInvader = 420;
    //     } else if (window.innerWidth > 800) {
    //         screen.canvas.width = 900;
    //         screen.canvas.height = 600;
    //         gameSize = {
    //             width: 900,
    //             height: 600
    //         };
    //         invaderMultiplier = 1;
    //         initialOffsetInvader = 280;
    //     } else {
    //         screen.canvas.width = 600;
    //         screen.canvas.height = 300;
    //         gameSize = {
    //             width: 600,
    //             height: 300
    //         };
    //         invaderMultiplier = 1;
    //         initialOffsetInvader = 140;
    //     }

    //     kills = 0;
    //     invaderAttackRate = 0.999;
    //     invaderSpeed = 25;
    //     spawnDelayCounter = invaderSpawnDelay;
    //     currentLevel = 0;
    //     game = new Game();
    // }
    // function loop() {
    //     game.update();
    //     game.draw();

    //     requestAnimationFrame(loop);
    // }

})();