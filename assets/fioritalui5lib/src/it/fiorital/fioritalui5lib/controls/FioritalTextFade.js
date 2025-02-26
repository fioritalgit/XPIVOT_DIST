sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite"
	],
	function (jQuery, XMLComposite) {

		var TextFader = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FioritalTextFade", {

			metadata: {
				properties: {
					textfase: {
						type: "string",
						defaultValue: ""
					},
					weight: {
						type: "sap.ui.core.CSSSize",
						defaultValue: "3em"
					},
					staytime: {
						type: "int",
						defaultValue: "6000"
					},
					width: {
						type: "sap.ui.core.CSSSize",
						defaultValue: "100%" 
					}
				},
				events: {
					onAnimationDone: {
						parameters: {}
					}

				}

			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			fadeText: function (txt,icon) {
				
				this.selectedIcon = icon;
				
				$('#' + this.getId()).fadeOut({
					complete: function (evt) {

						//---> now set the text and fadeId
						this.byId('fadingtext').setText(txt);
						
						if (this.selectedIcon !== undefined){
							this.byId('fadingIcon').setSrc(this.selectedIcon);
						}else{
							this.byId('fadingIcon').setSrc('sap-icon://sys-enter-2');
						}
						
						this.byId('fadingIcon').setVisible(true);

						$('#' + this.getId()).fadeIn({
							complete: function (evt) {
								setTimeout(function(){
										$('#' + this.getId()).fadeOut({
											complete: function(evt){
												
												this.byId('fadingtext').setText();
												this.byId('fadingIcon').setVisible(false);
												
											}.bind(this)
										});
									}.bind(this), this.getStaytime());
							}.bind(this)

						});

					}.bind(this)
				});

			}

		});

		return TextFader;

	}, true);