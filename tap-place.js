AFRAME.registerComponent('tap-place', {
	init: function() {
		const ground = document.getElementById('ground')
		ground.addEventListener('click', event => {
			// Create new entity for the new object
			const newElement = document.createElement('a-image')

			// The raycaster gives a location of the touch in the scene
			const touchPoint = event.detail.intersection.point
			// Random here to prevent z fighting
			touchPoint.y += Math.random() * .5 + 0.01
			newElement.setAttribute('position', touchPoint)
			/*
			const randomYRotation = Math.random() * 360
			newElement.setAttribute('rotation', '0 ' + randomYRotation + ' 0')
			*/
			//newElement.setAttribute('visible', 'false')
			newElement.object3D.scale.set(3, 3, 3)
			// Rotate to orient with camera
			const camera = document.getElementById('camera')
			const yaw = camera.object3D.rotation.y
			newElement.object3D.rotation.set(Math.PI / 2.0, 0, -yaw)

			newElement.setAttribute('src', '#hearts-queen')
			this.el.sceneEl.appendChild(newElement)
			/*
			newElement.addEventListener('model-loaded', () => {
				// Once the model is loaded, we are ready to show it popping in using an animation
				newElement.setAttribute('visible', 'true')
				newElement.setAttribute('animation', {
					property: 'scale',
					to: '0.01 0.01 0.01',
					easing: 'easeOutElastic',
					dur: 800,
				})
			})
			*/
		})
	}
})
