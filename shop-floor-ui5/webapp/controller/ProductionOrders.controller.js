sap.ui.define([
    "zshopfloor/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, Sorter, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("zshopfloor.controller.ProductionOrders", {

        onInit: function () {
            this.getRouter().getRoute("productionOrders").attachPatternMatched(this._onRouteMatched, this);

            var oProdModel = new JSONModel({
                totalCount: "0",
                crtdCount:  "0",
                relCount:   "0",
                prelCount:  "0",
                tecoCount:  "0",
                clsdCount:  "0",
                hasSelection: false
            });
            this.getView().setModel(oProdModel, "prodModel");

            var oDetailModel = new JSONModel({});
            this.getView().setModel(oDetailModel, "detailModel");

            this._sActiveTabKey   = "ALL";
            this._sSearchValue    = "";
            this._oCurrentSorter  = null;
        },

        _onRouteMatched: function () {
            var oUserModel = this.getOwnerComponent().getModel("userModel");
            if (!oUserModel.getProperty("/isLoggedIn")) {
                this.navTo("login", {}, true);
                return;
            }
        },

        _getTable: function () {
            return this.getView().byId("idProductionOrdersTable");
        },

        _applyFilters: function () {
            var aFilters = [];
            var sVal = (this._sSearchValue || "").trim();

            if (sVal !== "") {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("Aufnr", FilterOperator.Contains, sVal),
                        new Filter("Matnr", FilterOperator.Contains, sVal),
                        new Filter("Werks", FilterOperator.Contains, sVal)
                    ],
                    and: false
                }));
            }

            var oTable = this._getTable();
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                oBinding.filter(aFilters);
                if (sVal !== "") {
                    MessageToast.show("Searching for: " + sVal);
                }
            }
        },

        onSearch: function (oEvent) {
            this._sSearchValue = oEvent.getParameter("query") || "";
            this._applyFilters();
        },

        onSearchLive: function (oEvent) {
            var sVal = oEvent.getParameter("newValue") || "";
            if (sVal.length === 0) {
                this._sSearchValue = "";
                this._applyFilters();
            }
        },

        onUpdateFinished: function (oEvent) {
            var iTotal  = oEvent.getParameter("total");
            var iActual = oEvent.getParameter("actual");
            var oCount  = this.getView().byId("idProdRecordCount");
            if (oCount) {
                oCount.setText(iActual + " of " + iTotal + " Production Orders");
            }
            var oFooter = this.getView().byId("idProdFooterText");
            if (oFooter) {
                oFooter.setText("Last updated: " + new Date().toLocaleTimeString());
            }
            this.getView().getModel("prodModel").setProperty("/totalCount", String(iTotal));
        },

        onSelectionChange: function (oEvent) {
            var aSelected = this._getTable().getSelectedItems();
            this.getView().getModel("prodModel").setProperty("/hasSelection", aSelected.length > 0);

            if (aSelected.length > 0) {
                var oCtx  = aSelected[0].getBindingContext();
                var oData = oCtx ? oCtx.getObject() : {};
                this.getView().getModel("detailModel").setData(oData);
            }
        },

        onRowPress: function (oEvent) {
            var oSource  = oEvent.getSource();
            var oContext = oSource.getBindingContext() || (oSource.getParent && oSource.getParent().getBindingContext());
            if (!oContext) return;
            var oData = oContext.getObject();
            this.getView().getModel("detailModel").setData(oData);
            this._openDialog();
        },

        _openDialog: function () {
            var oDialog = this.getView().byId("idOrderDetailDialog");
            if (oDialog) { oDialog.open(); }
        },

        onCloseDialog: function () {
            var oDialog = this.getView().byId("idOrderDetailDialog");
            if (oDialog) { oDialog.close(); }
        },


        onRefresh: function () {
            this._oCurrentSorter = null;
            this._bSortDesc = false;
            var oBinding = this._getTable().getBinding("items");
            if (oBinding) { 
                oBinding.sort(null);
                oBinding.refresh(); 
            }
            MessageToast.show("Sorting reset and table refreshed.");
        },

        onNavBack: function () {
            this.navTo("dashboard");
        },

        onLogout: function() {
            this.getOwnerComponent().getModel("userModel").setProperty("/isLoggedIn", false);
            this.navTo("login");
        }

    });
});
