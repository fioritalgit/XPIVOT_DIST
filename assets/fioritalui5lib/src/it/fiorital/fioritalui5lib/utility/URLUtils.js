//----------------------------------------------------------------------
// H.T. 08-02-2019 - URL helper functions
//----------------------------------------------------------------------

sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log", "sap/m/MessageBox"],
	function (ManagedObect, Log, MessageBox) {

		return ManagedObect.extend('it.fiorital.fioritalui5lib.utility.URLUtils', {

			metadata: {
				properties: {}
			},

			constructor: function (componentRef) {
				ManagedObect.call(this);
			},

			getUrlParsAsArray: function () {
				var pars = {};
				var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
					pars[key] = value;
				});
				return pars;
			},

			getUrlPar: function (parameter, defaultvalue) {
				var urlparameter = defaultvalue;
				if (window.location.href.indexOf(parameter) > -1) {
					urlparameter = this.getUrlParsAsArray()[parameter];
				}
				return urlparameter;
			}

		});

	});