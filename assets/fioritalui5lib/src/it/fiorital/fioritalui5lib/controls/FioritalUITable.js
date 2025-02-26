/* eslint sap-no-ui5base-prop: 0 */
/* eslint-disable */

// TODO
// auto APC listener
// --> specific template for fixed rows cells 
//		other fixed rows difference
// --> merge by value

// diagonal mark
// icon flash
// range filter (link to icon >>> auto icon color + standard popup) ?
// --> column header model (if array, up to then take last)
// --> column cell model (if array, up to then take last)

sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/model/json/JSONModel",
	// "sap/ui/core/_IconRegistry",
	"sap/base/security/encodeCSS",
	"sap/ui/table/Row",
	"sap/ui/table/Column"
], function (uitable, JSONModel, encodeCSS, Row, Column) {
	"use strict";
	return sap.ui.table.Table.extend("it.fiorital.flex5app.controls.FioritalUITable", {

		metadata: {
			properties: {
				rowHeightEm: {
					type: "float",
					defaultValue: ""
				},
				autoHeightAdjustment: {
					type: "boolean",
					defaultValue: false
				},
				autoResizeAdjustment: {
					type: "boolean",
					defaultValue: false
				},

				hideHorizontalScroll: {
					type: "boolean",
					defaultValue: false
				},

				cellOverflowVisible: {
					type: "boolean",
					defaultValue: false
				},

				isActiveArea: {
					type: "boolean",
					defaultValue: false
				},

				hideVerticalScoll: {
					type: "boolean",
					defaultValue: false
				},

				cellFormatter: {
					type: "function"
				},

				cellsMerge: {
					type: 'object' // cellsMerge="{merges:[{row:2,from:3,for:2}]}"
				},

				//------------------------------------------------------------------------------------------------

				//---> FAKE AGGREGATION: used to rebind to columns aggregation with internal (hidden) factory
				matrixContent: {
					type: "object",
					defaultValue: ""
				},

				matrixContentMode: {
					type: "string",
					defaultValue: "Array" //<-- [Array (line of type array of array)] , [Attribute (line with json with attribute names as index)]
				},

				matrixContentEdit: {
					type: "boolean",
					defaultValue: "false" //<-- edit cell ? 
				},

				matrixContentPrefix: {
					type: "string",
					defaultValue: "val" //<-- attribute prefix used in "Attribute" mode
				},

				matrixContentColumnWidth: {
					type: "string",
					defaultValue: "5em"
				},

				//------------------------------------------------------------------------------------------------

				linkToTable: {
					type: "string",
					defaultValue: ""
				},

				linkToTableVertical: {
					type: "boolean",
					defaultValue: false
				}

			},

			aggregations: {
				"cellTemplateMatrixMode": {
					multiple: false,
					singularName: "cellTemplateMatrixMode"
				},
				"cellTemplateMatrixModeMulti": {
					multiple: true,
					singularName: "cellTemplateMatrixModeMulti"
				},
				"columnTemplateMatrixMode": {
					multiple: false,
					singularName: "cellTemplateMatrixMode"
				},
				"columnTemplateMatrixModeMulti": {
					multiple: true,
					singularName: "columnTemplateMatrixModeMulti"
				},
				"toplinesTemplates": {
					multiple: true,
					singularName: "toplinesTemplates"
				}
			},

			events: {
				onMouseEnter: {
					event: {
						type: "Object"
					}
				},
				onMouseLeave: {
					event: {
						type: "Object"
					}
				},
				onIconClick: {
					event: {
						actionId: "string",
						cellData: "Object"
					}
				},
				onIconEnter: {
					event: {
						actionId: "string",
						cellData: "Object"
					}
				},
				onIconLeave: {
					event: {
						actionId: "string",
						cellData: "Object"
					}
				},
				onCellEnter: {
					event: {
						cellData: "Object"
					}
				},
				onCellLeave: {
					event: {
						cellData: "Object"
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			sap.ui.table.Table.prototype.constructor.apply(this, arguments);

			if (this.getAutoHeightAdjustment()) {
				$(window).resize(this._onResize.bind(this));
			}

			/*this.linkedTables = [];
			this.verticalLinkedTables = [];
			this.filterRanges = [];

			this.realRowBuffer = [];

			//--> create globlal weakMap fo rcolmn to cell reference
			if (window.cellWM === undefined){
				window.cellWM = new window.WeakMap();
			}

			//--> must pathc Column.ofCell behaviour to allow managinf of special fixed rows template
			if (Column._ofCell === undefined){
				Column._ofCell = Column.ofCell;
				Column.ofCell = function(oCell) {
					var cr = window.cellWM.get(oCell);
					if (cr !== undefined){
						debugger;
						return cr;
					}else{
						return Column._ofCell(oCell);
					}
				};
			}*/

		},

		/*blockByGuid: function (guid) {
			var el = this.getControlFromGuid(guid);
			if (el !== undefined) {
				el.setBlocked(true);
			}
		},

		removeBlockByGuid: function (guid) {
			var el = this.getControlFromGuid(guid);
			if (el !== undefined) {
				el.setBlocked(false);
			}
		},

		getControlFromGuid: function (guid) {

			var el = $('[cellGuid="' + guid + '"]')
			if (el.length === 1) {
				var ui5Id = el.find('.sapUiTableCellInner').children().attr('id');
				return sap.ui.getCore().byId(ui5Id);
			} else {
				return undefined;
			}
		},

		getInputFromGuid: function (guid, inputIdx) {

			if (inputIdx === undefined) {
				var searchIdx = 1;
			} else {
				var searchIdx = inputIdx;
			}

			var el = $('[cellGuid="' + guid + '"]')
			if (el.length > 0) {
				var inputEls = el.find('.sapMInput');
				if (searchIdx <= inputEls.length) {
					return sap.ui.getCore().byId($(inputEls[searchIdx - 1]).attr('id'));
				} else {
					return undefined;
				}

			} else {
				return undefined;
			}
		},*/

		_onResize: function () {
			this.invalidate();
		},

		_getViewController: function () {
			this.viewController = null;
			this.parent = this;
			do {
				this.parent = this.parent.getParent();
				if (this.parent !== null && this.parent.getMetadata().getName() === 'sap.ui.core.mvc.XMLView') {
					this.viewController = this.parent.getController();
					break;
				}
			} while (parent !== null);
		},

		addLinkedTable: function (linkedTableRef) {

			var fnd = this.linkedTables.find(function (st) {
				return (st === linkedTableRef);
			});

			if (fnd === undefined) {
				this.linkedTables.push(linkedTableRef);
			}

		},

		setHorizontalPosition: function (leftSCroll) {
			this.$().find('.sapUiTableHSb')[0].scrollLeft = leftSCroll;
		},

		/*_addIcon: function (valIcon, cell, actualShiftMap) {

			var vIconInfo = _IconRegistry.getIconInfo(valIcon.src, undefined, "mixed");

			//--> create the icon span
			var newul = $("<span>").appendTo(cell.cell);
			newul.addClass('sapUiIcon');
			newul.addClass('fioritalCellIcon');
			newul.css("position", "absolute");

			newul.attr("cidx", cell.cidx);
			newul.attr("ridx", cell.ridx);

			//--> events: take actionId from attribute
			if (valIcon.actionId !== undefined) {
				newul.data('actionId', valIcon.actionId);
			} else {
				newul.data('actionId', 'generic');
			}

			newul.click(this._iconClickHandler.bind(this));
			newul.mouseenter(this._iconEnterHandler.bind(this));
			newul.mouseleave(this._iconLeaveHandler.bind(this));

			newul.attr("data-sap-ui-icon-content", vIconInfo.content);
			newul.css("font-family", "'" + encodeCSS(vIconInfo.fontFamily) + "'");
			if (!vIconInfo.suppressMirroring) {
				newul.addClass("sapUiIconMirrorInRTL");
			}

			var wdt;
			if (valIcon.width !== undefined) {
				newul.css("width", valIcon.width);
				wdt = parseFloat(valIcon.width);
			} else {
				newul.css("width", '1em');
				wdt = 1;
			}

			if (valIcon.height !== undefined) {
				newul.css("height", valIcon.height);
				newul.css("line-height", valIcon.height);
			} else {
				newul.css("height", '1em');
				newul.css("line-height", '1em');
			}

			if (valIcon.size !== undefined) {
				newul.css("font-size", valIcon.size);
			} else {
				newul.css("font-size", '0.8em');
			}

			if (valIcon.color !== undefined) {
				newul.css("color", valIcon.color);
			} else {
				newul.css("color", 'darkgrey');
			}

			if (valIcon.position !== undefined) {

				switch (valIcon.position) {
					case 'TL':
						newul.css("top", "0.5em");
						newul.css("left", actualShiftMap.TL + "em");
						actualShiftMap.TL = actualShiftMap.TL + wdt + 0.3;
						break;
					case 'BL':
						newul.css("bottom", "0.5em");
						newul.css("left", actualShiftMap.BL + "em");
						actualShiftMap.BL = actualShiftMap.BL + wdt + 0.3;
						break;
					case 'TR':
						newul.css("top", "0.5em");
						newul.css("right", actualShiftMap.TR + "em");
						actualShiftMap.TR = actualShiftMap.TR + wdt + 0.3;
						break;
					case 'BR':
						newul.css("bottom", "0.5em");
						newul.css("right", actualShiftMap.BR + "em");
						actualShiftMap.BR = actualShiftMap.BR + wdt + 0.3;
						break;
					default:
						newul.css("top", "0.5em");
						newul.css("right", actualShiftMap.TR + "em");
						actualShiftMap.TR = actualShiftMap.TR + wdt + 0.3;
						break;
				}

			} else {
				//--> default: TR
				newul.css("top", "0.5em");
				newul.css("right", actualShiftMap.TR + "em");
				actualShiftMap.TR = actualShiftMap.TR + wdt + 0.3;
			}

		},

		_iconClickHandler: function (jqe) {

			var actionId = $(jqe.target).data().actionId;
			var ridx = parseInt($(jqe.target).attr('ridx'));
			var cidx = parseInt($(jqe.target).attr('cidx'));
			var cellData = this.getCellDataFromIndex(ridx, cidx);

			this.fireEvent("onIconClick", {
				actionId: actionId,
				cellData: cellData
			});

		},

		_iconEnterHandler: function (jqe) {

			var actionId = $(jqe.target).data().actionId;
			var ridx = parseInt($(jqe.target).attr('ridx'));
			var cidx = parseInt($(jqe.target).attr('cidx'));
			var cellData = this.getCellDataFromIndex(ridx, cidx);

			this.fireEvent("onIconEnter", {
				actionId: actionId,
				cellData: cellData
			});

		},

		_iconLeaveHandler: function (jqe) {

			var actionId = $(jqe.target).data().actionId;
			var ridx = parseInt($(jqe.target).attr('ridx'));
			var cidx = parseInt($(jqe.target).attr('cidx'));
			var cellData = this.getCellDataFromIndex(ridx, cidx);

			this.fireEvent("onIconLeave", {
				actionId: actionId,
				cellData: cellData
			});

		},


		_cellEnterHandler: function (jqe) {

			var trgt = $(jqe.currentTarget);
			var fnd = this.fioCells.find((scell) => {
				return (scell.cell.attr('id') === trgt.attr('id'));
			})

			var cellData = this.getCellDataFromIndex(fnd.ridx, fnd.cidx);

			this.fireEvent("onCellEnter", {
				cellData: cellData
			});

		},

		_cellLeaveHandler: function (jqe) {

			var trgt = $(jqe.currentTarget);
			var fnd = this.fioCells.find((scell) => {
				return (scell.cell.attr('id') === trgt.attr('id'));
			})

			var cellData = this.getCellDataFromIndex(fnd.ridx, fnd.cidx);

			this.fireEvent("onCellLeave", {
				cellData: cellData
			});

		},

		_getFromIdxCache: function (idx) {
			return this.realRowBuffer.find((scache) => {
				return (scache.idx === idx)
			})
		},

		_addIdxCache(idx, realIdx) {
			this.realRowBuffer.push({
				idx: idx,
				realIdx: realIdx
			});
		},

		getCellDataFromIndex: function (ridx, cidx) {

			var rowMdl = this.getModel(this.getBindingInfo('rows').model);
			var frc = this.getFixedRowCount();

			if (ridx < frc) {
				return rowMdl.getProperty('/' + ridx + '/' + cidx);
			} else {

				var fvr = this.getFirstVisibleRow();
				var rowFullIdx = fvr + ridx;

				if (this.filterRanges.length > 0) {

					//--> get from cache first!
					var cacheIdx = this._getFromIdxCache(rowFullIdx + 1);
					if (cacheIdx !== undefined) {
						var realRowIdx = cacheIdx.realIdx;
					} else {
						var realRowIdx = this._getRangeFilteredContexts(this.getBinding(), rowFullIdx + 1);
						this._addIdxCache(rowFullIdx + 1, realRowIdx);
					}

					return rowMdl.getProperty('/' + realRowIdx + '/' + cidx);

				} else {

					return rowMdl.getProperty('/' + rowFullIdx + '/' + cidx);
				}

			}

		},

		_defaultCellHandler: function (scell) {

			try {
				var val = this.getCellDataFromIndex(scell.ridx, scell.cidx)

				//--> add global guid
				if (val.guid !== undefined) {
					scell.cell.attr('cellGuid', val.guid);
				} else {
					scell.cell.attr('cellGuid', '');
				}

				if (val.backColor !== undefined) {
					scell.cell.css('background-color', val.backColor);
				} else {
					scell.cell.css('background-color', '');
				}

				//--> add icons if specified
				var actualShiftMap = {
					TR: 0.5,
					TL: 0.5,
					BL: 0.5,
					BR: 0.5
				}

				if (val.icon !== undefined && typeof val.icon === 'string') {

					var iconStdData = {
						src: val.icon,
						width: '1em',
						height: '1em',
						size: '0.8em',
						color: 'black',
						position: 'TR'
					}

					this._addIcon(iconStdData, scell, actualShiftMap);
				}

				if (val.icon !== undefined && typeof val.icon === 'object') {
					//--> multiple or single?
					if (Array.isArray(val.icon)) {

						val.icon.forEach(function (sicon) {
							this._addIcon(sicon, scell, actualShiftMap); //<-- single
						}.bind(this));

					} else {
						this._addIcon(val.icon, scell, actualShiftMap); //<-- single
					}
				}

				//--> side band
				if (val.band === undefined) {
					scell.cell.css('border-right', '');
				}

				if (val.band !== undefined && typeof val.band === 'string') { //<-- only color
					scell.cell.css('border-right', '5px solid ' + val.band);
				}

				if (val.band !== undefined && typeof val.band === 'object') {
					var bs = (val.band.size !== undefined) ? val.band.size : '5px';
					var color = (val.band.color !== undefined) ? val.band.color : 'red';
					scell.cell.css('border-right', bs + ' solid ' + color);
				}


			} catch (cx) {

			}
		},

		_formatCells: function () {

			var frc = this.getFixedRowCount();
			var fvr = this.getFirstVisibleRow();

			//--> remove icons child span elements
			this.$().find(".fioritalCellIcon").remove();

			//--> cell own properties are available only in matrix mode!
			if (Array.isArray(this.getMatrixContent()) && this.getMatrixContentMode() === 'Array') {

				this.fioCells.forEach((scell) => {

					scell.cell.mouseenter(this._cellEnterHandler.bind(this));

					if (this.getCellFormatter() !== undefined) {
						//--> delegate to specific controller function
						this.getCellFormatter().call(this, scell, this.getCellDataFromIndex(scell.ridx, scell.cidx)); //<--- delegate to function provided from controller in XML
					} else {
						//--> default handler
						this._defaultCellHandler(scell);
					}

					//--> manage merge
					var cm = this.getCellsMerge();
					if (cm !== undefined) {

						var realCellRef = {};
						if (scell.ridx < frc) {
							realCellRef.ridx = scell.ridx;
							realCellRef.cidx = scell.cidx;
						} else {

							var rowFullIdx = fvr + scell.ridx;

							if (this.filterRanges.length > 0) {

								//--> get from cache...need to be there here
								var cacheIdx = this._getFromIdxCache(rowFullIdx + 1);
								realCellRef.ridx = cacheIdx.realIdx;
								realCellRef.cidx = scell.cidx;

							} else {
								realCellRef.ridx = scell.ridx;
								realCellRef.cidx = scell.cidx;
							}

						}

						//--> cell is before merge range
						var bcm = this._isCellStartMerge(cm, realCellRef);
						if (bcm !== undefined) {
							scell.cell.attr('colspan', bcm.toString());
						} else {

							//--> kill cells within merge
							var isMiddle = this._isCellInMerge(cm, realCellRef);
							if (isMiddle) {
								scell.cell.remove();
							} else {
								scell.cell.attr('colspan', '');
							}

						}

					}
				})
			}
		},

		_isCellStartMerge: function (cm, scell) {

			var fnd = cm.merges.find((sMerge) => {
				if (sMerge.row === scell.ridx) {
					return (sMerge.from === scell.cidx);
				} else {
					return false;
				}
			});

			if (fnd !== undefined) {
				return fnd.for;
			} else {
				return undefined;
			}
		},

		_isCellInMerge: function (cm, scell) {

			var fnd = cm.merges.find((sMerge) => {
				if (sMerge.row === scell.ridx) {
					return (sMerge.from < scell.cidx && ((sMerge.from + sMerge.for) >= scell.cidx));
				} else {
					return false;
				}
			});

			if (fnd !== undefined) {
				return true;
			} else {
				return false;
			}
		},

		_setCellsRefs: function () {

			//--> mark cells with relative model idx
			var rws = $(this.$().find('table:not(.sapUiTableCHT)')).find('[role="row"]');
			var tds;
			this.fioCells = [];
			this.fioRows = [];

			if (rws.length > 0) {
				rws.each(function (idxr) {
					var jqr = $(rws[idxr]);
					this.fioRows.push(jqr);
					jqr.attr('fioRowIdx', idxr);

					tds = $(rws[idxr]).children();
					tds.each(function (idxc) {
						var jqc = $(tds[idxc]);
						this.fioCells.push({
							cell: jqc,
							ridx: idxr,
							cidx: idxc
						});
						jqc.attr('fioColIdx', idxc); //<-- store globally
					}.bind(this));
				}.bind(this));
			}

		},

		_makeid: function (length) {
			var result = '';
			var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;
			for (var i = 0; i < length; i++) {
				result += characters.charAt(Math.floor(Math.random() *
					charactersLength));
			}
			return result;
		},

		addFilterRange: function (filterObject, activate) {
			if (typeof filterObject === 'object') {

				if (filterObject.id === undefined) {
					filterObject.id = this._makeid(5); //<-- filter unique id auto assigned
				}

				if (filterObject.matchType === undefined) {
					filterObject.matchType = 'fuzzy';
				}

				if (filterObject.filterColumns === undefined) {
					filterObject.filterColumns = [];
				}

				if (filterObject.filterRowsRange === undefined) {
					filterObject.filterRowsRange = [];
				}

				this.filterRanges.push(filterObject);

				//--> activate filter?
				this.invalidate()
			}
		},

		//--> OVERRIDE stadard
		_getTotalRowCount: function () {

			var oBinding = this.getBinding();
			var oBindingInfo = this.getBindingInfo("rows");

			if (oBinding !== undefined && this.filterRanges.length > 0) {
				var filteredCtxs = this._getRangeFilteredContexts(oBinding);
				return filteredCtxs.length;
			}

			if (!oBinding) {
				return 0;
			}

			if (oBindingInfo.length != null) {
				return oBindingInfo.length;
			}

			return oBinding.getLength();
		},

		getTotalRowCount: function (oTable, bIgnoreCache) {

			var oBinding = oTable.getBinding();
			var oBindingInfo = oTable.getBindingInfo("rows");

			if (oBinding !== undefined && this.filterRanges.length > 0) {
				var filteredCtxs = this._getRangeFilteredContexts(oBinding);
				return filteredCtxs.length;
			}

			if (!oBinding) {
				return 0;
			}

			if (oBindingInfo.length != null) {
				return oBindingInfo.length;
			}

			if (bIgnoreCache === true) {
				return oBinding.getLength();
			}

			if (!oTable._bContextsAvailable) {
				return _private(oTable).iCachedBindingLength;
			}

			return oBinding.getLength();
		},

		_getRangeFilteredContexts: function (oBinding, upToCountFiltered, realRowIdx) {

			var allCtxs = oBinding.getContexts();
			var filteredCtxs = [];

			var idx = -1;
			var filteredCount = 0;
			var realIdx = undefined;

			allCtxs.forEach(function (ctx) {

				idx = idx + 1;
				var data = ctx.getModel().getProperty(ctx.getPath());

				//--> check all filters
				var valid = true;
				this.filterRanges.forEach(function (sf) {

					//--> all columns
					var colCheck = false;
					sf.filterColumns.forEach(function (sfc) {
						var colData = data[sfc.colidx];
						if (colData[sfc.attribute].toString().toUpperCase().indexOf(sf.filterValue) > -1) {
							colCheck = true;
						}
					})

					if (!colCheck) {
						valid = false;
					}

				}.bind(this));

				if (valid) {
					filteredCtxs.push(ctx);

					filteredCount = filteredCount + 1;
					if (upToCountFiltered !== undefined && filteredCount === upToCountFiltered) {
						realIdx = idx;
					}
				}

			}.bind(this));

			if (realIdx !== undefined) {
				return realIdx;
			} else {
				return filteredCtxs;
			}

		},

		//--> OVERRIDE standard
		_getContexts: function (iStartIndex, iLength, iThreshold, bKeepCurrent) {
			var oBinding = this.getBinding();

			//--> is context filter active?
			if (this.filterRanges.length > 0) {

				//--> get filtered contexts
				var filteredCtxs = this._getRangeFilteredContexts(oBinding);

				//--> take n from 
				return filteredCtxs.slice(iStartIndex, (iStartIndex + iLength));

			} else {
				return oBinding ? oBinding.getContexts(iStartIndex, iLength, iThreshold, bKeepCurrent) : [];
			}

		},

		_getRowClone: function (vIndex) {

			var cols = this.getColumns();
			var fixedTemplae = this.getToplinesTemplates();
			if (fixedTemplae.length > 0 && vIndex < this.getFixedRowCount()) {

				var bIndexIsNumber = typeof vIndex === "number";
				var bRowIsPoolable = bIndexIsNumber;
				var oRowClone = bRowIsPoolable ? this._aRowClones[vIndex] : null;

				if (oRowClone && !oRowClone.bIsDestroyed) {
					return oRowClone;
				}

				var oRowClone = new Row(this.getId() + "-rows" + "-row" + (bIndexIsNumber ? vIndex : "-" + vIndex));

				// Add cells to the row clone
				var aColumns = this.getColumns();
				for (var i = 0, l = aColumns.length; i < l; i++) {
					if (aColumns[i].getVisible()) {

						if (i < fixedTemplae.length) {
							var oColumnTemplateClone = fixedTemplae[i].clone();
						} else {
							//--> take last
							var oColumnTemplateClone = fixedTemplae[fixedTemplae.length - 1].clone();
						}

						this._RedirectBinding(oColumnTemplateClone, i);

						oRowClone.addCell(oColumnTemplateClone);
						this._aRowClones[vIndex] = oRowClone;

						//--> must set in weakmap for column determination from cell (override in constructor)
						window.cellWM.set(oColumnTemplateClone,cols[i]);

					}
				}

				return oRowClone;

			} else {
				return sap.ui.table.Table.prototype._getRowClone.apply(this, arguments);
			}

		},*/

		onAfterRendering: function () {

			sap.ui.table.Table.prototype.onAfterRendering.apply(this, arguments);

			/*			//--> store cell refs as attributes
						this._setCellsRefs();
						this._formatCells();

						//--> handle vertical link with this
						this.attachFirstVisibleRowChanged(undefined, function (evt) {

							//--> reset buffer
							this.realRowBuffer = [];

							//--> refromat cells 
							this._formatCells();

							//--> linked vertically
							this.verticalLinkedTables.forEach(function (st) {
								if (st.getLinkToTableVertical()) {
									st.setFirstVisibleRow(evt.getParameter('firstVisibleRow'));
								}
							}.bind(this));

							this.linkedTables.forEach(function (st) {
								if (st.getLinkToTableVertical()) {
									st.setFirstVisibleRow(evt.getParameter('firstVisibleRow'));
								}
							}.bind(this));
						});*/

			//---> hide vertical scroll
			if (this.getHideVerticalScoll() === true) {
				this.$().find('.sapUiTableVSbContainer').css('width', '0px');
				this.$().find('.sapUiTableCtrlScr').css('margin-right', '0px');
				this.$().find('.sapUiTableVSbHeader').css('width', '0px');
			}

			/*//--> mouse events
			this.$().mouseenter(function (evt) {
				this.setIsActiveArea(true);
				sap.ui.fioritalActiveUItable = this; //<-- globally make available

				this.fireEvent("onMouseEnter", {
					jqe: evt
				});
			}.bind(this));

			this.$().mouseleave(function (evt) {
				this.setIsActiveArea(false);

				this.fireEvent("onMouseLeave", {
					jqe: evt
				});
			}.bind(this));*/

			//--> hide horizontal scroll bars
			if (this.getHideHorizontalScroll() === true) {
				this.$().find('.sapUiTableHSb').css('height', '0px');
				this.$().find('.sapUiTableHSbBg').css('height', '0px');
			}

			//--> get controller of owner view
			this._getViewController();

			/*this.$().find('.sapUiTableHSb').scroll(function (evt) {
				this.linkedTables.forEach(function (sTable) {
					sTable.setHorizontalPosition(evt.currentTarget.scrollLeft);
				});
			}.bind(this));*/

			//--> link to other table
			if (this.getLinkToTable() !== '') {
				var otherTable = this.viewController.byId(this.getLinkToTable());
				if (otherTable !== undefined) {
					otherTable.addLinkedTable(this);

					var fnd = this.verticalLinkedTables.find(function (st) {
						return (st === otherTable);
					});

					if (fnd === undefined) {
						this.verticalLinkedTables.push(otherTable);
					}
				}
			}

			//--> cell overflow?
			if (this.getCellOverflowVisible() === true) {
				this.$().find('.sapUiTableCellInner').css('overflow', 'visible');
				this.$().find('.sapUiTableCellInner').addClass('ztopper');

			}

			/*
			if (this.getSelectionMode() === 'None') {
				var shiftCol = 1;
			} else {
				var shiftCol = 2;
			}
			
			this.getColumns().forEach(function (scol) {
				if (scol.getNoRightBorder !== undefined) {
					var finalCol = shiftCol + this.getColumns().indexOf(scol);
					this.$().find("[aria-colindex='" + finalCol + "']").css('border-right', '0px');
				}
			}.bind(this));*/

			if (this.getAutoHeightAdjustment() && this.getVisibleRowCountMode() !== "Fixed") {
				if (Array.isArray(this.getRows()) && this.getRows().length !== 0) {

					if (this.getColumnHeaderVisible() === true) {
						var hdrHeight = this.$().find('.sapUiTableColHdrCnt').outerHeight();
					} else {
						var hdrHeight = 0;
					}

					var toolbarHeight = this.$().find(".sapMTB").outerHeight();

					var parentHeight = this.getParent().$().outerHeight(),
						rh = this.getRows()[0].$().outerHeight();

					var rowCount = Math.floor((parentHeight - hdrHeight - toolbarHeight) / rh);
					
					if (rowCount === 0){
						return;
					}
					
					this.setVisibleRowCountMode("Fixed");
					if (this.getVisibleRowCount() !== rowCount) {
						this.setVisibleRowCount(rowCount);
					}
				}
			}

		},

		onBeforeRendering: function () {

			sap.ui.table.Table.prototype.onBeforeRendering.apply(this, arguments);

			/*
			//--> special rebound of column
			if (Array.isArray(this.getMatrixContent())) {

				var existingBinding = this.getBindingInfo('matrixContent');

				existingBinding.model = existingBinding.parts[0].model;
				existingBinding.path = existingBinding.parts[0].path;
				existingBinding.factory = function (sID, Context) {

					//--> col IDX by model
					var colidx = Context.getProperty(Context.getPath()).idxcol - 1;

					//--> binding mode?
					var bindValueString = '';
					var colBindString = '';
					switch (this.getMatrixContentMode()) {
						case 'Array':
							if (this.getBindingInfo('rows').model === undefined || this.getBindingInfo('rows').model === '') {
								bindValueString = "{" + colidx + "}";
							} else {
								bindValueString = "{" + this.getBindingInfo('rows').model + ">" + colidx + "}";
							}

							colBindString = colidx; //<-- if of sub element is array

							break;

						case 'Attribute':
							if (this.getBindingInfo('rows').model === undefined || this.getBindingInfo('rows').model === '') {
								bindValueString = "{value" + colidx + "}";
							} else {
								bindValueString = "{" + this.getBindingInfo('rows').model + ">" + this.getMatrixContentPrefix() + colidx + "}";
							}

							colBindString = this.getMatrixContentPrefix() + colidx;

							break;
					}

					//--> cell model provided ? use it as inner cell control 
					var cellModel = this.getCellTemplateMatrixMode();

					if (cellModel === undefined || cellModel === "") {

						//--> cell in edit mode?
						if (this.getMatrixContentEdit() === true) {
							var el = new sap.m.Input({
								value: bindValueString
							});
						} else {
							var el = new sap.m.Text({
								text: bindValueString
							});
						}

					} else {
						//--> for inner model must redirect binding to columns....					
						var el = cellModel.clone(); //<-- clone the control 
						this._RedirectBinding(el, colBindString);
					}

					return new sap.ui.table.Column({
						id: sID, //<-- passed from factory
						//label: 'COL '+Context.getProperty(Context.getPath()).idxcol.toString(),
						//label: new sap.m.Text({text: "{COLUMNS>idxcol}"}),  
						template: el,
						resizable: false,
						width: this.getMatrixContentColumnWidth()
					});

				}.bind(this);

				this.bindAggregation('columns', existingBinding);
			}*/

			//--> auto height adjust 
			if (this.getAutoHeightAdjustment()) {
				var base = Number(getComputedStyle(document.body, null).fontSize.replace(/[^\d]/g, ''));
				this.setRowHeight(Math.ceil(base * this.getRowHeightEm()));
			}
		},

		_RedirectBinding: function (ctrl, columnId) {

			//--> own bindings, set relative to column: must clone data read from XML
			var copyBindingInfo = jQuery.extend(true, {}, ctrl.mBindingInfos); //<-- DEEP copy otherwise parts will be the same
			Object.keys(copyBindingInfo).forEach(function (key) {
				//--> parts change
				copyBindingInfo[key].parts.forEach(function (spart) {
					spart.path = columnId + '/' + spart.path;
				});
			}.bind(this));

			ctrl.mBindingInfos = copyBindingInfo; //<-- set new bindingInfo

			//--> go deeper with aggregations (only if they are sap.ui.core.Control)
			if (ctrl.mAggregations !== undefined) {

				Object.keys(ctrl.mAggregations).forEach(function (key) {

					if (Array.isArray(ctrl.mAggregations[key])) {
						ctrl.mAggregations[key].forEach(function (sSubItem) {
							//--> check is control!
							if (sSubItem instanceof sap.ui.core.Control) {
								this._RedirectBinding(sSubItem, columnId);
							}
						}.bind(this));
					} else {
						if (ctrl.mAggregations[key] instanceof sap.ui.core.Control) {
							this._RedirectBinding(ctrl.mAggregations[key], columnId);
						}
					}

				}.bind(this));

			} //<-- all aggregations

		},

		renderer: "sap.ui.table.TableRenderer" //<--- set standard renderer!

	});
});