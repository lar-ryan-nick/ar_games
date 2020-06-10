# AR Card Game

## Authors

##### Ryan Wiener
##### Jake Bliss

## Description

A website to play card games through AR with a local and networked option.

To play the game, go to the webpage and point your camera at the image target ![](public/images/back.png)

Then once text appears at the top of the card, tap where the card is on your screen to place a card. Continue until the game is over.

## Instructions

### Inital Setup

##### Installations

Install `node.js` and `npm` through your OS. Then install `express` and `socket.io` through `npm`.

##### HTTPS Setup

Create a self signed certificate with the key as `encryption/private.key` and certificate as `encryption/domain.crt`.

### Subsequent Running

To start the server on port 443 (https): `sudo node server.js`

The webpage will then be hosted at `/` for local play and `/network` for networked play.
