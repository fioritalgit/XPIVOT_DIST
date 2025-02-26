//----------------------------------------------------------------------
// Multi Sort  
// example over "home" array >>>>> homes.sort(sort_by('city', {name:'price', primer: parseInt, reverse: true}));
//----------------------------------------------------------------------

sap.ui.define(["sap/ui/base/ManagedObject"],
	function (ManagedObect, Log, MessageBox) {

		return ManagedObect.extend('it.fiorital.fioritalui5lib.utility.MultiSort', {

			metadata: {
				properties: {}
			},

			constructor: function (componentRef) {
				ManagedObect.call(this);
			},

			default_cmp: function (a, b) {
				if (a == b) return 0;
				return a < b ? -1 : 1;
			},

			getCmpFunc: function (primer, reverse) {
				var dfc = this.default_cmp, // closer in scope
					cmp = this.default_cmp;
				if (primer) {
					cmp = function (a, b) {
						return dfc(primer(a), primer(b));
					};
				}
				if (reverse) {
					return function (a, b) {
						return -1 * cmp(a, b);
					};
				}
				return cmp;
			},

			sort_by : function () {
				var fields = [],
					n_fields = arguments.length,
					field, name, reverse, cmp;

				// preprocess sorting options
				for (var i = 0; i < n_fields; i++) {
					field = arguments[i];
					if (typeof field === 'string') {
						name = field;
						cmp = this.default_cmp;
					} else {
						name = field.name;
						cmp = this.getCmpFunc(field.primer, field.reverse);
					}
					fields.push({
						name: name,
						cmp: cmp
					});
				}

				// final comparison function
				return function (A, B) {
					var a, b, name, result;
					for (var i = 0; i < n_fields; i++) {
						result = 0;
						field = fields[i];
						name = field.name;

						result = field.cmp(A[name], B[name]);
						if (result !== 0) break;
					}
					return result;
				};
			}

		});

	});