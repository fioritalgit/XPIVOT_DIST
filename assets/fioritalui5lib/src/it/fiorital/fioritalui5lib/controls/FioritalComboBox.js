sap.ui.define([
	"sap/m/ComboBox",
	"it/fiorital/fioritalui5lib/controls/FioritalComponentValidator"
], function (ComboBox, FioritalComponentValidator) {
	"use strict";
	return ComboBox.extend("it.fiorital.flex5app.controls.FioritalComboBox", {

		FioritalComponentValidator: FioritalComponentValidator,

		metadata: {
			properties: {

			},
			events: {
				submit: {

				}
			}
		},

		constructor: function (sId, mSettings) {
			ComboBox.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {

			this.$().off(); //<--- remove old handlers!
			this.$().keydown(this._keyDown.bind(this));

			ComboBox.prototype.onAfterRendering.apply(this, arguments);

		},

		___componentInternalValidation: function () {
			//---> property based validation; false = valid
			return false;
		},

		_keyDown: function (evt) {

			var specialKeyPressed = false;
			var managed = false;

			switch (evt.keyCode) {
			case 13: //Enter

				managed = true;

				/*var newVal = this.getValue();
				this.fireEvent("change", { value: newVal });*/
				this.close(); //<--- close the list

				this.fireEvent("submit", {});
				break;

			case 40: // DOWN

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

				managed = true;

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

			if (managed) {
				evt.preventDefault(); //<-- stop bubbleling of event
			}

		},

		renderer: "sap.m.ComboBoxRenderer" //<--- set standard renderer!

	});
});