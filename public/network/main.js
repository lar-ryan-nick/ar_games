var currentPlayer = 0;

AFRAME.registerComponent('main', {
	init: function() {
		this.playerTarget = document.getElementById('player_card')
		this.playerText = document.getElementById('player-text')
		this.countText = document.getElementById('card-count')
		this.playerShip = document.getElementById('player-ship');
		this.opponentShip = document.getElementById('opponent-ship');
		this.leftBeam = document.getElementById('left-beam');
		this.rightBeam = document.getElementById('right-beam');

		this.placeCard = this.placeCard.bind(this);
		this.clearCards = this.clearCards.bind(this);
		this.runAnimation = this.runAnimation.bind(this);

		this.socket = io.connect('https://fog.mat.ucsb.edu');
		this.socket.on('start', (data) => {
			this.playerText.setAttribute('value', 'The game has started');
		});
		this.socket.on('card', (data) => {
			if (data.clear) {
				this.clearCards();
			}
			this.placeCard(data.player, data.card, data.offset, data.back);
			this.countText.setAttribute('value', data.handCount);
			if (data.winner >= 0) {
				this.runAnimation(data.winner, data.offset);
			}
		});
		this.socket.on('end', (data) => {
			if (data.won) {
				this.playerText.setAttribute('value', 'You win!');
				return;
			}
			this.playerText.setAttribute('value', 'You lose');
		});

		const playerTappable = document.getElementById('player-tappable')
		playerTappable.addEventListener('click', (event) => {
			this.socket.emit('card', {});
		});
	},

	placeCard: function(isPlayer, card, offset, back) {
		const image = document.createElement('a-image')
		image.object3D.scale.set(0.75, 0.75, 0.75)
		let xOffset = 0;
		let yOffset = offset;
		let zOffset = offset;
		if (!isPlayer) {
			yOffset -= 1
		}
		image.object3D.position.set(xOffset, yOffset, zOffset)
		if (!back) {
			image.setAttribute('src', "#" + card.Suit + "_" + card.Value.toLowerCase())
		} else {
			image.setAttribute('src', "#back")
		}
		this.playerTarget.appendChild(image)
	},

	clearCards: function() {
		this.playerShip.object3D.visible = false;
		this.opponentShip.object3D.visible = false;
		this.leftBeam.object3D.visible = false;
		this.rightBeam.object3D.visible = false;
		this.playerShip.removeAttribute('animation');
		this.opponentShip.removeAttribute('animation');
		this.leftBeam.removeAttribute('animation');
		this.rightBeam.removeAttribute('animation');
		this.leftBeam.removeAttribute('animation__2');
		this.rightBeam.removeAttribute('animation__2');
		this.playerTarget.querySelectorAll('a-image').forEach(element => {
			if (element.className != 'noremove') {
				this.playerTarget.removeChild(element)
			}
		})
	},

	runAnimation: function(playerWon, offset) {
		this.playerShip.removeAttribute('animation');
		this.opponentShip.removeAttribute('animation');
		this.leftBeam.removeAttribute('animation');
		this.rightBeam.removeAttribute('animation');
		this.leftBeam.removeAttribute('animation__2');
		this.rightBeam.removeAttribute('animation__2');

		this.playerShip.object3D.position.z = (.2 + offset)
		this.opponentShip.object3D.position.z = (.2 + offset)
		this.playerShip.object3D.visible = true;
		this.opponentShip.object3D.visible = true;
		this.leftBeam.object3D.visible = true;
		this.rightBeam.object3D.visible = true;

		this.leftBeam.setAttribute("animation__2", "property: visible; from: true; to: false; delay: 3000")
		this.rightBeam.setAttribute("animation__2", "property: visible; from: true; to: false; delay: 3000")

		if (playerWon) {
			this.opponentShip.setAttribute('animation', 'property: visible; from: true; to: false; delay: 3000');

			this.rightBeam.setAttribute("position", ".1 .1 " + (.1 + offset))
			this.rightBeam.setAttribute("material", "opacity: .8; color: green")
			this.rightBeam.setAttribute("animation", "property: position; to: .1 -1 " + (.1 + offset) + "; dur: 200; easing: linear; loop: true")

			this.leftBeam.setAttribute("position", "-.1 .1 " + (.1 + offset))
			this.leftBeam.setAttribute("material", "opacity: .8; color: green")
			this.leftBeam.setAttribute("animation", "property: position; to: -.1 -1 " + (.1 + offset) + "; dur: 200; easing: linear; loop: true")
		} else {
			this.playerShip.setAttribute('animation', 'property: visible; from: true; to: false; delay: 3000');

			this.rightBeam.setAttribute("position", ".1 -1 " + (.1 + offset))
			this.rightBeam.setAttribute("material", "opacity: .8; color: red")
			this.rightBeam.setAttribute("animation", "property: position; to: .1 .1 " + (.1 + offset) + "; dur: 200; easing: linear; loop: true")

			this.leftBeam.setAttribute("position", "-.1 -1 " + (.1 + offset))
			this.leftBeam.setAttribute("material", "opacity: .8; color: red")
			this.leftBeam.setAttribute("animation", "property: position; to: -.1 .1 " + (.1 + offset) + "; dur: 200; easing: linear; loop: true")
		}
	}
});
