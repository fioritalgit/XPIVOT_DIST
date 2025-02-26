 /* eslint-disable */

 sap.ui.define([
 	"sap/ui/core/XMLComposite",
 	"sap/m/Label",
 	"it/fiorital/fioritalui5lib/libs/swiper",
 	"sap/ui/dom/includeStylesheet",
 	"it/fiorital/fioritalui5lib/controls/FioritalButton",
 	"sap/ui/layout/Grid"
 ], function (Control, Label, SwiperSlider, includeStylesheet, FioritalButton, Grid) {
 	"use strict";

 	return Control.extend("it.fiorital.fioritalui5lib.controls.FioritalSwiper", {
 		metadata: {
 			properties: {
 				height: {
 					type: "string",
 					defaultValue: "3.7em"
 				},
 				width: {
 					type: "string",
 					defaultValue: "100%"
 				},
 				pushToBottom: {
 					type: "boolean",
 					defaultValue: false
 				},
 				showBottomBorder: {
 					type: "boolean",
 					defaultValue: false
 				}
 			},
 			aggregations: {

 			},
 			events: {

 			}
 		},

 		init: function () {
 			includeStylesheet("/resources/it/fiorital/fioritalui5lib/libs/swiper.css");
 			includeStylesheet("/sap/bc/ui5_ui5/sap/zfioritalui5lib/libs/swiper.css");

 			//---> show if parameter VK_SHOW is present in the application URL
 			var urlParams = new URLSearchParams(window.location.search);
 			if (urlParams.get("VK_SHOW") === 'X') {
 				this.setVisible(true);
 			} else {
 				this.setVisible(false);
 			}
 		},

 		onBeforeRendering: function () {
 			if (!this.getVisible()) {
 				console.log("Fiorital Swiper not visible! URL Parameter VK_SHOW missing! Do not render.");
 				return;
 			}

 			var rawStructure = this.data();

 			//---> parse it!  "{ key:77 text:'A', icon:'sap-icon://action-settings' , rowId:1, colId:1, type:'Ghost' }"
 			var dataStructure = [];

 			for (var [key, value] of Object.entries(rawStructure)) {

 				//--> ensure we have the row
 				while (dataStructure.length < value.rowId) {
 					dataStructure.push({
 						sliders: []
 					});
 				}

 				var actualRow = dataStructure[value.rowId - 1]; //<-- current row

 				//--> ensure we have column
 				while (actualRow.sliders.length < value.colId) {
 					actualRow.sliders.push([]); //<-- empty column block
 				}

 				var actualColumnBlock = actualRow.sliders[value.colId - 1];

 				//--> create button data
 				var btd = {
 					key: value.key,
 					keyCode: value.keyCode,
 					text: value.text,
 					icon: value.icon,
 					type: value.typeButton,
 					visible: value.visible,
 					fontsize: value.fontsize,
 					lineH: value.lineH
 				};

 				//--> defaults
 				if (btd.type === undefined) {
 					btd.type = 'Ghost';
 				}

 				if (btd.icon === undefined) {
 					btd.icon = '';
 				}

 				actualColumnBlock.push(btd);

 			}

 			this.slidersArr = [];
 			
 			var externalCointainer = this.byId("swiperWrapper");

 			for (var slider = 0; slider < dataStructure.length; slider++) { //<-- rows
 			
 				if (externalCointainer.getItems().find(function (el) {
 						return el.getId() === this.getId() + "-SLIDER-" + slider
 					}.bind(this))) {
					console.log("Existing " + this.getId() + "-SLIDER-" + slider + "; already rendered exit from dynamic component creation for loop.");
					break;
 				}

 				var newSlider = new sap.m.HBox({
 					id: this.getId() + "-SLIDER-" + slider,
 					width: "100%",
 					height: "100%"
 				});

 				newSlider.addStyleClass("swiper-slide");
 				this.slidersArr.push(newSlider);

 				externalCointainer.addItem(newSlider); //<-- add row to master vertical Swiper

 				//--> horizontal swiper wrapper
 				var newSlidesWrapper = new sap.m.HBox({
 					width: "100%",
 					height: "100%"
 				});
 				newSlider.addItem(newSlidesWrapper.addStyleClass("swiper-wrapper"));

 				for (var slide = 0; slide < dataStructure[slider].sliders.length; slide++) {

 					var newSlideOuter = new sap.m.HBox({
 						id: this.getId() + "-SLIDEOUTER-" + slider + slide,
 						width: "100%",
 						height: "100%",
 						justifyContent: "Center",
 						alignItems: "Start"
 					});
 					
 					var newSlide = new sap.ui.layout.Grid({
 						id: this.getId() + "-SLIDE-" + slider + slide,
 						width: "100%",
 						height: "100%",
 						defaultSpan: "L2 M2 S2",
 						vSpacing: 1,
 						hSpacing: 0
 					});
 					
 					newSlide.$().css("padding", "0 !important" );
 					newSlideOuter.addItem(newSlide);
 					
 					

 					newSlidesWrapper.addItem(newSlideOuter.addStyleClass("swiper-slide"));

 					//--> buttons
 					for (var slideItem = 0; slideItem < dataStructure[slider].sliders[slide].length; slideItem++) {
 						
 						if (dataStructure[slider].sliders[slide][slideItem].fontsize === undefined ){
 							var fontsize = "1.1em";
 						}else{
 							fontsize = dataStructure[slider].sliders[slide][slideItem].fontsize;
 						}

 						if (dataStructure[slider].sliders[slide][slideItem].lineH === undefined ){
 							var lineH = "3em";
 						}else{
 							lineH = dataStructure[slider].sliders[slide][slideItem].lineH;
 						}

 						var newButtonItem = new FioritalButton({
 							id: this.getId() + "-SLIDEBUTTON-" + slider + slide + slideItem,
 							width: "3.5em",
 							text: dataStructure[slider].sliders[slide][slideItem].text,
 							icon: dataStructure[slider].sliders[slide][slideItem].icon,
 							type: dataStructure[slider].sliders[slide][slideItem].type,
 							height: "3.5em",
 							lineHeight: lineH,
 							fontSize:  fontsize,
 							alignItems: "center",
 							enabled: dataStructure[slider].sliders[slide][slideItem].visible,
 							enableDirectPress: true,
 							pressDirect: function (evt) {
 								var buttonData = evt.getParameter("data").keyData;
 								
 								document.dispatchEvent(new KeyboardEvent('keydown', {'key': buttonData.key,'keyCode': buttonData.keyCode }));

 								/*$(document).trigger({
 									type: 'keydown',
 									which: buttonData.key,
 									keyCode: buttonData.key,
 									key: buttonData.text
 								});

 								$(document).find('[data-vk_target="X"]').trigger({
 									type: 'keydown',
 									which: buttonData.key,
 									keyCode: buttonData.key,
 									key: buttonData.text
 								});*/
 							}.bind(this)
 						});

 						newSlide.addContent(newButtonItem);
 						newButtonItem.addStyleClass("sapUiTinyMarginBegin");
 						newButtonItem.addStyleClass("sapUiTinyMarginBottom");
 						newButtonItem.data("keyData", dataStructure[slider].sliders[slide][slideItem]);
 					}
 				}
 			}
 			
 		},

 		onAfterRendering: function () {
 			
 			var externalCointainer = this.byId("swiperWrapper");
 			
 			this.slidersArr = [];
 			externalCointainer.getItems().forEach(function(item){
 				this.slidersArr.push(item);	
 			}.bind(this));

 			this.byId('swiperMaster').$().css("overflow", "hidden");

 			if (this.getShowBottomBorder()) {
 				this.byId('swiperMaster').$().css("border-bottom", "2px solid #2f3c48");
 			}

 			if (this.getPushToBottom() !== undefined && this.getPushToBottom()) {
 				/*var ref = $(document).find('[data-vkf_ref="X"]');

 				var cssBottomValue = "0px";
 				if (ref[0] !== undefined && $.device.is.desktop) {
 					if (ref.height() !== undefined && ref.height() !== 0) {
 						cssBottomValue = ref.height() + 5 + "px";
 					}
 				} else {
 					if (ref.height() !== undefined && ref.height() !== 0) {
 						cssBottomValue = ref.height() / window.devicePixelRatio + "px";
 					}
 				}

 				this.byId('swiperMaster').$().css("bottom", cssBottomValue);
 				this.byId('swiperMaster').$().css("position", "fixed");*/
 				
 				this.$().css("position", "absolute");
 				this.$().css("bottom", "0px");
 			}

 			//--> initialize master Swiper
 			var innerHBox = this.$().find(".mySwiper")[0];

 			this.swp = new Swiper(innerHBox, {
 				direction: "vertical",
 				navigation: {
 					nextEl: ".swiper-button-next",
 					prevEl: ".swiper-button-prev"
 				},
 				pagination: {
 					el: ".swiper-pagination",
 					dynamicBullets: true,
 				},
 			});

 			//--> initialize child Swipers (rows)
 			for (var idx = 0; idx < this.slidersArr.length; idx++) {
 				var slider = this.slidersArr[idx].$()[0];
 				this.swp = new Swiper(slider, {
 					direction: "horizontal",
 					navigation: {
 						nextEl: ".swiper-button-next",
 						prevEl: ".swiper-button-prev"
 					},
 					pagination: {
 						el: ".swiper-pagination",
 						dynamicBullets: true,
 					},
 				});
 			}

 		}
 	});
 });