sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"it/fiorital/fioritalui5lib/framework/keyframes",
		"sap/ui/model/json/JSONModel"
	],
	function (jQuery, XMLComposite, KF, JsonModel) {
		"use strict";

		var ScrollHbox = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.ScrollHbox", {

			KFref: KF,

			metadata: {
				properties: {
					width: {
						type: 'sap.ui.core.CSSSize',
						defaultValue: '100%'
					},
					height: {
						type: 'sap.ui.core.CSSSize',
						defaultValue: '100%'
					},
					animationSpeed: {
						type: 'sap.ui.model.type.Integer',
						defaultValue: 5
					},
					newDataText: {
						type: 'string',
						defaultValue: ''
					},
					newDataTextShowTime: {
						type: 'sap.ui.model.type.Integer',
						defaultValue: 5000
					},
					pauseOnMouseOver: {
						type: 'boolean',
						defaultValue: true
					},
					alertTextColor: {
						type: 'string',
						defaultValue: '#ffa900'
					}
					
					
				},
				aggregations: {
					items: {
						type: "sap.ui.core.Control",
						multiple: true,
						forwarding: {
							idSuffix: "--internalHbox",
							aggregation: "items"
						}
					}
				},
				defaultAggregation: "items"
			},

			onAfterRendering: function (evt) {

				//---> attach change events on model
				this.getBinding('items').suspend(); //<--- binding is suspened

				this.byId('internalHbox').onAfterRendering = function (evt) {

					if (this.redrawCycle !== undefined && this.redrawCycle == true) {

						this.keyframeManager = new this.KFref(this.byId('internalHbox').$()[0]);
						this.__internal_reset_animation();
						this.redrawCycle = false;

						if (this.getPauseOnMouseOver() === true) {

							//---> pause animation on mouse over 
							this.byId('internalHbox').$().mouseenter(function () {
								this.keyframeManager.pause();
							}.bind(this));

							//---> pause animation on mouse over 
							this.byId('internalHbox').$().mouseleave(function () {
								this.keyframeManager.resume();
							}.bind(this));

						}

						return;
					}

					if (this.getNewDataText() !== '') {
						//--> show text box and wait
						this.byId('internalHbox').setVisible(false);
						this.byId('internalHboxText').setVisible(true);

						setTimeout(function () {
							this.byId('internalHbox').setVisible(true);
							this.byId('internalHboxText').setVisible(false);
							//this.__internal_reset_animation();
							this.redrawCycle = true;
						}.bind(this), this.getNewDataTextShowTime());

					} else {
						//--> direct animation recalculation
						this.__internal_reset_animation();
					}

				}.bind(this);

				this.keyframeManager = new this.KFref(this.byId('internalHbox').$()[0]);
				
				this.__internal_reset_animation();

				if (this.getPauseOnMouseOver() === true) {

					//---> pause animation on mouse over 
					this.byId('internalHbox').$().mouseenter(function () {
						this.keyframeManager.pause();
					}.bind(this));

					//---> pause animation on mouse over 
					this.byId('internalHbox').$().mouseleave(function () {
						this.keyframeManager.resume();
					}.bind(this));

				}
				
				this.byId('alertText').onAfterRendering = function (evt) {
					this.byId('alertText').$().css('color',this.getAlertTextColor());
				}.bind(this);

			},

			__internal_reset_animation: function () {

				//---> must recalculate animation
				var wdt = this.__internal_calculate_width() + 'px';

/*				this.keyframeManager.define([{
					name: 'innerHobAnimation',
					'0%': {
						WebkitTansform: 'translateX(0%)',
						visibility: 'hidden'
					},
					'0.01%': {
						WebkitTansform: 'translateX(100%)',
						visibility: 'visible',
						transform: 'translateX(100%)',
						MozTansform: 'translateX(100%)'
					},
					'100%': {
						WebkitTansform: 'translateX(-' + wdt + ')',
						visibility: 'visible',
						transform: 'translateX(-' + wdt + ')',
						MozTansform: 'translateX(-' + wdt + ')'
					}
				}]);*/
				
				
				//---> Hardware accelerated CSS forced
				this.keyframeManager.define([{
					name: 'innerHobAnimation',
					'0%': {
						WebkitTansform: 'translate3d(0,0,0)',
						visibility: 'hidden'
					},
					'0.01%': {
						WebkitTansform: 'translate3d(100%,0,0)',
						visibility: 'visible',
						transform: 'translate3d(100%,0,0)',
						MozTansform: 'translate3d(100%,0,0)'
					},
					'100%': {
						WebkitTansform: 'translate3d(-' + wdt + ',0,0)',
						visibility: 'visible',
						transform: 'translate3d(-' + wdt + ',0,0)',
						MozTansform: 'translate3d(-' + wdt + ',0,0)'
					}
				}]);

				var timeAnimation = this.__internal_calculate_speed();

				this.keyframeManager.play(
					'innerHobAnimation ' + timeAnimation + 's linear 0s infinite normal forwards', {
						onBeforeStart: function () {},
						onStart: function () {},
						onIteration: function () {

							//--> force refresh of model; redraw if necessary
							this.getBinding('items').refresh(true); //<--- NOTE: Hbox redraw will happen only if model is changed

						}.bind(this)
					}
				);

			},
			
			__internal_calculate_speed: function (){
				
				var totalLen = 0;

				for (var idx = 0; idx < this.getItems().length; idx++) {
					totalLen = totalLen + (this.getItems()[idx].$()[0].clientWidth * 1.1);
				}

				return Math.floor((totalLen / this.getAnimationSpeed())/5);
				
			},

			__internal_calculate_width: function () {

				var totalLen = 0;

				for (var idx = 0; idx < this.getItems().length; idx++) {
					totalLen = totalLen + (this.getItems()[idx].$()[0].clientWidth * 1.1);
				}

				return totalLen;
			}

		});

		return ScrollHbox;

	}, true);