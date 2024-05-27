// Em Ishida
// Created: 5/21/2024
// Phaser: 3.70.0
//
// Sugar Rush
//
// A platformer
//
// Uses code borrowed from Jim Whitehead
// 
// Art assets from Kenny Assets

// debug with extreme prejudice
"use strict"

const screenWidth = 1440; // Width of one screen
const totalWidth = screenWidth * 3; // Total width of the game world
const screenHeight = 720; // Height of the screen

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: screenWidth,
    height: screenHeight,
    scene: [Load, Platformer, GameOver]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);