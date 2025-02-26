sap.ui.define([
	"sap/m/IconTabBar"
], function (iconTab) {
	"use strict";
	return iconTab.extend("it.fiorital.flex5app.controls.FioritalIconTabBar", {

		metadata: {
			properties: {

			},
			events: {
				press: {
					parameters: {
						text: {
							type: "string"
						}
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			iconTab.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {

			//--> attach righr click event for items
			this.getItems().forEach(function (sitem) {
				if (sitem.getMetadata().getName() === 'it.fiorital.flex5app.controls.FioritalIconTabFilter') {

					sitem.$().off();
					sitem.$().contextmenu(sitem._clickRight.bind(sitem));

					if (sitem.getNoBackground() === true) {
						sitem.$().find('[role="presentation"]').addClass('iconTabFilterNoBack');
					}
				}
			});

			if (this.alreadyInitiated === undefined) {

				//--> override standar delegate
				var el = sap.ui.getCore().byId(this.$().children('[role="navigation"]').attr('id'));
				el.___ontouchend = el.ontouchend;

				el.ontouchend = function (eEvent) {
					var tabItemId = eEvent.srcControl.getId().replace(/-icon$/, "");
					var tabItem = sap.ui.getCore().byId(tabItemId);

					if (tabItem.getMetadata().getName() === 'it.fiorital.flex5app.controls.FioritalIconTabFilter') {

						if (tabItem.inRclickState === true) {
							tabItem.inRclickState = false;
							eEvent.preventDefault();
							eEvent.stopPropagation();
							return;
						}

						tabItem._fireEventPress(); //<-- delegate event

						if (tabItem.getAvoidSelect()) {
							eEvent.preventDefault();
							eEvent.stopPropagation();
							return;
						}

					}

					this.___ontouchend(eEvent);
				}.bind(el);

				this.alreadyInitiated = true;

			}

		},

		_clickRight: function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			this.fireEvent("pressRight", {
				text: this.getText()
			});
		},

		_toggleExpandCollapse: function (bExpanded) {

			var $content = this.$("content");
			var oSelectedItem = this._getIconTabHeader().oSelectedItem;

			// use inverted control state if not specified by parameter
			if (bExpanded === undefined) {
				bExpanded = !this.getExpanded();
			}

			// show animation (keep track of active animations to avoid flickering of controls)
			this._iAnimationCounter = (this._iAnimationCounter === undefined ? 1 : ++this._iAnimationCounter);
			if (bExpanded) { // expanding
				if (oSelectedItem) {
					if (this.$("content").children().length === 0) { //content is not rendered yet
						//if item has own content, this content is shown
						var oSelectedItemContent = oSelectedItem.getContent();
						if (oSelectedItemContent.length > 0) {
							this._rerenderContent(oSelectedItemContent);
							//if item has not own content, general content of the icontabbar is shown
						} else {
							this._rerenderContent(this.getContent());
						}
					}
					this.onTransitionEnded(bExpanded);

					this.$("containerContent").toggleClass("sapMITBContentClosed", !bExpanded);
				}
			} else { // collapsing
				this.$("contentArrow").hide();
				this.onTransitionEnded(bExpanded);
			}

			// update property (if we have a selected item) and fire event
			if (!bExpanded || oSelectedItem) {
				this.setProperty("expanded", bExpanded, true);
			}
			this.fireExpand({
				expand: bExpanded,
				collapse: !bExpanded
			});

			return this;

		},

		renderer: "sap.m.IconTabBarRenderer" //<--- set standard renderer!

	});
});