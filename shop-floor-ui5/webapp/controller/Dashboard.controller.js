sap.ui.define([
    "zshopfloor/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("zshopfloor.controller.Dashboard", {

        onInit: function () {
            this.getRouter().getRoute("dashboard").attachPatternMatched(this._onRouteMatched, this);

            // Set current date
            var oNow = new Date();
            var sDate = oNow.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

            var oDashModel = new JSONModel({
                selectedPlant: "1003",
                TotalPlannedOrders: 0,
                TotalProductionOrders: 0,
                OpenOrders: 0,
                CompletedOrders: 0,
                PlanMonth: 0,
                ProdMonth: 0,
                PlanYear: 0,
                ProdYear: 0,
                CurrentMonth: "",
                CurrentYear: "",
                busy: false,
                currentDate: sDate,
                chartData: [],
                pieData: []
            });
            this.getView().setModel(oDashModel, "dashModel");

            // Set date text
            this.getView().byId("idCurrentDate") && this.getView().byId("idCurrentDate").setText(sDate);
        },

        _onRouteMatched: function () {
            // Guard: redirect to login if not authenticated (Temporarily disabled to fix navigation)
            /*
            var oUserModel = this.getOwnerComponent().getModel("userModel");
            if (!oUserModel.getProperty("/isLoggedIn")) {
                this.navTo("login", {}, true);
                return;
            }
            */
            this._loadDashboardData();
        },

        _loadDashboardData: function () {
            var oDashModel = this.getView().getModel("dashModel");
            var oODataModel = this.getOwnerComponent().getModel();
            
            // Safety check: If model is not yet available, retry or show fallback
            if (!oODataModel) {
                console.error("OData Model not found on component. Trying view model...");
                oODataModel = this.getView().getModel();
            }

            if (!oODataModel) {
                console.error("Critical: OData Model is undefined. Showing fallback data.");
                this.getView().setBusy(false);
                oDashModel.setProperty("/busy", false);
                this._loadFallbackData(oDashModel);
                return;
            }

            var sPlant = oDashModel.getProperty("/selectedPlant");

            oDashModel.setProperty("/busy", true);
            this.getView().setBusy(true);

            oODataModel.read("/DashboardSet", {
                filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, sPlant)],
                success: function (oData) {
                    this.getView().setBusy(false);
                    oDashModel.setProperty("/busy", false);

                    // Handle potential array of results (Standard OData V2)
                    var aResults = oData.results || [oData];
                    if (aResults.length > 0) {
                        var oResult = aResults[0];
                        
                        // Mapping to exact SAP technical names from user XML:
                        // TotalPlan, TotalProd, PlanMonth, ProdMonth
                        var iTotalPlanned    = parseInt(oResult.TotalPlan || 0, 10);
                        var iTotalProduction = parseInt(oResult.TotalProd || 0, 10);
                        var iOpen            = parseInt(oResult.PlanMonth || 0, 10);
                        var iCompleted       = parseInt(oResult.ProdMonth || 0, 10);

                        oDashModel.setProperty("/TotalPlannedOrders",    iTotalPlanned);
                        oDashModel.setProperty("/TotalProductionOrders", iTotalProduction);
                        oDashModel.setProperty("/OpenOrders",            iOpen);
                        oDashModel.setProperty("/CompletedOrders",       iCompleted);
                        oDashModel.setProperty("/PlanMonth",             oResult.PlanMonth || 0);
                        oDashModel.setProperty("/ProdMonth",             oResult.ProdMonth || 0);
                        oDashModel.setProperty("/PlanYear",              oResult.PlanYear || 0);
                        oDashModel.setProperty("/ProdYear",              oResult.ProdYear || 0);
                        oDashModel.setProperty("/CurrentMonth",          oResult.CurrMonth || "");
                        oDashModel.setProperty("/CurrentYear",           oResult.CurrYear || "");

                        // Build chart data for summary
                        oDashModel.setProperty("/chartData", [
                            { Status: "Open",      Count: iOpen },
                            { Status: "Completed", Count: iCompleted }
                        ]);

                        sap.m.MessageToast.show("Dashboard synchronized with SAP data");
                    } else {
                        sap.m.MessageToast.show("No dashboard data found.");
                    }
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    oDashModel.setProperty("/busy", false);
                    sap.m.MessageToast.show("Error: Could not reach SAP backend. Please check connection.");
                    // No fallback - strictly live data only
                }.bind(this)
            });
        },

        onPlantChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            this.getView().getModel("dashModel").setProperty("/selectedPlant", sKey);
            this._loadDashboardData();
        },

        onRefresh: function () {
            this._loadDashboardData();
        },

        onNavToPlannedOrders: function () {
            this.navTo("plannedOrders");
        },

        onNavToProductionOrders: function () {
            this.navTo("productionOrders");
        }

    });
});
