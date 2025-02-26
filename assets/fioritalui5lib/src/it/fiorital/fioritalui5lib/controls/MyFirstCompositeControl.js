/*
 *  H.T. 19/02/2019 - Sample composite component 
 */

/*
   SAMPLE USAGE
   
  <!-- UI5 lib XML namespace declaration -->
  <mvc:View controllerName="it.fiorital.FioritalApp.controller.SampleView" ... xmlns:flib="it.fiorital.fioritalui5lib">
  ...
  <!-- Control usage -->
  <flib:controls.MyFirstCompositeControl id="compositeComponent"></flib:controls.MyFirstCompositeControl>
   
 */
sap.ui.define(["sap/ui/core/XMLComposite"], function(XMLComposite) {
	var MyFirstCompositeControl = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.MyFirstCompositeControl", {
		metadata: {
			properties: {
				label: "string",
				value: "string"
			},
			events: {
				help: {}
			}
		},
		handleHelp: function() {
			this.fireEvent("help", {});
		}
	});
	return MyFirstCompositeControl;
}, true);