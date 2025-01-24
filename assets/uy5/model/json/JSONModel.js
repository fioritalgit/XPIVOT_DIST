sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/FilterProcessor",
    "sap/ui/model/SorterProcessor",
    "it/fiorital/fioritalui5lib/framework/uy5/model/json/JSONListBinding",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
  ],
  function (
    jsonModel,
    FilterProcessor,
    SorterProcessor,
    JSONListBindingExt,
    Filter,
    Sorter
  ) {
    "use strict";
    return jsonModel.extend(
      "it.fiorital.fioritalui5lib.framework.model.json.JSONModel",
      {
        metadata: {
          events: {
            loopEnd: {
              enablePreventDefault: true,
            },
          },
        },

        dataReceived: false,
        lastDataReceivedTS: undefined,

        refresh: function (uirefresh) {
          if (
            this.parent !== undefined &&
            this.parent["WRAPPER"] !== undefined
          ) {
            for (
              var sm = 0;
              sm <= this.parent["WRAPPER"].SubModels.length - 1;
              sm++
            ) {
              this.parent["WRAPPER"].SubModels[sm].JSMODEL.refresh(uirefresh);
            }
          }
          return sap.ui.model.json.JSONModel.prototype.refresh.call(
            this,
            uirefresh
          ); // <-- like super()
        },

        getData: function () {
          //   debugger;
          if (this._aFilters !== undefined && this._aFilters.length !== 0) {
            var filtered = this.FilterProcessor.apply(
              this._oData,
              [this._aFilters],
              function (arr, fld) {
                return arr[fld];
              }
            );

            if (
              this._aSorterKeys !== undefined &&
              this._aSorterKeys.length !== 0
            ) {
              if (Array.isArray(this._aSorterKeys)) {
                var keys = this._aSorterKeys;
              } else {
                var keys = [this._aSorterKeys];
              }

              return localData.sort(this.dynamicSortMultiple(keys));
            } else {
              return filtered;
            }
          } else {
            var localData = jsonModel.prototype.getData.apply(this, arguments);
            if (
              this._aSorterKeys !== undefined &&
              this._aSorterKeys.length !== 0
            ) {
              if (Array.isArray(this._aSorterKeys)) {
                var keys = this._aSorterKeys;
              } else {
                var keys = [this._aSorterKeys];
              }

              return localData.sort(this.dynamicSortMultiple(keys));
            } else {
              return localData;
            }
          }
        },

        attachOnLoopEnd: function (callback) {
          this._onEndLoopCallback = callback.bind(this);
        },

        attachOnNextPage: function (callback) {
          this._onNextPageCallback = callback.bind(this);
        },

        attachOnPrevPage: function (callback) {
          this._onPrevPageCallback = callback.bind(this);
        },

        setFilters: function (filters) {
          if (Array.isArray(filters)) {
            this._aFilters = filters;
          } else {
            this._aFilters = [];
            this._aFilters.push(filters);
          }
        },

        addFilters: function (filters, andCondition) {
          if (Array.isArray(filters)) {
            //--> append filters
            var flts = [];
            filters.forEach(function (sf) {
              flts.push(new Filter(sf));
            });
            if (andCondition === undefined) {
              andCondition = true;
            }
            this._aFilters = new Filter({ filters: flts, and: andCondition });
          } else {
            this._aFilters = new Filter(filters);
          }
        },

        clearFilters: function () {
          this._aFilters = [];
        },

        addSortersKeys: function (sortersKeys) {
          // Keys with the - sign  = DESCENDING ORDER
          // Keys without any sign = ASCENDING ORDER
          if (Array.isArray(sortersKeys)) {
            //--> append sorters
            var srtsKeys = [];
            sortersKeys.forEach(function (ss) {
              srtsKeys.push(ss);
            });
            this._aSorterKeys = srtsKeys;
          } else {
            this._aSorterKeys = sortersKeys;
          }
        },

        // ************** //
        // DYNAMIC SORTER //
        // ************** //
        dynamicSort: function (property) {
          var sortOrder = 1;
          if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
          }
          return function (a, b) {
            /*
             * next line works with strings and numbers,
             * and you may want to customize it to your needs
             */
            var result =
              a[property] < b[property]
                ? -1
                : a[property] > b[property]
                ? 1
                : 0;
            return result * sortOrder;
          };
        },

        dynamicSortMultiple: function (props) {
          return function (obj1, obj2) {
            var i = 0;
            var result = 0;
            var numberOfProperties = props.length;
            /*
             * try getting a different result from 0 (equal)
             * as long as we have extra properties to compare
             */
            while (result === 0 && i < numberOfProperties) {
              result = this.dynamicSort(props[i])(obj1, obj2);
              i++;
            }
            return result;
          }.bind(this);
        },

        constructor: function (data, parent, paginationDefault, filterString) {
          this.parent = parent;

          this._aFilters = [];
          if (filterString !== undefined && filterString !== "") {
            var fltData = filterString.split(";");
            this._aFilters = new sap.ui.model.Filter(
              fltData[0],
              eval(fltData[1]),
              fltData[2]
            );
          }

          this.FilterProcessor = FilterProcessor;
          this.SorterProcessor = SorterProcessor;

          //--> set dafeult pagination if provided
          if (paginationDefault !== undefined) {
            this._ListPageSize = paginationDefault;
          }

          jsonModel.call(this, data);

          //---> define custom oData property
          var fct = new Function("return this._INTERNAL_getOdata();");
          var fctSet = new Function(
            "newValue",
            "this._INTERNAL_setOdata(newValue);"
          );

          Object.defineProperty(this, "oData", {
            get: fct,
            set: fctSet,
          });
        },

        _INTERNAL_setOdata: function (newData) {
          this._oData = newData;
        },

        _INTERNAL_getOdata: function () {
          if (this._aFilters !== undefined && this._aFilters.length !== 0) {
            return this.FilterProcessor.apply(
              this._oData,
              this._aFilters,
              function (arr, fld) {
                return arr[fld];
              }
            );
          } else {
            return this._oData;
          }
        },

        bindList: function (sPath, oContext, aSorters, aFilters, mParameters) {
          var oBinding = new JSONListBindingExt(
            this,
            sPath,
            oContext,
            aSorters,
            aFilters,
            mParameters
          );
          return oBinding;
        },

        //---> internal indexes for pagination
        ListStart: 0,
        ListEnd: -1,
        _ListPageSize: 0,
        _PaginationAutoTime: -1,

        //---> pagination methods
        setPagination: function (pageSize, avoidRefresh) {
          this._ListPageSize = pageSize;

          if (avoidRefresh !== undefined && avoidRefresh !== true) {
            this.refresh(true);
          }
        },

        setPaginationDisplayControl: function (textControl) {
          this._PaginationDisplayControl = textControl;
        },

        setPaginationAutoTime: function (timeMilliSeconds) {
          this._PaginationAutoTime = timeMilliSeconds;
        },

        startAutoPagination: function (timeMilliSeconds, autoStopAtEnd) {
          if (timeMilliSeconds !== undefined) {
            this.setPaginationAutoTime(timeMilliSeconds);
          }

          if (autoStopAtEnd !== undefined) {
            this._autoStopAtEnd = autoStopAtEnd;
          } else {
            this._autoStopAtEnd = false;
          }

          //---> function to react to timer for autoPagination
          var fctAutoPage = function () {
            this.nextPage();
          };

          var fctAutoPageBound = fctAutoPage.bind(this);
          this._AutoPagingTimer = setInterval(
            fctAutoPageBound,
            this._PaginationAutoTime
          );

          //---> refresh the pagin indication (if bound)
          if (this._PaginationDisplayControl !== undefined) {
            var lbl = sap.ui.getCore().byId(this._PaginationDisplayControl);
            lbl.setText(
              this.ListStart +
                " > " +
                parseInt(this.ListStart + this._ListPageSize)
            );
          }
        },

        stopAutoPagination: function () {
          if (this._AutoPagingTimer !== undefined) {
            clearInterval(this._AutoPagingTimer);
          }
        },

        getStartPageIndex: function () {
          return this.ListStart;
        },

        getEndPageIndex: function () {
          return this.ListEnd;
        },

        getPaginationSize: function () {
          return this._ListPageSize;
        },

        prevPage: function () {
          var nextIdx = this.ListStart - this._ListPageSize;

          if (nextIdx < 0) {
            this.ListStart = this.getData().length / this._ListPageSize;
            this.ListStart = Math.floor(this.ListStart);
            this.ListStart = this.ListStart * this._ListPageSize;

            //--> BUG Fixes:
            //--> 1) List paging with page size 1 fails!!
            //--> 2) Load previous page when model has been emptied ( contains 0 records )
            //       causes strange behaviour on FioritalList: it displays some rows with
            //       empty contents instead of no rows.
            //if ( this.getData().length % this._ListPageSize === 0 ) {
            if (
              this.getData().length > 0 &&
              this.ListStart === this.getData().length
            ) {
              this.ListStart = this.ListStart - this._ListPageSize;
            }

            //---> refresh the page indication (if bound)
            if (this._PaginationDisplayControl !== undefined) {
              var lbl = sap.ui.getCore().byId(this._PaginationDisplayControl);
              lbl.setText(
                this.ListStart +
                  " > " +
                  parseInt(this.ListStart + this._ListPageSize)
              );
            }

            //---> fire next page (if bound)
            if (this._onPrevPageCallback !== undefined) {
              this._onPrevPageCallback(this.ListStart);
            }
          } else {
            //---> back one page

            this.ListStart = this.ListStart - this._ListPageSize;

            //---> refresh the pagin indication (if bound)
            if (this._PaginationDisplayControl !== undefined) {
              var lbl = sap.ui.getCore().byId(this._PaginationDisplayControl);
              lbl.setText(
                this.ListStart +
                  " > " +
                  parseInt(this.ListStart + this._ListPageSize)
              );
            }

            //---> fire next page (if bound)
            if (this._onPrevPageCallback !== undefined) {
              this._onPrevPageCallback(this.ListStart);
            }
          }

          this.refresh(true); //<--- force UI refresh
        },

        nextPage: function () {
          var nextIdx = this.ListStart + this._ListPageSize;
          var lbl;

          if (nextIdx > this.getData().length - 1) {
            this.ListStart = 0;

            //---> refresh the pagin indication (if bound)
            if (this._PaginationDisplayControl !== undefined) {
              lbl = sap.ui.getCore().byId(this._PaginationDisplayControl);
              lbl.setText(
                this.ListStart +
                  " > " +
                  parseInt(this.ListStart + this._ListPageSize)
              );
            }

            //---> fire next page (if bound)
            if (this._onNextPageCallback !== undefined) {
              this._onNextPageCallback(this.ListStart);
            }

            //---> fire end loop event (if bound)
            if (this._onEndLoopCallback !== undefined) {
              this._onEndLoopCallback();
            }

            //---> if was requested stop the loop
            if (this._autoStopAtEnd === true) {
              this.stopAutoPagination();
            }
          } else {
            this.ListStart = this.ListStart + this._ListPageSize;

            //---> refresh the pagin indication (if bound)
            if (this._PaginationDisplayControl !== undefined) {
              lbl = sap.ui.getCore().byId(this._PaginationDisplayControl);
              lbl.setText(
                this.ListStart +
                  " > " +
                  parseInt(this.ListStart + this._ListPageSize)
              );
            }

            //---> fire next page (if bound)
            if (this._onNextPageCallback !== undefined) {
              this._onNextPageCallback(this.ListStart);
            }
          }

          this.refresh(true); //<--- force UI refresh
        },
      }
    );
  }
);
