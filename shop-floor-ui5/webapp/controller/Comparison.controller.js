sap.ui.define([
    "zshopfloor/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("zshopfloor.controller.Comparison", {
        onInit: function () {
            this.getView().setModel(new JSONModel({
                plantData: [],
                plannedOrders: [],
                productionOrders: [],
                plannedCount: 0,
                productionCount: 0
            }), "compModel");

            this.getRouter().getRoute("comparison").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            this._loadAndCompareData();
        },

        _loadAndCompareData: function () {
            var oModel = this.getModel();
            var that = this;

            // Ensure both collections are loaded
            Promise.all([
                this._fetchCollection(oModel, "/PlannedOrdersSet"),
                this._fetchCollection(oModel, "/ProductionOrdersSet")
            ]).then(function (aResults) {
                var aPlanned = aResults[0];
                var aProd = aResults[1];
                that._processPlantComparison(aPlanned, aProd);
            }).catch(function(oError) {
                console.error("Failed to load comparison data", oError);
            });
        },

        _fetchCollection: function (oModel, sPath) {
            return new Promise(function (resolve, reject) {
                oModel.read(sPath, {
                    success: function (oData) {
                        resolve(oData.results || []);
                    },
                    error: function (oError) {
                        reject(oError);
                    }
                });
            });
        },

        _processPlantComparison: function (aPlanned, aProd) {
            var mPlants = {};

            // Process Planned
            aPlanned.forEach(function (oItem) {
                var sPlant = oItem.Werks || "Unknown";
                if (!mPlants[sPlant]) {
                    mPlants[sPlant] = { plant: sPlant, planned: 0, production: 0, total: 0 };
                }
                mPlants[sPlant].planned++;
                mPlants[sPlant].total++;
            });

            // Process Production
            aProd.forEach(function (oItem) {
                var sPlant = oItem.Werks || "Unknown";
                if (!mPlants[sPlant]) {
                    mPlants[sPlant] = { plant: sPlant, planned: 0, production: 0, total: 0 };
                }
                mPlants[sPlant].production++;
                mPlants[sPlant].total++;
            });

            // Convert map to array
            var aTableData = Object.values(mPlants);
            // Sort by total descending
            aTableData.sort((a, b) => b.total - a.total);

            this.getView().getModel("compModel").setProperty("/plantData", aTableData);
            this.getView().getModel("compModel").setProperty("/plannedOrders", aPlanned);
            this.getView().getModel("compModel").setProperty("/productionOrders", aProd);
            this.getView().getModel("compModel").setProperty("/plannedCount", aPlanned.length);
            this.getView().getModel("compModel").setProperty("/productionCount", aProd.length);
            
            // Apply items to table
            this._updatePlantTable(aTableData);
        },

        _updatePlantTable: function(aData) {
            var oTable = this.byId("idPlantComparisonTable");
            oTable.removeAllItems();
            
            aData.forEach(function(oRow) {
                oTable.addItem(new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: oRow.plant }),
                        new sap.m.Text({ text: oRow.planned, textAlign: "Center" }),
                        new sap.m.Text({ text: oRow.production, textAlign: "Center" }),
                        new sap.m.ObjectNumber({ 
                            number: oRow.total,
                            emphasized: true,
                            state: oRow.total > 10 ? "Warning" : "Success",
                            textAlign: "Center"
                        })
                    ]
                }));
            });
        },

        onPlannedPress: function() {
            this.getRouter().navTo("plannedOrders");
        },

        onProdPress: function() {
            this.getRouter().navTo("productionOrders");
        }
    });
});
