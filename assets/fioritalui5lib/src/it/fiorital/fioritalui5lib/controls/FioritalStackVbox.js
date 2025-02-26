sap.ui.define([
	"sap/m/VBox",
	"it/fiorital/fioritalui5lib/controls/FioritalVbox"
], function (vbox,FioritalVbox) {
	"use strict";
	return vbox.extend("it.fiorital.flex5app.controls.FioritalStackVbox", {
		
		FioritalVbox: FioritalVbox,

		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: ""
				},
				padBegin: {
					type: "string",
					defaultValue: ""
				},
				padEnd: {
					type: "string",
					defaultValue: ""
				},
				padTop: {
					type: "string",
					defaultValue: ""
				},
				padBottom: {
					type: "string",
					defaultValue: ""
				},
				color: {
					type: "string",
					defaultValue: ""
				},
				bandMark: {
					type: "string",
					defaultValue: ""
				},
				borderbottom: {
					type: "string",
					defaultValue: ""
				},
				presetPositions: {
					type: "int",
					defaultValue: "0"
				},
				growImage: {
					type: "string",
					defaultValue: ""
				},
				growImageSize: {
					type: "string",
					defaultValue: ""
				},
				emptyImage: {
					type: "string",
					defaultValue: ""
				},
				emptyImageSize: {
					type: "string",
					defaultValue: ""
				}

			},
			events: {
				onMouseEnter: {
					event: {
						type: "Object"
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			vbox.prototype.constructor.apply(this, arguments);

			this.presetMap = [];

			//--> if we have preset positions: create them
			if (this.getPresetPositions() > 0) {

				for (var idx = 0; idx < this.getPresetPositions(); idx++) {

					var vboxInner = new sap.m.VBox({
						height: '100%',
						renderType: 'Bare'
					});

					this.__InternalAddItem(vboxInner, undefined, true);

					this.presetMap.push({
						container: vboxInner,
						isFree: true,
						isActive: false
					});

				}

				if (this.getGrowImage() !== '') {

					this.vboxGrow = new this.FioritalVbox({
						height: '100%',
						renderType: 'Bare',
						alignItems: "Center",
						justifyContent: "Center",
						color: '#6a6d704f'
					});

					this.vboxGrow.data('VBOX_GROW', true);

					if (this.getGrowImageSize() !== '') {
						var dimImg = this.getGrowImageSize();
					} else {
						var dimImg = '1em';
					}

					if (this.getGrowImage().includes('sap-icon') === true) {
						var img = new sap.ui.core.Icon({
							src: this.getGrowImage(),
							size: dimImg,
							color: 'darkgrey'
						});
					} else {
						var img = new sap.m.Image({
							src: this.getGrowImage(),
							densityAware: false,
							width: dimImg
						});
					}

					this.vboxGrow.addItem(img);
					this.__InternalAddItem(this.vboxGrow, undefined, true, false);

				}

				if (this.getEmptyImage() !== '') {

					this.vboxEmpty = new sap.m.VBox({
						height: '100%',
						renderType: 'Bare',
						alignItems: "Center",
						justifyContent: "Center"
					});

					this.vboxEmpty.data('VBOX_EMPTY', true);

					if (this.getEmptyImageSize() !== '') {
						var dimImg = this.getEmptyImageSize();
					} else {
						var dimImg = '1em';
					}

					if (this.getEmptyImage().includes('sap-icon') === true) {
						var img = new sap.ui.core.Icon({
							src: this.getEmptyImage(),
							size: dimImg,
							color: 'darkgrey'
						});
					} else {
						var img = new sap.m.Image({
							src: this.getEmptyImage(),
							densityAware: false,
							width: dimImg
						});
					}

					this.vboxEmpty.addItem(img);
					this.__InternalAddItem(this.vboxEmpty, undefined, false, false, true); //<-- visible!

				}

			}

		},

		showGrowImage: function () {

			if (this.vboxGrow !== undefined) {

				//--> unhide all 
				this.getItems().forEach(function (sitem) {
					sitem.addStyleClass('forceDisplayNone');
				}.bind(this));

				this.vboxGrow.removeStyleClass('forceDisplayNone');
			}

		},

		hideGrowImage: function () {

			if (this.vboxGrow !== undefined) {

				//--> reopen active 
				var fndRef = this.presetMap.find(function (sref) {
					return (sref.isActive === true);
				});

				if (fndRef !== undefined) {
					fndRef.container.removeStyleClass('forceDisplayNone');
				} else {
					if (this.vboxEmpty !== undefined) {
						this.vboxEmpty.removeStyleClass('forceDisplayNone');
					}
				}

				this.vboxGrow.addStyleClass('forceDisplayNone');

			}
		},

		freeItemByRef: function (itmRef) {

			//--> search for free item
			var fndContainer = this.presetMap.find(function (scont) {
				return (scont.container === itmRef);
			});

			if (fndContainer !== undefined) {

				fndContainer.isFree = true;

				//--> destroy childs
				fndContainer.container.getItems().forEach(function (sitem) {

					//--> has child iframe
					try {
						sitem.$().find('iframe').attr('src', ''); //<-- reset it!
					} catch (exc) {
						//--> nothing to do
					}

					sitem.destroy();
				});

				//---> now show the first one if present is to be hidden
				if (fndContainer.container.hasStyleClass('forceDisplayNone') === false) {

					var first = this.presetMap.find(function (scont) {
						return (scont.isFree === false);
					});

					if (first !== undefined) {
						first.container.removeStyleClass('forceDisplayNone');
					}

				}

				fndContainer.container.addStyleClass('forceDisplayNone');

			}

		},

		__InternalAddItem: function (itm, tagId, forceHide, withWait, forceShow) {

			if (forceShow === undefined || forceShow === false) {

				//---> set visibility none for the new added item by default
				if (this.getItems().length > 0) {
					itm.addStyleClass('forceDisplayNone');
				}

				if (forceHide === true) {
					itm.addStyleClass('forceDisplayNone');
				}

			}

			if (tagId !== undefined) {
				itm.data('FTAG', tagId);
			}

			vbox.prototype.addItem.apply(this, arguments);

		},

		addItem: function (itm, tagId, forceHide) {

			//--> hide empty image if present
			if (this.vboxEmpty !== undefined && this.vboxEmpty.hasStyleClass('forceDisplayNone') === false) {
				this.vboxEmpty.addStyleClass('forceDisplayNone');
			}

			if (this.getPresetPositions() > 0) {

				//--> search for free item
				var freeContainer = this.presetMap.find(function (scont) {
					return (scont.isFree === true);
				});

				if (freeContainer !== undefined) {

					freeContainer.isFree = false;

					//--> set as active ?
					if (forceHide === false) {
						freeContainer.isActive = true;

						this.presetMap.forEach(function (scont) {
							if (scont !== freeContainer) {
								freeContainer.isActive = false;
								scont.container.addStyleClass('forceDisplayNone');
							}
						});
					}

					freeContainer.container.addItem(itm); //<-- append item

					if (tagId !== undefined) {
						freeContainer.container.data('FTAG', tagId);
					}

				} else {
					//--> limit reached, no way to preserve
				}

			} else {

				this.__InternalAddItem(itm, tagId, forceHide);

			}

		},

		__InternalCountActive: function () {

			var cnt = 0;
			this.presetMap.forEach(function (scont) {
				if (scont.isFree === false) {
					cnt = cnt + 1;
				}
			});

			return cnt;

		},

		__isGrowVisible: function () {
			if (this.vboxGrow !== undefined) {

				var fnd = this.getItems().find(function (sitem) {
					return (sitem.data('VBOX_GROW') === true);
				});

				if (fnd.hasStyleClass('forceDisplayNone') === false) {
					return true;
				} else {
					return false;
				}

			} else {
				return false;
			}
		},

		addItemWithWaiter: function (itm, tagId, waitVisible, showItem) {

			//--> hide empty image if present
			if (this.vboxEmpty !== undefined && this.vboxEmpty.hasStyleClass('forceDisplayNone') === false) {
				this.vboxEmpty.addStyleClass('forceDisplayNone');
			}

			if (this.getPresetPositions() > 0) {

				//--> search for free item
				var freeContainer = this.presetMap.find(function (scont) {
					return (scont.isFree === true);
				});

				if (freeContainer !== undefined) {

					freeContainer.isFree = false;
					freeContainer.container.data('VBOX_STACK_CONTAINER', true);

					if (itm.getMetadata().getName() === "sap.ui.core.HTML") {

						var wrapper = new sap.m.VBox({
							height: '100%',
							renderType: 'Bare'
						});

						wrapper.addItem(itm);
					} else {
						var wrapper = itm;
					}

					freeContainer.container.addItem(wrapper); //<-- provided component

					//--> hide if wait is visible
					if (waitVisible) {
						wrapper.addStyleClass('forceDisplayNone');
					}

					freeContainer.container.addItem(wrapper); //<-- append item

					freeContainer.container.addItem(this._internalGenerateWaitBox(waitVisible)); //<-- waiter box
					freeContainer.container.data('FTAG', tagId);

					//--> set visible if first!
					if (this.__InternalCountActive() === 1) {
						
						freeContainer.isActive = true;

						if (this.__isGrowVisible() === false) {

							freeContainer.container.removeStyleClass('forceDisplayNone');
							if (this.vboxEmpty !== undefined) {
								this.vboxEmpty.addStyleClass('forceDisplayNone');
							}

						}

					} else {

						if (this.__isGrowVisible() === false) {
							//---> set as visible ?			
							if (showItem === true) {
								this.showItemByTag(tagId);
							}
						}

					}

					return freeContainer.container;

				} else {
					//--> limit reached, no way to preserve
				}

			} else {

				var vboxInner = new sap.m.VBox({
					height: '100%',
					renderType: 'Bare'
				});

				vboxInner.data('VBOX_STACK_CONTAINER', true);

				if (itm.getMetadata().getName() === "sap.ui.core.HTML") {

					var wrapper = new sap.m.VBox({
						height: '100%',
						renderType: 'Bare'
					});

					wrapper.addItem(itm);
				} else {
					var wrapper = itm;
				}

				vboxInner.addItem(wrapper); //<-- provided component

				//--> hide if wait is visible
				if (waitVisible) {
					wrapper.addStyleClass('forceDisplayNone');
				}

				vboxInner.addItem(this._internalGenerateWaitBox(waitVisible)); //<-- waiter box

				//--> finally add in master items list
				this.addItem(vboxInner, tagId);

				return vboxInner;

			}

		},

		hideWaiterByRef: function (itemRef) {
			if (itemRef.data('VBOX_STACK_CONTAINER') === true) {
				itemRef.getItems()[1].addStyleClass('forceDisplayNone');
				itemRef.getItems()[0].removeStyleClass('forceDisplayNone');
			}
		},

		hideWaiterByIdx: function (idx) {

			var itm = this.getItems()[idx];
			if (itm.data('VBOX_STACK_CONTAINER') === true) {
				itm.getItems()[1].addStyleClass('forceDisplayNone');
				itm.getItems()[0].removeStyleClass('forceDisplayNone');
			}
		},

		_internalGenerateWaitBox: function (visible) {

			var waitBox = new sap.m.VBox({
				width: '100%',
				height: '100%',
				renderType: "Bare",
				justifyContent: 'Center',
				alignItems: 'Center'
			});

			waitBox.data('VBOX_STACK_CONTAINER_WAITER', true);

			var spinner = new sap.ui.core.HTML({
				preferDOM: true,
				content: '<div class="sk-folding-cube"><div class="sk-cube1 sk-cube"></div><div class="sk-cube2 sk-cube"></div><div class="sk-cube4 sk-cube"></div><div class="sk-cube3 sk-cube"></div></div>'
			});

			waitBox.addItem(spinner);

			if (visible === false) {
				waitBox.addStyleClass('forceDisplayNone');
			}

			return waitBox;
		},

		hasItemByTag: function (tagId) {

			var fnd = this.getItems().find(function (sitem) {
				return (sitem.data('FTAG') === tagId);
			});

			if (fnd !== undefined) {
				return true;
			} else {
				return false;
			}

		},

		getItemByTag: function (tagId) {

			return this.getItems().find(function (sitem) {
				return (sitem.data('FTAG') === tagId);
			});

		},

		showItemByIdx: function (idx) {

			var itm = this.getItems()[idx];
			if (itm !== undefined) {

				//--> set as isActive
				var fndRef = this.presetMap.find(function (sref) {
					return (sref.container === itm);
				});

				fndRef.isActive = true;

				//--> unhide all 
				this.getItems().forEach(function (sitem) {
					if (sitem !== itm) {
						sitem.addStyleClass('forceDisplayNone');

						//--> set as inactive
						var fndRef = this.presetMap.find(function (sref) {
							return (sref.container === sitem);
						});

						if (fndRef !== undefined){
							fndRef.isActive = false;
						}
					}
				}.bind(this));

				itm.removeStyleClass('forceDisplayNone');
				return itm;
			}

		},

		showItemByTag: function (tagId) {

			var itm = this.getItems().find(function (sitem) {
				return (sitem.data('FTAG') === tagId);
			});

			if (itm !== undefined) {

				//--> set as isActive
				var fndRef = this.presetMap.find(function (sref) {
					return (sref.container === itm);
				});

				fndRef.isActive = true;

				//--> unhide all 
				this.getItems().forEach(function (sitem) {

					if (sitem !== itm) {
						sitem.addStyleClass('forceDisplayNone');

						//--> set as inactive
						var fndRef = this.presetMap.find(function (sref) {
							return (sref.container === sitem);
						});

						if (fndRef !== undefined){
							fndRef.isActive = false;
						}
					}

				}.bind(this));

				itm.removeStyleClass('forceDisplayNone');
				return itm;
			}
		},

		__mouseenter: function (jqe) {
			this.fireEvent("onMouseEnter", {
				jqe: jqe
			});
		},

		onAfterRendering: function () {

			this.$().off();
			this.$().mouseenter(this.__mouseenter.bind(this));

			//--> pad start
			if (this.getPadBegin() !== undefined && this.getPadBegin() !== '') {
				this.$().css("padding-left", this.getPadBegin());
			}

			//--> pad end
			if (this.getPadEnd() !== undefined && this.getPadEnd() !== '') {
				this.$().css("padding-right", this.getPadEnd());
			}

			//--> pad start
			if (this.getPadTop() !== undefined && this.getPadTop() !== '') {
				this.$().css("padding-top", this.getPadTop());
			}

			//--> pad bottom
			if (this.getPadBottom() !== undefined && this.getPadBottom() !== '') {
				this.$().css("padding-bottom", this.getPadBottom());
			}

			if (this.getBandMark() !== undefined && this.getBandMark() !== '') {
				this.$().css("border-left", '0.3em solid ' + this.getBandMark());
			}

			//--> backgroud color
			if (this.getColor() !== undefined && this.getColor() !== '') {
				this.$().css("background-color", this.getColor());
			}

			if (this.getBorderbottom() !== undefined && this.getBorderbottom() !== '') {
				this.$().css("border-bottom", this.getBorderbottom());
			}

		},

		renderer: "sap.m.VBoxRenderer" //<--- set standard renderer!
	});
});