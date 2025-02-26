sap.ui.define([

	],
	function () {
		"use strict";

		var FioritalFastBoxRenderer = {
			apiVersion: 2
		};

		FioritalFastBoxRenderer.render = function (oRm, fastBox) {
			
			var aChildren = fastBox.getItems();

			oRm.openStart("div", fastBox);
			oRm.style("height", fastBox.getHeight());
			oRm.style("width", fastBox.getWidth());
			oRm.style("display","flex");
			oRm.style("flex-direction","column");
			oRm.openEnd();

			if (aChildren !== undefined && aChildren.length > 0){
			
				for (var i = 0; i < aChildren.length; i++) {
					oRm.renderControl(aChildren[i]);
				}
			
			}

			oRm.close("div");

		};

		return FioritalFastBoxRenderer;

	}, /* bExport= */ true);