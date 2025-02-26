/* eslint-disable */
sap.ui.define([
	"sap/m/Input",
	"it/fiorital/fioritalui5lib/controls/FioritalComponentValidator"
], function (input, FioritalComponentValidator) {
	"use strict";
	return input.extend("it.fiorital.flex5app.controls.FioritalInput", {

		FioritalComponentValidator: FioritalComponentValidator,

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
				diagonalSign: {
					type: "boolean",
					defaultValue: false
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
				disableKeyDownHandling: {
					type: "boolean",
					defaultValue: false
				},
				onlyBottomLice: {
					type: "boolean",
					defaultValue: false
				},
				avoidWheelEvent: {
					type: "boolean",
					defaultValue: false
				},
				substituteComa: {
					type: "boolean",
					defaultValue: true
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
				},
				onFocus: {
					parameters: {
						jqe: {
							type: "object"
						}
					}
				},
				onFocusOut: {
					parameters: {
						jqe: {
							type: "object"
						}
					}
				},
				onKeyPress: {
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

			this.data('FioritalType', 'FioritalInput', true);
			this.viewController = null;
		},

		//-----> handled by FioritalComponentValidatorCmp component if present in dependences aggregation !!
		___componentInternalValidation: function () {
			//---> property based validation; false = valid
			return false;
		},

		onAfterRendering: function () {

			input.prototype.onAfterRendering.apply(this, arguments);

			this.$().off(); //<--- remove old handlers!
			this.$().keydown(this._keyDown.bind(this));
			this.$().focusin(this._focusIn.bind(this));
			this.$().focusout(this._focusOut.bind(this));
			this.$().keypress(this._keyPressed.bind(this));
			this.enterDone = false; //<--- to prevent focusIn function when Enter key is pressed

			if (this.getAvoidWheelEvent() === false) {
				document.getElementById(this.$().attr('id')).addEventListener("wheel", function (evt) {
					evt.preventDefault();
					evt.stopPropagation();
				}.bind(this));
			}

			//--> background
			if (this.getBackground() !== undefined && this.getBackground() !== '') {
				this.$().find('input').css("background", this.getBackground());
			}

			if (this.getDiagonalSign() === true) {
				this.$().addClass('diagFioritalInput');
			}

			if (this.getOnlyBottomLice() === true) {
				this.$().css('border-left', '0px');
				this.$().css('border-right', '0px');
				this.$().css('border-top', '0px');
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

		isLetter: function (c) {
			return c.toLowerCase() != c.toUpperCase();
		},

		_keyDown: function (evt) {

			if (evt.key === 'Backspace' || evt.ctrlKey === true) {
				return;
			}

			if (this.getDisableKeyDownHandling() === true) {

				this.fireEvent("onKeyDown", {
					jqe: evt
				});

				return;
			}

			if (this.getSubstituteComa() === true) {

				if ((evt.key === '.' || this.isLetter(evt.key[0])) && this.getType() === "Number" && (evt.key != 'ArrowDown' && evt.key !=
						'ArrowUp' && evt.key != 'ArrowLeft' && evt.key != 'ArrowRight')) {
					this.pss = true;
					evt.preventDefault();
					return;
				}

				if (this.pss) {
					debugger;
					this.setValue(this.getValue() + ',' + evt.key);
					this.pss = false;
					evt.preventDefault();

					this.fireEvent("change", {
						value: this.getValue()
					});
					return;
				}

			}

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

				if (evt.SAP_STOP === true) {
					return;
				}

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

					//---> search for table line (sap.m.table)
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

						if (refCol === null) {
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

					//<--- end move on sap.m.table

					//---> move on sap.ui.table
					var refCmp = this;
					found = false;
					while (refCmp.getParent() !== null) {

						if (refCmp.getParent().getMetadata().getName() == "sap.ui.table.Row") {
							found = true;
							break;
						} else {
							refCmp = refCmp.getParent();
						}
					}

					//--> line found now look for next line
					if (found) {

						var refCol = this.data('REFCOL');

						// if (refCol === null) {
						// 	evt.preventDefault(); //<-- stop bubbleling of event
						// 	return;
						// }

						var uiTabRef = refCmp.getParent().getParent();
						var rowTabRef = refCmp.getParent();

						var foundCol = false;
						for (var idx = 0; idx <= rowTabRef.getCells().length; idx++) {
							if (rowTabRef.getCells()[idx] !== undefined) {
								var finput = rowTabRef.getCells()[idx].$().find('[data-FioritalType="FioritalInput"]');
								if (finput.length > 0) {
									if (sap.ui.getCore().byId(finput.attr('id')) === this) {
										foundCol = true;
										break;
									}
								}
							}
						}

						//--> next rows exists in absolute ?
						if (uiTabRef.getBinding('rows').getContexts(0, 9999).length >= rowTabRef.getIndex() + 1) {

							//--> is last row ?
							if (uiTabRef.getRows()[uiTabRef.getVisibleRowCount() - 1] == rowTabRef) {
								uiTabRef.setFirstVisibleRow(uiTabRef.getFirstVisibleRow() + 1);

								var thisObj = {
									uiTabRef: uiTabRef,
									thisRef: this,
									rowTabRef: rowTabRef,
									foundCol: foundCol,
									idx: idx
								};

								if (this.getValue() !== this.getLastValue()) {
									this.setValue(this.getValue());

									this.fireChange({
										value: this.getValue()
									});

									this.setLastValue(this.getValue());
								}

								//-->focus in timeout to ensure redraw
								setTimeout(function () {

									var lastRow = this.uiTabRef.getRows()[this.uiTabRef.getVisibleRowCount() - 1];
									if (this.thisRef.data('REFCOL') !== null) {
										var nextId = lastRow.$().find('[data-refcol="' + refCol + '"]').attr('id');
										sap.ui.getCore().byId(nextId).focus();
										sap.ui.getCore().byId(nextId).$().find('input').select();
									} else {
										if (this.foundCol) {
											if (lastRow.getCells()[this.idx].$().find('[data-FioritalType="FioritalInput"]').length === 1) {
												var nextId = lastRow.getCells()[this.idx].$().find('[data-FioritalType="FioritalInput"]').attr('id');
												if (sap.ui.getCore().byId(nextId).getVisible()) {
													sap.ui.getCore().byId(nextId).focus();
												} else {
													lastRow.getCells()[this.idx].$().parent().parent().focus();
												}
											}
										}
									}
								}.bind(thisObj), 0);

							} else {
								try {
									var nextUiTableRow = uiTabRef.getRows()[rowTabRef.getIndex() - uiTabRef.getFirstVisibleRow() + 1];

									if (uiTabRef.getContextByIndex(nextUiTableRow.getIndex()) !== undefined) {
										if (uiTabRef.getContextByIndex(nextUiTableRow.getIndex()).getPath().includes("/sap.ui.table.GroupInfo")) {
											nextUiTableRow = uiTabRef.getRows()[rowTabRef.getIndex() - uiTabRef.getFirstVisibleRow() + 2];
										}

										var nextId = nextUiTableRow.$().find('[data-refcol="' + refCol + '"]').attr('id');

										if (nextId === undefined) {
											for (var idxRec = 2; idx <= uiTabRef.getRows().length; idxRec++) {
												nextUiTableRow = uiTabRef.getRows()[rowTabRef.getIndex() - uiTabRef.getFirstVisibleRow() + idxRec];
												nextId = nextUiTableRow.$().find('[data-refcol="' + refCol + '"]').attr('id');
												if (nextId !== undefined) {
													break;
												}
											}
										}

										if (nextId !== undefined) {
											var nextId = nextUiTableRow.$().find('[data-refcol="' + refCol + '"]').attr('id');
											sap.ui.getCore().byId(nextId).focus();
											sap.ui.getCore().byId(nextId).$().find('input').select();
										} else {
											if (foundCol) {
												if (nextUiTableRow.getCells()[idx].$().find('[data-FioritalType="FioritalInput"]').length === 1) {
													var nextId = nextUiTableRow.getCells()[idx].$().find('[data-FioritalType="FioritalInput"]').attr('id');
													if (sap.ui.getCore().byId(nextId).getVisible()) {
														sap.ui.getCore().byId(nextId).focus();
													} else {
														nextUiTableRow.getCells()[idx].$().parent().parent().focus();
													}
												}
											}
										}

									}
								} catch (error) {
									break;
								}

							}

						} //<-- no next row
					}

					//<--- end move on sap.ui.table

				}

				break;
			case 38: // UP

				this.fireEvent("onMove", {
					direction: 'U',
					jqe: evt
				});

				managed = true;

				if (this.getType() === 'Number') {

					evt.preventDefault(); //<-- stop bubbleling of event
					evt.stopPropagation();

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

						if (refCol === null) {
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

					//<--- end move on sap.m.table

					//---> move on sap.ui.table
					var refCmp = this;
					found = false;
					while (refCmp.getParent() !== null) {

						if (refCmp.getParent().getMetadata().getName() == "sap.ui.table.Row") {
							found = true;
							break;
						} else {
							refCmp = refCmp.getParent();
						}
					}

					//--> line found now look for next line
					if (found) {

						var refCol = this.data('REFCOL');

						// if (refCol === null) {
						// 	evt.preventDefault(); //<-- stop bubbleling of event
						// 	return;
						// }

						var uiTabRef = refCmp.getParent().getParent();
						var rowTabRef = refCmp.getParent();

						var foundCol = false;
						for (var idx = 0; idx <= rowTabRef.getCells().length; idx++) {
							if (rowTabRef.getCells()[idx] !== undefined) {
								var finput = rowTabRef.getCells()[idx].$().find('[data-FioritalType="FioritalInput"]');
								if (finput.length > 0) {
									if (sap.ui.getCore().byId(finput.attr('id')) === this) {
										foundCol = true;
										break;
									}
								}
							}
						}

						//--> prev rows exists in absolute ?
						if (rowTabRef.getIndex() > 0) {

							//--> first visible row?
							if (uiTabRef.getRows()[0] == rowTabRef) {

								uiTabRef.setFirstVisibleRow(uiTabRef.getFirstVisibleRow() - 1);

								var thisObj = {
									uiTabRef: uiTabRef,
									thisRef: this,
									rowTabRef: rowTabRef,
									foundCol: foundCol,
									idx: idx
								};

								if (this.getValue() !== this.getLastValue()) {
									this.setValue(this.getValue());

									this.fireChange({
										value: this.getValue()
									});

									this.setLastValue(this.getValue());
								}

								//-->focus in timeout to ensure redraw
								setTimeout(function () {

									var prevRow = this.uiTabRef.getRows()[0];

									if (this.thisRef.data('REFCOL') !== null) {
										var nextId = prevRow.$().find('[data-refcol="' + refCol + '"]').attr('id');
										sap.ui.getCore().byId(nextId).focus();
										sap.ui.getCore().byId(nextId).$().find('input').select();
									} else {
										if (this.foundCol) {
											if (prevRow.getCells()[this.idx].$().find('[data-FioritalType="FioritalInput"]').length === 1) {
												var nextId = prevRow.getCells()[this.idx].$().find('[data-FioritalType="FioritalInput"]').attr('id');
												if (sap.ui.getCore().byId(nextId).getVisible()) {
													sap.ui.getCore().byId(nextId).focus();
												} else {
													prevRow.getCells()[this.idx].$().parent().parent().focus();
												}
											}
										}
									}

								}.bind(thisObj), 0);

							} else {
								try {

									//--> need to find previous Row
									var prevUiTableRow = uiTabRef.getRows()[rowTabRef.getIndex() - uiTabRef.getFirstVisibleRow() - 1];
									if (uiTabRef.getContextByIndex(prevUiTableRow.getIndex()).getPath().includes("/sap.ui.table.GroupInfo")) {
										prevUiTableRow = uiTabRef.getRows()[rowTabRef.getIndex() - uiTabRef.getFirstVisibleRow() - 2];
									}

									var nextId = prevUiTableRow.$().find('[data-refcol="' + refCol + '"]').attr('id');

									if (nextId === undefined) {
										for (var idxRec = rowTabRef.getIndex() - 1; idx >= 0; idxRec--) {
											prevUiTableRow = uiTabRef.getRows()[idxRec];
											nextId = prevUiTableRow.$().find('[data-refcol="' + refCol + '"]').attr('id');
											if (nextId !== undefined) {
												break;
											}
										}
									}

									if (nextId !== undefined) {
										var nextId = prevUiTableRow.$().find('[data-refcol="' + refCol + '"]').attr('id');
										sap.ui.getCore().byId(nextId).focus();
										sap.ui.getCore().byId(nextId).$().find('input').select();
									} else {
										if (foundCol) {
											if (prevUiTableRow.getCells()[idx].$().find('[data-FioritalType="FioritalInput"]').length === 1) {
												var nextId = prevUiTableRow.getCells()[idx].$().find('[data-FioritalType="FioritalInput"]').attr('id');
												if (sap.ui.getCore().byId(nextId).getVisible()) {
													sap.ui.getCore().byId(nextId).focus();
												} else {
													prevUiTableRow.getCells()[idx].$().parent().parent().focus();
												}
											}
										}
									}

								} catch (error) {

								}

							}

						} //<-- already at the top
					}

					//<--- end move on sap.ui.table
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

					if (refCol === null) {
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

				//---> move on sap.ui.table
				var refCmp = this;
				found = false;
				while (refCmp.getParent() !== null) {

					if (refCmp.getParent().getMetadata().getName() == "sap.ui.table.Row") {
						found = true;
						break;
					} else {
						refCmp = refCmp.getParent();
					}
				}

				//--> line found now look for next line
				if (found) {

					var refCol = this.data('REFCOL');
					if (refCol !== null) {
						var nextRefCol = parseInt(refCol) + 1;

						evt.preventDefault(); //<-- stop bubbleling of event

						var uiTabRef = refCmp.getParent().getParent();
						var rowTabRef = refCmp.getParent();

						var nextId = rowTabRef.$().find('[data-refcol="' + nextRefCol + '"]').attr('id');
						if (nextId !== undefined) {
							sap.ui.getCore().byId(nextId).focus();
						}
					}
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

					if (refCol === null) {
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

				//---> move on sap.ui.table
				var refCmp = this;
				found = false;
				while (refCmp.getParent() !== null) {

					if (refCmp.getParent().getMetadata().getName() == "sap.ui.table.Row") {
						found = true;
						break;
					} else {
						refCmp = refCmp.getParent();
					}
				}

				//--> line found now look for next line
				if (found) {

					var refCol = this.data('REFCOL');
					if (refCol !== null) {
						var nextRefCol = parseInt(refCol) - 1;

						evt.preventDefault(); //<-- stop bubbleling of event

						var uiTabRef = refCmp.getParent().getParent();
						var rowTabRef = refCmp.getParent();

						var nextId = rowTabRef.$().find('[data-refcol="' + nextRefCol + '"]').attr('id');
						if (nextId !== undefined) {
							sap.ui.getCore().byId(nextId).focus();
						}
					}
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

			this.fireEvent("onFocus", {
				jqe: evt
			});
		},

		_focusOut: function (evt) {

			this.fireEvent("onFocusOut", {
				jqe: evt
			});
		},

		_keyPressed: function (evt) {

			this.fireEvent("onKeyPress", {
				jqe: evt
			});
		},

		renderer: "sap.m.InputRenderer" //<--- set standard renderer!

	});
});