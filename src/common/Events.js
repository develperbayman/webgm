export default class Events {
	static listEventTypes = [
		{id:  0, value: 'create',     name: 'Create',      getFullName: () => 'Create'},
		{id:  1, value: 'destroy',    name: 'Destroy',     getFullName: () => 'Destroy'},
		{id:  3, value: 'step',       name: 'Step',        getFullName: (subtype) => Events.listStepSubtypes.find(x => x.value == subtype).name},
		{id:  2, value: 'alarm',      name: 'Alarm',       getFullName: (subtype) => 'Alarm '+subtype},
		{id:  5, value: 'keyboard',   name: 'Keyboard',    getFullName: (subtype) => 'Keyboard '+subtype},
		{id:  6, value: 'mouse',      name: 'Mouse',       getFullName: (subtype) => Events.listMouseSubtypes.find(x => x.value == subtype).name},
		{id:  4, value: 'collision',  name: 'Collision',   getFullName: (subtype, project) => {
			const object = project.resources.ProjectObject.find(x => x.id == subtype);
			return 'Collision with ' + (object ? object.name : '<undefined>');
		}},
		{id:  7, value: 'other',      name: 'Other',       getFullName: (subtype) => Events.listOtherSubtypes.find(x => x.value == subtype).name},
		{id:  8, value: 'draw',       name: 'Draw',        getFullName: () => 'Draw'},
		{id:  9, value: 'keypress',   name: 'Key press',   getFullName: (subtype) => 'Key press'+subtype},
		{id: 10, value: 'keyrelease', name: 'Key release', getFullName: (subtype) => 'Key release'+subtype},
	];

	static listStepSubtypes = [
		{id: 0, value: 'normal', name: 'Step'},
		{id: 1, value: 'begin', name: 'Begin step'},
		{id: 2, value: 'end', name: 'End step'},
	];

	static listMouseSubtypes = [

		{id: 0, value: 0, kind: 'button', button: 1, when: 'mouse', name: "Left Button"},
		{id: 1, value: 1, kind: 'button', button: 2, when: 'mouse', name: "Right Button"},
		{id: 2, value: 2, kind: 'button', button: 3, when: 'mouse', name: "Middle Button"},
		{id: 3, value: 3, kind: 'button', button: 0, when: 'mouse', name: "No Button"},
		{id: 4, value: 4, kind: 'button', button: 1, when: 'mousePressed', name: "Left Press"},
		{id: 5, value: 5, kind: 'button', button: 2, when: 'mousePressed', name: "Right Press"},
		{id: 6, value: 6, kind: 'button', button: 3, when: 'mousePressed', name: "Middle Press"},
		{id: 7, value: 7, kind: 'button', button: 1, when: 'mouseReleased', name: "Left Release"},
		{id: 8, value: 8, kind: 'button', button: 2, when: 'mouseReleased', name: "Right Release"},
		{id: 9, value: 9, kind: 'button', button: 3, when: 'mouseReleased', name: "Middle Release"},
		{id: 10, value: 10, kind: 'enter-release', name: "Mouse Enter"},
		{id: 11, value: 11, kind: 'enter-release', name: "Mouse Leave"},
		{id: 60, value: 60, kind: 'wheel-up', name: "Mouse Wheel Up"},
		{id: 61, value: 61, kind: 'wheel-down', name: "Mouse Wheel Down"},
		{id: 50, value: 50, kind: 'button', button: 1, global: true, when: 'mouse', name: "Global Left Button"},
		{id: 51, value: 51, kind: 'button', button: 2, global: true, when: 'mouse', name: "Global Right Button"},
		{id: 52, value: 52, kind: 'button', button: 3, global: true, when: 'mouse', name: "Global Middle Button"},
		{id: 53, value: 53, kind: 'button', button: 1, global: true, when: 'mousePressed', name: "Global Left Press"},
		{id: 54, value: 54, kind: 'button', button: 2, global: true, when: 'mousePressed', name: "Global Right Press"},
		{id: 55, value: 55, kind: 'button', button: 3, global: true, when: 'mousePressed', name: "Global Middle Press"},
		{id: 56, value: 56, kind: 'button', button: 1, global: true, when: 'mouseReleased', name: "Global Left Release"},
		{id: 57, value: 57, kind: 'button', button: 2, global: true, when: 'mouseReleased', name: "Global Right Release"},
		{id: 58, value: 58, kind: 'button', button: 3, global: true, when: 'mouseReleased', name: "Global Middle Release"},

		{id: 16, value: 16, kind: 'joystick', number: 1, button: 14, name: 'Joystick1 Left'},
		{id: 17, value: 17, kind: 'joystick', number: 1, button: 15, name: 'Joystick1 Right'},
		{id: 18, value: 18, kind: 'joystick', number: 1, button: 12, name: 'Joystick1 Up'},
		{id: 19, value: 19, kind: 'joystick', number: 1, button: 13, name: 'Joystick1 Down'},
		{id: 21, value: 21, kind: 'joystick', number: 1, button: 0, name: 'Joystick1 Button1'},
		{id: 22, value: 22, kind: 'joystick', number: 1, button: 1, name: 'Joystick1 Button2'},
		{id: 23, value: 23, kind: 'joystick', number: 1, button: 2, name: 'Joystick1 Button3'},
		{id: 24, value: 24, kind: 'joystick', number: 1, button: 3, name: 'Joystick1 Button4'},
		{id: 25, value: 25, kind: 'joystick', number: 1, button: 4, name: 'Joystick1 Button5'},
		{id: 26, value: 26, kind: 'joystick', number: 1, button: 5, name: 'Joystick1 Button6'},
		{id: 27, value: 27, kind: 'joystick', number: 1, button: 6, name: 'Joystick1 Button7'},
		{id: 28, value: 28, kind: 'joystick', number: 1, button: 7, name: 'Joystick1 Button8'},
		{id: 31, value: 31, kind: 'joystick', number: 2, button: 14, name: 'Joystick2 Left'},
		{id: 32, value: 32, kind: 'joystick', number: 2, button: 15, name: 'Joystick2 Right'},
		{id: 33, value: 33, kind: 'joystick', number: 2, button: 12, name: 'Joystick2 Up'},
		{id: 34, value: 34, kind: 'joystick', number: 2, button: 13, name: 'Joystick2 Down'},
		{id: 36, value: 36, kind: 'joystick', number: 2, button: 0, name: 'Joystick2 Button1'},
		{id: 37, value: 37, kind: 'joystick', number: 2, button: 1, name: 'Joystick2 Button2'},
		{id: 38, value: 38, kind: 'joystick', number: 2, button: 2, name: 'Joystick2 Button3'},
		{id: 39, value: 39, kind: 'joystick', number: 2, button: 3, name: 'Joystick2 Button4'},
		{id: 40, value: 40, kind: 'joystick', number: 2, button: 4, name: 'Joystick2 Button5'},
		{id: 41, value: 41, kind: 'joystick', number: 2, button: 5, name: 'Joystick2 Button6'},
		{id: 42, value: 42, kind: 'joystick', number: 2, button: 6, name: 'Joystick2 Button7'},
		{id: 43, value: 43, kind: 'joystick', number: 2, button: 7, name: 'Joystick2 Button8'},
	];

	static listOtherSubtypes = [
		{id: 0, value: 0, name: 'Outside'},
		{id: 1, value: 1, name: 'Boundary'},
		{id: 40, value: 40, name: 'Outside view 0'},
		{id: 41, value: 41, name: 'Outside view 1'},
		{id: 42, value: 42, name: 'Outside view 2'},
		{id: 43, value: 43, name: 'Outside view 3'},
		{id: 44, value: 44, name: 'Outside view 4'},
		{id: 45, value: 45, name: 'Outside view 5'},
		{id: 46, value: 46, name: 'Outside view 6'},
		{id: 47, value: 47, name: 'Outside view 7'},
		{id: 50, value: 50, name: 'Boundary view 0'},
		{id: 51, value: 51, name: 'Boundary view 1'},
		{id: 52, value: 52, name: 'Boundary view 2'},
		{id: 53, value: 53, name: 'Boundary view 3'},
		{id: 54, value: 54, name: 'Boundary view 4'},
		{id: 55, value: 55, name: 'Boundary view 5'},
		{id: 56, value: 56, name: 'Boundary view 6'},
		{id: 57, value: 57, name: 'Boundary view 7'},
		{id: 2, value: 2, name: 'Game start'},
		{id: 3, value: 3, name: 'Game end'},
		{id: 4, value: 4, name: 'Room start'},
		{id: 5, value: 5, name: 'Room end'},
		{id: 6, value: 6, name: 'No more lives'},
		{id: 9, value: 9, name: 'No more health'},
		{id: 7, value: 7, name: 'Animation end'},
		{id: 8, value: 8, name: 'End of path'},
		{id: 30, value: 30, name: 'Close button'},
		{id: 10, value: 10, name: 'User 0'},
		{id: 11, value: 11, name: 'User 1'},
		{id: 12, value: 12, name: 'User 2'},
		{id: 13, value: 13, name: 'User 3'},
		{id: 14, value: 14, name: 'User 4'},
		{id: 15, value: 15, name: 'User 5'},
		{id: 16, value: 16, name: 'User 6'},
		{id: 17, value: 17, name: 'User 7'},
		{id: 18, value: 18, name: 'User 8'},
		{id: 19, value: 19, name: 'User 9'},
		{id: 20, value: 20, name: 'User 10'},
		{id: 21, value: 21, name: 'User 11'},
		{id: 22, value: 22, name: 'User 12'},
		{id: 23, value: 23, name: 'User 13'},
		{id: 24, value: 24, name: 'User 14'},
		{id: 25, value: 25, name: 'User 15'},
	]

	static getEventName(event, project) {
		return Events.listEventTypes.find(x => x.value == event.type).getFullName(event.subtype, project);
	}
}