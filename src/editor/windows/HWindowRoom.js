import AbstractImage from '../../common/AbstractImage.js'
import {parent, endparent, add, HElement, HCanvas, HTextInput, HNumberInput, HColorInput, HCheckBoxInput, HRadioInput, HSelect, HOption, uniqueID} from '../../common/H.js'
import {ProjectBackground, ProjectObject, ProjectInstance, ProjectRoomBackground} from '../../common/Project.js'
import HResourceSelect from '../HResourceSelect.js';
import HTabControl from '../HTabControl.js';
import HWindow from '../HWindow.js';
import DefaultInstanceIcon from '../img/default-instance-icon.png';

export default class HWindowRoom extends HWindow {

	constructor(editor, id, room) {
		super(editor, id);

		this.room = room;

		this.title.html.textContent = 'Edit Room '+room.name;

		// Create paramInstances and paramBackgrounds as copies
		this.copyProperties();

		parent(this.client)
			parent( add( new HElement('div', {class: 'grid-resource resource-room'}) ) )
				parent( add( new HElement('div') ) )

					// left area

					this.inputSnapX = add( new HNumberInput('Snap X:', 16, 1, 1) )
					this.inputSnapY = add( new HNumberInput('Snap Y:', 16, 1, 1) )
					this.inputShowGrid = add( new HCheckBoxInput('Show grid', true) )

					this.tabControl = add( new HTabControl() )

					parent( this.tabControl.addTab('Instances') )

						this.selectObject = add( new HResourceSelect(this.editor, 'Object:', ProjectObject, true) )

						var toolGroup = '_radio_'+uniqueID();
						this.radioAdd =      add( new HRadioInput(toolGroup, 'Add instance', true) )
						this.radioMultiple = add( new HRadioInput(toolGroup, 'Add multiple instances') )
						this.radioMove =     add( new HRadioInput(toolGroup, 'Move instance') )
						this.radioDelete =   add( new HRadioInput(toolGroup, 'Delete instance') )

						this.inputSnapToGrid = add( new HCheckBoxInput('Snap to grid', true) )
						this.inputDeleteUnderlying = add( new HCheckBoxInput('Delete underlying', false) )

						endparent()

					parent( this.tabControl.addTab('Settings') )

						this.inputName = add( new HTextInput('Name:', room.name) )
						this.inputWidth = add( new HNumberInput('Width:', room.width, 1, 1) )
						this.inputHeight = add( new HNumberInput('Height:', room.height, 1, 1) )
						this.inputSpeed = add( new HNumberInput('Speed:', room.speed, 1, 1) )

						endparent()
					
					parent( this.tabControl.addTab('Backgrounds') )

						this.inputBackgroundColor = add( new HColorInput('Background color:', room.backgroundColor) )

						let getBackground = (index) => {
							let currentBackground = this.paramBackgrounds[index];
							if (currentBackground == null) {
								return new ProjectRoomBackground(); // default values used
							}
							return currentBackground;
						}

						let getOrCreateBackground = (index) => {
							if (this.paramBackgrounds[index] == null) {
								this.paramBackgrounds[index] = new ProjectRoomBackground(); // default values used
							}
							return this.paramBackgrounds[index];
						}

						let getOrCreateCurrentBackground = () => {
							let currentBackgroundId = this.selectBackgrounds.getValue();
							if (this.paramBackgrounds[currentBackgroundId] == null) {
								this.paramBackgrounds[currentBackgroundId] = new ProjectRoomBackground();
							}
							return this.paramBackgrounds[currentBackgroundId];
						}

						let updateBackgroundProperties = () => {
							let currentBackgroundId = this.selectBackgrounds.getValue();
							let currentBackground = getBackground(currentBackgroundId);

							this.inputBackgroundVisibleAtStart.setChecked(currentBackground.visibleAtStart);
							this.selectResourceBackground.setValue(currentBackground.backgroundIndex);
						}

						this.selectBackgrounds = add( new HSelect('Backgrounds:', 'backgrounds') )
						this.selectBackgroundsOptions = [];

						parent(this.selectBackgrounds.select)
							for (let i=0; i<8; ++i) {
								let background = getBackground(i);
								let _class = (background.visibleAtStart ? 'bold' : null);
								this.selectBackgroundsOptions[i] = add( new HOption('Background '+i.toString(), i, _class) )
							}
							endparent()

						this.selectBackgrounds.select.html.size = 8;

						this.selectBackgrounds.setOnChange(() => {
							updateBackgroundProperties();
						})

						this.inputBackgroundVisibleAtStart = add( new HCheckBoxInput('Visible when room starts') )
						this.inputBackgroundVisibleAtStart.setOnChange(() => {

							let currentBackgroundId = this.selectBackgrounds.getValue();
							let currentBackground = getOrCreateBackground(currentBackgroundId);

							currentBackground.visibleAtStart = this.inputBackgroundVisibleAtStart.getChecked();

							if (currentBackground.visibleAtStart) {
								this.selectBackgroundsOptions[currentBackgroundId].html.classList.add('bold');
							} else {
								this.selectBackgroundsOptions[currentBackgroundId].html.classList.remove('bold');
							}

						})

						this.selectResourceBackground = add( new HResourceSelect(this.editor, null, ProjectBackground) )
						this.selectResourceBackground.setOnChange(() => {
							getOrCreateCurrentBackground().backgroundIndex = this.selectResourceBackground.getValue();
						})

						updateBackgroundProperties();

						endparent()

					parent( add( new HElement('div', {}, 'X: ') ) )
						this.spanX = add( new HElement('span', {}, '0') );
						endparent()
					parent( add( new HElement('div', {}, 'Y: ') ) )
						this.spanY = add( new HElement('span', {}, '0') );
						endparent()
					parent( add( new HElement('div', {}, 'Object: ') ) )
						this.spanObject = add( new HElement('span') );
						endparent()
					parent( add( new HElement('div', {}, 'ID: ') ) )
						this.spanId = add( new HElement('span') );
						endparent()

					// updates
					this.inputSnapX.setOnChange(() => this.updateCanvasPreview())
					this.inputSnapY.setOnChange(() => this.updateCanvasPreview())
					this.inputShowGrid.setOnChange(() => this.updateCanvasPreview())

					this.inputWidth.setOnChange(() => this.updateCanvasPreview())
					this.inputHeight.setOnChange(() => this.updateCanvasPreview())
					this.inputBackgroundColor.setOnChange(() => this.updateCanvasPreview())

					endparent()
				parent( add( new HElement('div', {class: 'preview'}) ) )

					// actual room area

					this.canvasPreview = add( new HCanvas(room.width, room.height) );
					this.ctx = this.canvasPreview.html.getContext('2d');
					this.ctx.imageSmoothingEnabled = false;

					// TODO: account for sprite size when moving and deleting

					this.canvasPreview.html.onmousedown = (e) => {

						this.mouseIsDown = true;
						var pos = this.getMousePosition(e);
						var snappedPos = this.snapMousePosition(pos);

						this.currentPos = snappedPos;

						if (this.radioAdd.getChecked()) {
							this.movingInstance = this.addInstance(e);
						} else

						if (this.radioMultiple.getChecked()) {
							this.movingInstance = this.addInstance(e);
							this.deleteUnderlying(e);
						} else

						if (this.radioMove.getChecked()) {
							{
								let hover = this.getInstanceAtPosition(pos);
								if (hover) {
									this.movingInstance = hover;
								}
							}

						} else

						if (this.radioDelete.getChecked()) {
							{
								let hover = this.getInstanceAtPosition(pos);
								if (hover) {
									this.paramInstances = this.paramInstances.filter(i => i != hover);
								}
							}
						}

						this.updateCanvasPreview();

					}

					this.canvasPreview.html.onmousemove = (e) => {
						var pos = this.getMousePosition(e);
						var snappedPos = this.snapMousePosition(pos);

						if (this.mouseIsDown) {

							if (this.radioAdd.getChecked() || this.radioMove.getChecked()) {
								if (this.movingInstance) {
									this.movingInstance.x = snappedPos.x;
									this.movingInstance.y = snappedPos.y;
								}
							} else

							if (this.radioMultiple.getChecked()) {
								{
									let hover = this.getInstanceAtPosition(pos);
									if (hover != this.movingInstance) {
										this.currentPos = snappedPos;
										this.movingInstance = this.addInstance(e);
										this.deleteUnderlying(e);
									}
								}
							} else

							if (this.radioDelete.getChecked()) {
								{
									let hover = this.getInstanceAtPosition(pos);
									if (hover) {
										this.paramInstances = this.paramInstances.filter(i => i != hover);
									}
								}
							}

							this.updateCanvasPreview();
							
						}

						this.spanX.html.textContent = snappedPos.x;
						this.spanY.html.textContent = snappedPos.y;
						this.spanObject.html.textContent = '';
						this.spanId.html.textContent = '';

						{
							let hover = this.getInstanceAtPosition(pos);
							if (hover) {
								this.spanObject.html.textContent = this.editor.project.resources.ProjectObject
									.find(x => x.id == hover.object_index).name;
								if (hover.id != null) {
									this.spanId.html.textContent = hover.id;
								} else {
									this.spanId.html.textContent = "(not applied)";
								}
							}
						}

					}

					// is this... right?
					document.onmouseup = (e) => {
						this.mouseIsDown = false;

						if (this.movingInstance) {
							if (this.radioAdd.getChecked()) {
								this.deleteUnderlying(e);
							}
						}

						this.movingInstance = null;

						this.updateCanvasPreview();
					}

					endparent();
				endparent();

				this.defaultInstanceImage = new AbstractImage(DefaultInstanceIcon);
				this.updateCanvasPreview();

			this.makeApplyOkButtons(
				() => {
					this.editor.changeResourceName(room, this.inputName.getValue());

					room.width = parseInt(this.inputWidth.getValue());
					room.height = parseInt(this.inputHeight.getValue());
					room.speed = parseInt(this.inputSpeed.getValue());

					room.backgroundColor = this.inputBackgroundColor.getValue();

					room.backgrounds = this.paramBackgrounds;

					// In GM, these ids are saved instantly. Even if you close and don't save the room, it still uses the ids. In this project, ideally resource editors would only change the project when you press ok or apply. Because of that, we create the ProjectInstances without ids, and only when saving we fill in the ids.

					for (let instance of this.paramInstances) {
						if (instance.id == null) {
							this.editor.project.lastId += 1;
							instance.id = this.editor.project.lastId;
						}
					}

					room.instances = this.paramInstances;

					// Make sure that paramInstances and paramBackgrounds are copies
					this.copyProperties();
				},
				() => {
					this.close()
				}
			);
			endparent();

	}

	onAdd() {
		this.listeners = this.editor.dispatcher.listen({
			changeObjectSprite: i => {
				this.updateCanvasPreview();
			},
			changeSpriteOrigin: i => {
				this.updateCanvasPreview();
			},
		})
	}

	onRemove() {
		this.editor.dispatcher.stopListening(this.listeners);
	}

	// Make a copy of every property of the resource so we can change it at will without changing the original resource.
	copyProperties() {
		this.paramBackgrounds = this.room.backgrounds.map(background => {
			if (background == null) return null;
			return new ProjectRoomBackground(background.visibleAtStart, background.isForeground, background.backgroundIndex, background.tileHorizontally, background.tileVertically, background.x, background.y, background.stretch, background.horizontalSpeed, background.verticalSpeed);
		})
		this.paramInstances = this.room.instances.map(instance => {
			return new ProjectInstance(instance.id, instance.x, instance.y, instance.object_index);
		});
	}

	getMousePosition(e) {
		var x = e.offsetX;
		var y = e.offsetY;
		return {x: x, y: y};
	}

	snapMousePosition(pos) {
		var x = pos.x;
		var y = pos.y;

		if (this.inputSnapToGrid.getChecked()) {
			var snapX = Math.max(1, parseInt(this.inputSnapX.getValue()) || 0);
			var snapY = Math.max(1, parseInt(this.inputSnapY.getValue()) || 0);

			x = Math.floor(x / snapX) * snapX;
			y = Math.floor(y / snapY) * snapY;
		}

		return {x: x, y: y};
	}

	addInstance(e) {
		if (this.selectObject.getValue() == -1) return;

		var i = new ProjectInstance(null, this.currentPos.x, this.currentPos.y, this.selectObject.getValue());
		this.paramInstances.push(i);
		return i;
	}

	deleteUnderlying(e) {
		if (this.inputDeleteUnderlying.getChecked()) {
			for (var i = this.paramInstances.length - 1; i >= 0; i--) {
				var instance = this.paramInstances[i];
				if (instance != this.movingInstance && this.isInstanceAtPosition(instance, this.currentPos)) {
					this.paramInstances.splice(i, 1);
				}
			}
		}
	}

	getInstanceAtPosition(pos) {
		for (var i = this.paramInstances.length - 1; i >= 0; i--) {
			var instance = this.paramInstances[i];
			if (this.isInstanceAtPosition(instance, pos)) {
				return instance;
			}
		}

		return null;
	}

	isInstanceAtPosition(instance, pos) {
		var object = this.editor.project.resources.ProjectObject.find(x => x.id == instance.object_index);
		var sprite = this.editor.project.resources.ProjectSprite.find(x => x.id == object.sprite_index);

		var w=32, h=32, ox=0, oy=0;

		if (sprite) {
			ox = sprite.originx;
			oy = sprite.originy;
			if (sprite.images.length > 0) {
				w = sprite.images[0].image.width;
				h = sprite.images[0].image.height;
			} else {
				// On GM, if there's no images, it just defaults to 32x32. A possible improvement would be to either simply show the default image anyway, or use the grid size. Right now I'll just use 32x32 anyway.
			}
		} else {
			w = this.defaultInstanceImage.image.width;
			h = this.defaultInstanceImage.image.height;
		}

		var x1 = instance.x - ox;
		var y1 = instance.y - oy;
		var x2 = x1 + w;
		var y2 = y1 + h;

		if (pos.x >= x1 && pos.x < x2 && pos.y >= y1 && pos.y < y2) {
			return true;
		} else {
			return false;
		}
	}

	updateCanvasPreview() {

		this.canvasPreview.html.width = this.inputWidth.getValue();
		this.canvasPreview.html.height = this.inputHeight.getValue();

		this.ctx.fillStyle = this.inputBackgroundColor.getValue();
		this.ctx.fillRect(0, 0, this.canvasPreview.html.width, this.canvasPreview.html.height);

		// instance
		this.paramInstances.forEach(instance => {
			var object = this.editor.project.resources.ProjectObject.find(x => x.id == instance.object_index);
			var sprite = this.editor.project.resources.ProjectSprite.find(x => x.id == object.sprite_index);
			var image, ox=0, oy=0;

			if (sprite) {
				ox = sprite.originx;
				oy = sprite.originy;
				if (sprite.images.length > 0) {
					image = sprite.images[0];
				} else {
					// won't show if there is a sprite, but no images
					return;
				}
			} else {
				image = this.defaultInstanceImage;
			}
			image.promise.then(() => {

				this.ctx.save();
				this.ctx.translate(-ox, -oy);
				this.ctx.drawImage(image.image, instance.x, instance.y);
				this.ctx.restore();

			})
		})

		// grid
		if (this.inputShowGrid.getChecked()) {
			
			this.ctx.globalCompositeOperation = 'difference';
			this.ctx.fillStyle = 'white';
			this.ctx.strokeStyle = 'white';

			var snapx = parseInt(this.inputSnapX.getValue());
			var snapy = parseInt(this.inputSnapY.getValue());

			if (snapx > 0) {
				for (var x = 0; x < this.canvasPreview.html.width; x += snapx) {
					this.drawLine(x, 0, x, this.canvasPreview.html.height);
				}
			}

			if (snapy > 0) {
				for (var y = 0; y < this.canvasPreview.html.height; y += snapy) {
					this.drawLine(0, y, this.canvasPreview.html.width, y);
				}
			}

			this.ctx.globalCompositeOperation = 'source-over';
		}
	}

	drawLine(x1, y1, x2, y2) {

		this.ctx.save();
		this.ctx.translate(0.5, 0.5)

		this.ctx.beginPath();
		this.ctx.moveTo(x1,y1);
		this.ctx.lineTo(x2,y2);
		//this.ctx.closePath();
		this.ctx.stroke();

		this.ctx.restore();
		
	}

}