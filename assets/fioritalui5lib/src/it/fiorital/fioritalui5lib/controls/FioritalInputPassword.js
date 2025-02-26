sap.ui.define([
	"sap/m/Input"
], function (input) {
	"use strict";
	return input.extend("it.fiorital.flex5app.controls.FioritalInputPassword", {

		metadata: {
			properties: {
				onlyInteger: {
					type: "boolean",
					defaultValue: false
				},
				background: {
					type: "string",
					defaultValue: ""
				},
				avoidNegatives: {
					type: "boolean",
					defaultValue: false
				},
				deleteOnSelect: {
					type: "boolean",
					defaultValue: false
				},
				deleteZeroOnSelect: {
					type: "boolean",
					defaultValue: false
				},
				cssClasses: {
					type: "string",
					defaultValue: ""
				},
				bandMarkBottom: {
					type: "boolean",
					defaultValue: false
				},
				bandMarkBottomColor: {
					type: "string",
					defaultValue: "red"
				},
				selectOnSelect: {
					type: "boolean",
					defaultValue: false
				},
			},
			events: {
				onMove: {
					parameters: {
						direction: {
							type: "object"
						},
						jqe: {
							type: "object"
						}
					}
				},
				onKeyDown: {
					parameters: {
						jqe: {
							type: "object"
						}
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			input.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			input.prototype.onAfterRendering.apply(this, arguments);

			this.$().off(); //<--- remove old handlers!
			this.$().keydown(this._keyDown.bind(this));
			this.$().focusin(this._focusIn.bind(this));
			this.enterDone = false; //<--- to prevent focusIn function when Enter key is pressed

			document.getElementById(this.$().attr('id')).addEventListener("wheel", function (evt) {
				evt.preventDefault();
				evt.stopPropagation();
			}.bind(this));

			//--> background
			if (this.getBackground() !== undefined && this.getBackground() !== '') {
				this.$().css("background", this.getBackground());
			}

			//--> lower band
			if (this.getBandMarkBottom() === true) {
				this.$().find('input').css("border-bottom", '3px solid ' + this.getBandMarkBottomColor());
			}

			//--> custom CSS classes
			if (this.getCssClasses() !== undefined && this.getCssClasses() !== '') {

				var classes = this.getCssClasses().split(' ');
				classes.forEach(function (sClass) {
					this.$().addClass(sClass);
				}.bind(this));

			}
		},

		_keyDown: function (evt) {

			if ((evt.key === '.' || evt.key === ',') && this.getOnlyInteger() === true) {
				evt.preventDefault(); //<-- stop bubbleling of event
				return;
			}

			this.fireEvent("onKeyDown", {
				jqe: evt
			});

			if (this.getAvoidNegatives() === true && evt.key === '-') {
				evt.preventDefault(); //<-- stop bubbleling of event
				return;
			}

			var specialKeyPressed = false;
			var managed = false;

			switch (evt.keyCode) {
			case 13: //Enter
				this.enterDone = true;
				managed = false;
				break;
			case 9: //Tab
				managed = false;
				break;
			case 40: // DOWN

				this.fireEvent("onMove", {
					direction: 'D',
					jqe: evt
				});

				managed = true;

				if (this.getType() === 'Number') {

					if (evt.shiftKey === true) {
						//--> up by 1
						specialKeyPressed = true;
						// managed = false;

						if (isNaN(parseFloat(this.getValue()))) {
							this.setValue(0);
						} else {
							var actValue = parseFloat(this.getValue());
							if (actValue - 1 < 0) {
								this.setValue(0);
							} else {
								this.setValue(actValue - 1);
							}
						}
					}

					if (evt.ctrlKey === true) {
						//--> up by 10
						specialKeyPressed = true;
						// managed = false;

						if (isNaN(parseFloat(this.getValue()))) {
							this.setValue(0);
						} else {
							var actValue = parseFloat(this.getValue());
							if (actValue - 10 < 0) {
								this.setValue(0);
							} else {
								this.setValue(actValue - 10);
							}
						}
					}

					if (evt.alttKey === true) {
						//--> up by 100
						specialKeyPressed = true;
						// managed = false;

						if (isNaN(parseFloat(this.getValue()))) {
							this.setValue(0);
						} else {
							var actValue = parseFloat(this.getValue());
							if (actValue - 100 < 0) {
								this.setValue(0);
							} else {
								this.setValue(actValue - 100);
							}
						}
					}

				}

				//---> move in the table (if present)
				if (specialKeyPressed === false) {

					//---> search for table line
					var refCmp = this;
					var found = false;
					while (refCmp.getParent() !== null) {

						if (refCmp.getParent() instanceof sap.m.CustomListItem || refCmp.getParent() instanceof sap.m.ColumnListItem) {
							found = true;
							break;
						} else {
							refCmp = refCmp.getParent();
						}
					}

					//--> line found now look for next line
					if (found) {

						//---> identify column number
						var refCol = this.data('REFCOL');

						if (refCol === '') {
							evt.preventDefault(); //<-- stop bubbleling of event
							return;
						}

						//---> identify item row
						var items = refCmp.getParent().getParent().getItems();
						for (var idx = 0; idx < items.length; idx++) {
							if (items[idx] === refCmp.getParent()) {
								break;
							}
						}

						var nextLine = items[idx + 1];
						if (nextLine !== undefined) {
							var nextId = nextLine.$().find('[data-refcol="' + refCol + '"]').attr('id');

							//---> in list check if over separator
							if (nextId === undefined || nextId === '') {
								var nextLine = items[idx + 2];

								if (nextLine !== undefined) {
									var nextId = nextLine.$().find('[data-refcol="' + refCol + '"]').attr('id');
								} else {
									return;
								}
							}

							sap.ui.getCore().byId(nextId).focus();
						}
					}
				}

				break;
			case 38: // UP

				this.fireEvent("onMove", {
					direction: 'U',
					jqe: evt
				});

				managed = true;

				if (this.getType() === 'Number') {

					if (evt.shiftKey === true) {
						//--> up by 1
						specialKeyPressed = true;
						// managed = false;

						if (isNaN(parseFloat(this.getValue()))) {
							this.setValue(1 - 1);
						} else {
							var actValue = parseFloat(this.getValue());
							this.setValue(actValue + 1);
						}
					}

					if (evt.ctrlKey === true) {
						//--> up by 10
						specialKeyPressed = true;
						// managed = false;

						if (isNaN(parseFloat(this.getValue()))) {
							this.setValue(10 - 1);
						} else {
							var actValue = parseFloat(this.getValue());
							this.setValue(actValue + 10);
						}
					}

					if (evt.alttKey === true) {
						//--> up by 100
						specialKeyPressed = true;
						// managed = false;

						if (isNaN(parseFloat(this.getValue()))) {
							this.setValue(100 - 1);
						} else {
							var actValue = parseFloat(this.getValue());
							this.setValue(actValue + 100);
						}
					}

				}

				//---> move in the table (if present)
				if (specialKeyPressed === false) {

					//---> search for table line
					var refCmp = this;
					var found = false;
					while (refCmp.getParent() !== null) {

						if (refCmp.getParent() instanceof sap.m.CustomListItem || refCmp.getParent() instanceof sap.m.ColumnListItem) {
							found = true;
							break;
						} else {
							refCmp = refCmp.getParent();
						}
					}

					//--> line found now look for next line
					if (found) {

						//---> identify column number
						var refCol = this.data('REFCOL');

						if (refCol === '') {
							evt.preventDefault(); //<-- stop bubbleling of event
							return;
						}

						//---> identify item row
						var items = refCmp.getParent().getParent().getItems();
						for (var idx = 0; idx < items.length; idx++) {
							if (items[idx] === refCmp.getParent()) {
								break;
							}
						}

						var prevLine = items[idx - 1];
						if (prevLine !== undefined) {
							var nextId = prevLine.$().find('[data-refcol="' + refCol + '"]').attr('id');

							//---> in list check if over separator
							if (nextId === undefined || nextId === '') {
								var prevLine = items[idx - 2];

								if (prevLine !== undefined) {
									var nextId = prevLine.$().find('[data-refcol="' + refCol + '"]').attr('id');
								} else {
									return;
								}
							}

							sap.ui.getCore().byId(nextId).focus();
						}
					}
				}

				break;
			case 39: // RIGHT

				this.fireEvent("onMove", {
					direction: 'R',
					jqe: evt
				});

				managed = true;

				//---> search for table line
				var refCmp = this;
				var found = false;
				while (refCmp.getParent() !== null) {

					if (refCmp.getParent() instanceof sap.m.CustomListItem || refCmp.getParent() instanceof sap.m.ColumnListItem) {
						found = true;
						break;
					} else {
						refCmp = refCmp.getParent();
					}
				}

				//--> line found now look for next line
				if (found) {

					//---> identify column number
					var refCol = this.data('REFCOL');

					if (refCol === '') {
						evt.preventDefault(); //<-- stop bubbleling of event
						return;
					}

					refCol = parseInt(refCol) + 1;

					//---> identify item row
					var items = refCmp.getParent().getParent().getItems();
					for (var idx = 0; idx < items.length; idx++) {
						if (items[idx] === refCmp.getParent()) {
							break;
						}
					}

					var sameLine = items[idx];
					var nextId = sameLine.$().find('[data-refcol="' + refCol + '"]').attr('id');
					sap.ui.getCore().byId(nextId).focus();

				}

				break;
			case 37: // LEFT

				this.fireEvent("onMove", {
					direction: 'L',
					jqe: evt
				});

				managed = true;

				//---> search for table line
				var refCmp = this;
				var found = false;
				while (refCmp.getParent() !== null) {

					if (refCmp.getParent() instanceof sap.m.CustomListItem || refCmp.getParent() instanceof sap.m.ColumnListItem) {
						found = true;
						break;
					} else {
						refCmp = refCmp.getParent();
					}
				}

				//--> line found now look for next line
				if (found) {

					//---> identify column number
					var refCol = this.data('REFCOL');

					if (refCol === '') {
						evt.preventDefault(); //<-- stop bubbleling of event
						return;
					}

					refCol = parseInt(refCol) - 1;
					if (refCol < 1) {
						return;
					}

					//---> identify item row
					var items = refCmp.getParent().getParent().getItems();
					for (var idx = 0; idx < items.length; idx++) {
						if (items[idx] === refCmp.getParent()) {
							break;
						}
					}

					var sameLine = items[idx];
					var nextId = sameLine.$().find('[data-refcol="' + refCol + '"]').attr('id');
					sap.ui.getCore().byId(nextId).focus();
				}

				break;
			default:
			}

			if (specialKeyPressed) {
				this.fireEvent("change", {
					value: this.getValue()
				});
			}

			if (managed) {
				evt.preventDefault(); //<-- stop bubbleling of event
				evt.stopPropagation();
			}
		},

		_focusIn: function (evt) {
			if (this.getDeleteOnSelect() === true && this.enterDone !== true) {
				this.setValue(undefined);
			}

			if (this.getDeleteZeroOnSelect() === true && this.enterDone !== true && (parseFloat(this.getValue()).toFixed(2) === "0.00")) {
				this.setValue(undefined);
			}

			if (this.getSelectOnSelect() === true && this.enterDone !== true) {
				this.$().find('input').select();
			}

			this.enterDone = false;
		},

		renderer: "sap.m.InputRenderer" //<--- set standard renderer!

	});
});