import {EngineException, FatalErrorException} from "../common/Exceptions.js";
import {makeCSSFont} from "../common/tools.js";

import ActionsParser from "./ActionsParser.js";

export default class ProjectLoader {
	constructor(game, project) {
		this.game = game;
		this.project = project;

		this.imageDataCache = new Map();
		this.sounds = new Map();

		this.cssFontsCache = {
			"-1": makeCSSFont("Arial", 12, false, false),
		};

		this.actionsCache = new Map();

		this.gmlCache = new Map();
	}

	// Makes sure all resources are loaded, and parses GML code.
	loadProject() {
		const promises = [
			this.loadSprites(),
			this.loadSounds(),
			this.loadBackgrounds(),
		];

		this.loadFonts();

		this.loadActions();
		this.loadGML();

		return Promise.all(promises);
	}

	// Return a list of promises of loading sprite images.
	loadSprites() {
		const promises = [];

		const offscreen = new OffscreenCanvas(0, 0);
		const offscreenCtx = offscreen.getContext("2d", {willReadFrequently: true});

		this.project.resources.ProjectSprite.forEach(sprite => {
			sprite.images.forEach((image, imageNumber) => {
				image.load();
				promises.push(image.promise
					.then(() => {
						if (image.image.width > offscreen.width || image.image.height > offscreen.height) {
							offscreen.width = image.image.width;
							offscreen.height = image.image.height;
						}

						offscreenCtx.clearRect(0, 0, image.image.width, image.image.height);
						offscreenCtx.drawImage(image.image, 0, 0);

						const data = offscreenCtx.getImageData(0, 0, image.image.width, image.image.height);
						this.imageDataCache.set(image, data);
					})
					.catch(() => {
						throw new EngineException("Could not load image " + imageNumber.toString() + " in sprite " + sprite.name);
					}));
			});
		});

		return Promise.all(promises);
	}

	// Returns a list of promises of loading sounds.
	loadSounds() {
		const promises = [];
		this.project.resources.ProjectSound.forEach(sound => {
			if (!sound.sound) return;
			sound.sound.load();
			promises.push(sound.sound.promise
				.catch(() => {
					throw new EngineException("Could not load audio in sound " + sound.name);
				}));

			this.sounds.set(sound, {volume: sound.volume, audioNodes: []});
		});
		return Promise.all(promises);
	}

	// Returns a list of promises of loading background images.
	loadBackgrounds() {
		const promises = [];
		this.project.resources.ProjectBackground.forEach(background => {
			if (!background.image) return;
			background.image.load();
			promises.push(background.image.promise
				.catch(() => {
					throw new EngineException("Could not load image in background " + background.name);
				}));
		});
		return Promise.all(promises);
	}

	// Loads all fonts.
	loadFonts() {
		this.project.resources.ProjectFont.forEach(font => {
			this.cssFontsCache[font.id] = makeCSSFont(font.font, font.size, font.bold, font.italic);
		});
	}

	// Parse all action lists in events and timeline moments into action trees.
	loadActions() {
		this.loadActionsTimelines(); // TODO
		this.loadActionsObjects();
	}

	// Parse all action lists in timelines.
	loadActionsTimelines() {} // TODO

	// Parse all action lists in objects.
	loadActionsObjects() {
		this.project.resources.ProjectObject.every(object => {
			return object.events.every(event => {
				const parsedActions = new ActionsParser().parse(event.actions);
				this.actionsCache.set(event, parsedActions);
				return true;
			});
		});
	}

	// Compile all GML code, parsing it and checking for errors.
	loadGML() {
		this.loadGMLScripts();
		this.loadGMLTimelines(); // TODO
		this.loadGMLObjects();
		this.loadGMLRooms();
	}

	// Compile all GML inside of scripts.
	loadGMLScripts() {
		this.project.resources.ProjectScript.every(script => {
			return this.compileGMLAndCache(script.code, script, matchResult => {
				throw new FatalErrorException({
					type: "compilation",
					location: "script",
					locationScript: script,
					matchResult: matchResult,
					text:
						"\n___________________________________________\n"
						+ "COMPILATION ERROR in Script: " + script.name + "\n\n"
						+ matchResult.message + "\n",
				});
			});
		});
	}

	// Compile all GML inside time lines.
	loadGMLTimelines() {} // TODO

	// Compile all GML inside objects.
	loadGMLObjects() {
		this.project.resources.ProjectObject.every(object => {
			return object.events.every(event => {
				return event.actions.every((action, actionNumber) => {
					if (action.typeKind == "code") {
						return this.compileGMLAndCache(action.args[0].value, action, matchResult => {
							throw this.game.makeFatalError({
									type: "compilation",
									matchResult: matchResult,
								},
								"COMPILATION ERROR in code action:\n" + matchResult.message + "\n",
								object, event, actionNumber,
							);
						});
					} else if (action.typeKind == "normal" && action.typeExecution == "code") {
						return this.compileGMLAndCache(action.args[0].value, action, matchResult => {
							throw this.game.makeFatalError({
									type: "compilation",
									matchResult: matchResult,
								},
								"COMPILATION ERROR in code action (in action type in a library):\n" + matchResult.message + "\n",
								object, event, actionNumber,
							);
						});
					} else if (action.typeKind == "variable") {
						const name = action.args[0].value;
						const value = action.args[1].value;
						const assignSymbol = action.relative ? " += " : " = ";
						const code = name + assignSymbol + value;

						return this.compileGMLAndCache(code, action, matchResult => {
							throw this.game.makeFatalError({
									type: "compilation",
									matchResult: matchResult,
								},
								"COMPILATION ERROR in code action (in variable set):\n" + matchResult.message + "\n",
								object, event, actionNumber,
							);
						});
					}
					return true;
				});
			});
		});
	}

	// Compile all GML inside rooms.
	loadGMLRooms() {
		this.project.resources.ProjectRoom.every(room => {
			if (!room.instances.every(instance => {
				return this.compileGMLAndCache(instance.creationCode, instance, matchResult => {
					throw new FatalErrorException({
						type: "compilation",
						location: "instanceCreationCode",
						locationInstance: instance,
						locationRoom: room,
						matchResult: matchResult,
						text:
							"\n___________________________________________\n"
							+ "COMPILATION ERROR in creation code for instance " + instance.id + " in room " + room.name + "\n\n"
							+ matchResult.message + "\n",
					});
				});
			})) return false;

			return this.compileGMLAndCache(room.creationCode, room, matchResult => {
				throw new FatalErrorException({
					type: "compilation",
					location: "roomCreationCode",
					locationRoom: room,
					matchResult: matchResult,
					text:
						"\n___________________________________________\n"
						+ "COMPILATION ERROR in creation code of room " + room.name + "\n\n"
						+ matchResult.message + "\n",
				});
			});
		});
	}

	// Compiles a GML code string and stores the result in a cache. mapKey is used when accessing gmlCache.
	compileGMLAndCache(code, mapKey, failureFunction) {
		const result = this.game.gml.compile(code);
		if (result.succeeded) {
			this.gmlCache.set(mapKey, result.ast);
			return true;
		} else {
			failureFunction(result.matchResult);
			return false;
		}
	}
}