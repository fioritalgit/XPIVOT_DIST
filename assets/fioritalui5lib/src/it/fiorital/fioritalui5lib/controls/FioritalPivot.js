$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-core');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-widget');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-mouse');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-draggable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-sortable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"it/fiorital/fioritalui5lib/libs/pivotjs/pivot.min",
		"sap/ui/dom/includeStylesheet",
		"sap/ui/dom/includeScript"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, pivot, includeStylesheet, includeScript) {

		var pivotManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FioritalPivot", {
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {
					title: {
						type: "string",
						defaultValue: "Pivot Manager"
					}
				},
				events: {

				},
				aggregations: {

				}
			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this._includeControlCSS("libs/pivotjs/pivot.css");

			},

			getPivot: function () {
				return this._Pivot;
			},

			loadData: function (dataPivot, rows, cols, vals, keepLayout, configDirect) {

				if (configDirect === undefined) {

					if (keepLayout !== true) {

						this.PvtConfig = {
							rows: this.rows,
							cols: this.cols,
							vals: this.vals,
							aggregatorName: "Sum",
							rendererName: "Heatmap"
						};

					} else {

						if (this.PvtConfig === undefined) {

							this.PvtConfig = {
								rows: this.rows,
								cols: this.cols,
								vals: this.vals,
								aggregatorName: "Sum",
								rendererName: "Heatmap"
							};

						}

					}

				}else{
					this.PvtConfig = configDirect;
				}

				if (dataPivot !== null) {
					this.dataPivot = dataPivot;
				}

				setTimeout(function () {

					this.$().empty();
					this.$().append("<div id='pvt'></div>");

					this._Pivot = this.$().children().pivotUI(
						this.dataPivot, this.PvtConfig);

					//--> intercept the changes to get the new pivot parameters
					this.$().find('.pvtRendererArea').bind("DOMSubtreeModified", function () {

						setTimeout(function () {

							try {
								this.PvtConfig = $(this._Pivot[0]).data("pivotUIOptions");
							} catch (exc) {
								//--> no data; in rendering
							}

						}.bind(this), 0);

					}.bind(this));

				}.bind(this), 0);

			},

			onAfterRendering: function () {

			},

			_getObjects: function (obj, key, val) {
				for (var i in obj) {
					if (obj[i].pivotUIOptions !== undefined) {
						return obj[i].pivotUIOptions;
					}
				}

			},

			getParametersSet: function () {
				/*var obj = this._getObjects(this._Pivot[0]);
				return {
					cols: obj.cols,
					rows: obj.rows,
					vals: obj.vals
				};*/
				
				
				var config_copy =$(this._Pivot[0]).data("pivotUIOptions");
                delete config_copy["aggregators"];
                delete config_copy["renderers"];
           
				return config_copy;
				
			},

			_includeControlCSS: function (cssName) {

				//---> in FLP ??
				var baseurl = "";
				if (sap.ushell !== undefined && sap.ushell.Container !== undefined && sap.ushell.Container.getService("AppLifeCycle") !== undefined) {

					try {
						var cmp = sap.ushell.Container.getService("AppLifeCycle").getCurrentApplication().componentInstance;
						var appName = cmp.getMetadata().getLibraryName().split('.').pop();
						baseurl = this.getMetadata().getLibraryName();
						baseurl = 'sap/fiori/' + appName + '/resources/' + baseurl.split('.').join('/') + '/' + cssName;
						includeStylesheet(baseurl);
					} catch (uexc) {

						//---> ABAP stack 
						try { //prevent abort on SCP
							baseurl = '../zfioritalui5lib/' + cssName;
							includeStylesheet(baseurl);
						} catch (ex) {}

						//---> SCP
						try { //prevent abort on abap
							baseurl = this.getMetadata().getLibraryName();
							baseurl = 'resources/' + baseurl.split('.').join('/') + '/' + cssName;
							includeStylesheet(baseurl);
						} catch (ex) {}

					}

				} else {
					//---> ABAP stack 
					try { //prevent abort on SCP
						baseurl = '../zfioritalui5lib/' + cssName;
						includeStylesheet(baseurl);
					} catch (ex) {}

					//---> SCP
					try { //prevent abort on abap
						baseurl = this.getMetadata().getLibraryName();
						baseurl = 'resources/' + baseurl.split('.').join('/') + '/' + cssName;
						includeStylesheet(baseurl);
					} catch (ex) {}

				}

			},

		});

		return pivotManager;

	}, true);