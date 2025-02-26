//---> import of vanilla JS CSS keyframes handler

/* eslint no-unused-expressions: 0 */
/* eslint sap-no-element-creation: 0 */
/* eslint no-shadow: 0 */
/* eslint no-undef: 0 */

sap.ui.define(["sap/ui/base/ManagedObject"],
	function (ManagedObect) {
		"use strict";
		return ManagedObect.extend('it.fiorital.fioritalui5lib.framework.keyframes', {
			metadata: {
				properties: {}
			},

			constructor: function (elem) {

				ManagedObect.call(this);

				this.queueStore = [];
				this.callbacks = {
					onStart: this.voidFunction,
					onBeforeStart: this.voidFunction,
					onIteration: this.voidFunction,
					onEnd: this.voidFunction
				};

				this.animationendListener = this.voidFunction;
				this.animationiterationListener = this.voidFunction;
				this.mountedElement = elem;

				//---> crreate contet for keyframes
				if (typeof window !== 'undefined') {
					var style = document.createElement('style');
					style.setAttribute('id', 'keyframesjs-stylesheet');
					document.head.appendChild(style);
					this.sheet = style.sheet;
					this.rules = [];
				}

			},

			//----------------------------------------------------------------------

			hyphenateStyleName: function (name) {
				var msPattern = /^ms-/;
				var cache = {};
				var uppercasePattern = /[A-Z]/g;
				var toHyphenLower = function (match) {
					return '-' + match.toLowerCase();
				};

				if (cache.hasOwnProperty(name)) {
					return cache[name];
				}

				var hName = name.replace(uppercasePattern, toHyphenLower);
				return (cache[name] = msPattern.test(hName) ? '-' + hName : hName);
			},

			add_px_to_style: function (name, value) {

				var IS_UNITLESS = {
					animationIterationCount: true,
					boxFlex: true,
					boxFlexGroup: true,
					boxOrdinalGroup: true,
					columnCount: true,
					flex: true,
					flexGrow: true,
					flexPositive: true,
					flexShrink: true,
					flexNegative: true,
					flexOrder: true,
					gridRow: true,
					gridColumn: true,
					fontWeight: true,
					lineClamp: true,
					lineHeight: true,
					opacity: true,
					order: true,
					orphans: true,
					tabSize: true,
					widows: true,
					zIndex: true,
					zoom: true,

					// SVG-related properties
					fillOpacity: true,
					stopOpacity: true,
					strokeDashoffset: true,
					strokeOpacity: true,
					strokeWidth: true
				};

				if (typeof value === 'number' && !IS_UNITLESS[name]) {
					return value + 'px';
				} else {
					return value;
				}
			},

			//----------------------------------------------------------------------

			__awaiter: function (thisArg, _arguments, P, generator) {
				return new(P || (P = Promise))(function (resolve, reject) {
					function fulfilled(value) {
						try {
							step(generator.next(value));
						} catch (e) {
							reject(e);
						}
					}

					function rejected(value) {
						try {
							step(generator["throw"](value));
						} catch (e) {
							reject(e);
						}
					}

					function step(result) {
						result.done ? resolve(result.value) : new P(function (resolve) {
							resolve(result.value);
						}).then(fulfilled, rejected);
					}
					step((generator = generator.apply(thisArg, _arguments || [])).next());
				});
			},

			__generator: function (thisArg, body) {
				var _ = {
						label: 0,
						sent: function () {
							if (t[0] & 1) throw t[1];
							return t[1];
						},
						trys: [],
						ops: []
					},
					f, y, t, g;
				return g = {
					next: verb(0),
					"throw": verb(1),
					"return": verb(2)
				}, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
					return this;
				}), g;

				function verb(n) {
					return function (v) {
						return step([n, v]);
					};
				}

				function step(op) {
					if (f) throw new TypeError("Generator is already executing.");
					while (_) try {
						if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(
								y, op[1])).done) return t;
						if (y = 0, t) op = [op[0] & 2, t.value];
						switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return {
								value: op[1],
								done: false
							};
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
						}
						op = body.call(thisArg, _);
					} catch (e) {
						op = [6, e];
						y = 0;
					} finally {
						f = t = 0;
					}
					if (op[0] & 5) throw op[1];
					return {
						value: op[0] ? op[1] : void 0,
						done: true
					};
				}
			},

			voidFunction: function () {},

			objToCss: function (obj) {
				if (!Object.keys(obj).length) {
					return '';
				}
				var result = '';
				for (var key in obj) {
					result += this.hyphenateStyleName(key) + ":" + this.add_px_to_style(key, obj[key]) + ";";
				}
				return result;
			},

			//---------------------------------------------------------------

			isSupported: function () {
				return document.body.style.animationName !== undefined;
			},

			reset: function () {
				return this.__awaiter(this, void 0, void 0, function () {
					return this.__generator(this, function (_a) {
						switch (_a.label) {
						case 0:
							this.removeEvents();
							this.mountedElement.style.animationPlayState = 'running';
							this.mountedElement.style.animation = 'none';
							return [4, this.wait()];
						case 1:
							_a.sent();
							return [2, this];
						}
					});
				});
			},

			pause: function () {
				this.mountedElement.style.animationPlayState = 'paused';
				return this;
			},
			resume: function () {
				this.mountedElement.style.animationPlayState = 'running';
				return this;
			},
			play: function (animationOptions, callbacks) {
				var _this = this;
				if (this.mountedElement.style.animationName === this.getAnimationName(animationOptions)) {
					requestAnimationFrame(function () {
						return this.__awaiter(_this, void 0, void 0, function () {
							return this.__generator(this, function (_a) {
								switch (_a.label) {
								case 0:
									return [4, this.reset()];
								case 1:
									_a.sent();
									this.play(animationOptions, callbacks);
									return [2];
								}
							});
						});
					});
					return this;
				}
				var _a = callbacks || {},
					_b = _a.onBeforeStart,
					onBeforeStart = _b === void 0 ? null : _b,
					_c = _a.onStart,
					onStart = _c === void 0 ? null : _c,
					_d = _a.onIteration,
					onIteration = _d === void 0 ? null : _d,
					_e = _a.onEnd,
					onEnd = _e === void 0 ? null : _e;
				var animationcss = this.playCSS(animationOptions);
				var addEvent = function (type, eventCallback) {
					var listenerName = type + "Listener";
					_this.mountedElement.removeEventListener(type, _this[listenerName]);
					_this[listenerName] = eventCallback;
					_this.mountedElement.addEventListener(type, _this[listenerName]);
				};
				if (onBeforeStart) {
					onBeforeStart();
				}
				this.mountedElement.style.animationPlayState = 'running';
				this.mountedElement.style.animation = animationcss;
				if (onIteration) {
					addEvent('animationiteration', onIteration);
				}
				if (onEnd) {
					addEvent('animationend', onEnd);
				}
				if (onStart) {
					requestAnimationFrame(onStart);
				}
				return this;
			},
			removeEvents: function () {
				this.mountedElement.removeEventListener('animationiteration', this.animationiterationListener);
				this.mountedElement.removeEventListener('animationend', this.animationendListener);
				return this;
			},
			playNext: function () {
				var _this = this;
				var animationOption = this.queueStore.pop();
				if (animationOption) {
					this.play(animationOption, {
						onEnd: function () {
							return _this.playNext();
						},
						onIteration: this.callbacks.onIteration,
					});
				} else if (this.callbacks.onEnd) {
					this.callbacks.onEnd();
				}
			},
			updateCallbacks: function (callbacks) {
				if (callbacks) {
					this.callbacks = Object.assign({}, this.callbacks, callbacks);
				}
			},
			queue: function (animationOptions, callbacks) {
				var currentQueueLength = this.queueStore.length;
				this.updateCallbacks(callbacks);
				if (animationOptions.constructor === Array) {
					this.queueStore = animationOptions.reverse().concat(this.queueStore);
				} else {
					this.queueStore.unshift(animationOptions);
				}
				if (!currentQueueLength) {
					if (this.callbacks.onBeforeStart) {
						this.callbacks.onBeforeStart();
					}
					this.playNext();
					if (this.callbacks.onStart) {
						requestAnimationFrame(this.callbacks.onStart);
					}
				}
				return this;
			},
			resetQueue: function () {
				return this.__awaiter(this, void 0, void 0, function () {
					return this.__generator(this, function (_a) {
						switch (_a.label) {
						case 0:
							return [4, this.wait()];
						case 1:
							_a.sent();
							this.removeEvents();
							this.queueStore = [];
							return [4, this.reset()];
						case 2:
							_a.sent();
							return [2, this];
						}
					});
				});
			},
			chain: function (animationOptions, callbacks) {
				return this.__awaiter(this, void 0, void 0, function () {
					return this.__generator(this, function (_a) {
						switch (_a.label) {
						case 0:
							return [4, this.resetQueue()];
						case 1:
							_a.sent();
							this.queue(animationOptions, callbacks);
							return [2, this];
						}
					});
				});
			},
			getAnimationName: function (animationObject) {
				switch (animationObject.constructor) {
				case Array:
					{
						return animationObject.map(this.getAnimationName).join(', ');
					}
				case String:
					{
						return animationObject.split(' ')[0];
					}
				default:
					{
						return animationObject.name;
					}
				}
			},
			playCSS: function (animationOptions) {
				var animObjToStr = function (obj) {
					var newObj = this.__assign({
						duration: '0s',
						timingFunction: 'ease',
						delay: '0s',
						iterationCount: 1,
						direction: 'normal',
						fillMode: 'forwards'
					}, obj);
					return [
						newObj.name,
						newObj.duration,
						newObj.timingFunction,
						newObj.delay,
						newObj.iterationCount,
						newObj.direction,
						newObj.fillMode,
					].join(' ');
				};
				if (animationOptions.constructor === Array) {
					var animationOptionArray = animationOptions;
					var animationOptionsStrings = [];
					for (var i = 0; i < animationOptionArray.length; i += 1) {
						animationOptionsStrings.push(animationOptionArray[i].constructor === String ? animationOptionArray[i] : animObjToStr(
							animationOptionArray[i]));
					}
					return animationOptionsStrings.join(', ');
				}
				if (animationOptions.constructor === String) {
					return animationOptions;
				}
				return animObjToStr(animationOptions);
			},
			generateCSS: function (frameData) {
				var css = "@keyframes " + frameData.name + " {";
				for (var key in frameData) {
					if (key !== 'name' && key !== 'media' && key !== 'complete') {
						var cssRuleObject = this.objToCss(frameData[key]);
						css += key + " {" + cssRuleObject + "}";
					}
				}
				css += '}';
				if (frameData.media) {
					css = "@media " + frameData.media + "{" + css + "}";
				}
				return css;
			},
			generate: function (frameData) {
				var css = this.generateCSS(frameData);
				var oldFrameIndex = this.rules.indexOf(frameData.name);
				if (oldFrameIndex > -1) {
					this.sheet.deleteRule(oldFrameIndex);
					delete this.rules[oldFrameIndex];
				}
				var ruleIndex = this.sheet.insertRule(css, 0);
				this.rules[ruleIndex] = frameData.name;
			},
			define: function (frameOptions) {
				if (frameOptions.length) {
					for (var i = 0; i < frameOptions.length; i += 1) {
						this.generate(frameOptions[i]);
					}
				} else {
					this.generate(frameOptions);
				}
			},
			defineCSS: function (frameOptions) {
				if (frameOptions.length) {
					var css = '';
					for (var i = 0; i < frameOptions.length; i += 1) {
						css += this.generateCSS(frameOptions[i]);
					}
					return css;
				}
				return this.generateCSS(frameOptions);
			},
			plugin: function (pluginFunc) {
				if (pluginFunc.constructor === Array) {
					for (var i = 0; i < pluginFunc.length; i += 1) {
						pluginFunc[i](this);
					}
				} else {
					pluginFunc(this);
				}
			},

		});
	},true);