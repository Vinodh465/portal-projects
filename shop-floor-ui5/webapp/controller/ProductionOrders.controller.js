sap.ui.define([
    "zshopfloor/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("zshopfloor.controller.ProductionOrders", {

        onInit: function () {
            this.getRouter().getRoute("productionOrders").attachPatternMatched(this._onRouteMatched, this);

            this._sSearchValue     = "";
            this._sPlantFilter     = "";
            this._sOrderTypeFilter = "";
            this._aAllRecords      = null;

            // Local model drives the table
            this.getView().setModel(new JSONModel({ items: [] }), "localModel");
            // Detail model for dialog
            this.getView().setModel(new JSONModel({}), "detailModel");
        },

        _onRouteMatched: function () {
            var oUserModel = this.getOwnerComponent().getModel("userModel");
            if (!oUserModel.getProperty("/isLoggedIn")) {
                this.navTo("login", {}, true);
                return;
            }
            this._fetchAllData();
        },

        _getTable: function () {
            return this.getView().byId("idProductionOrdersTable");
        },

        // ── Fetch ALL records from OData into memory ──────────────────────
        _fetchAllData: function () {
            var oODataModel = this.getOwnerComponent().getModel();

            oODataModel.read("/ProductionOrdersSet", {
                success: function (oData) {
                    var aResults = oData.results || [];
                    this._aAllRecords = aResults;
                    this.getView().getModel("localModel").setProperty("/items", aResults);
                    this._updateCount(aResults.length, aResults.length);
                }.bind(this),
                error: function () {
                    MessageToast.show("Failed to load production orders.");
                }
            });
        },

        // ── Core manual filter ────────────────────────────────────────────
        _applyFilters: function () {
            if (!this._aAllRecords) { return; }

            var sSearch    = (this._sSearchValue    || "").trim().toLowerCase();
            var sPlant     = (this._sPlantFilter    || "").trim();
            var sOrderType = (this._sOrderTypeFilter || "").trim();

            var aFiltered = this._aAllRecords.filter(function (oRecord) {

                // 1. Plant filter
                if (sPlant !== "") {
                    if ((oRecord.Werks || "").trim() !== sPlant) { return false; }
                }

                // 2. Order type filter (Auart field)
                if (sOrderType !== "") {
                    if ((oRecord.Auart || "").trim() !== sOrderType) { return false; }
                }

                // 3. Free-text search
                if (sSearch !== "") {
                    var sAufnr = (oRecord.Aufnr || "").toLowerCase();
                    var sMatnr = (oRecord.Matnr || "").toLowerCase();
                    var sWerks = (oRecord.Werks || "").toLowerCase();
                    var sAuart = (oRecord.Auart || "").toLowerCase();
                    var bMatch = sAufnr.indexOf(sSearch) !== -1 ||
                                 sMatnr.indexOf(sSearch) !== -1 ||
                                 sWerks.indexOf(sSearch) !== -1 ||
                                 sAuart.indexOf(sSearch) !== -1;
                    if (!bMatch) { return false; }
                }

                return true;
            });

            this.getView().getModel("localModel").setProperty("/items", aFiltered);
            this._updateCount(aFiltered.length, this._aAllRecords.length);

            if (sPlant !== "" || sOrderType !== "" || sSearch !== "") {
                MessageToast.show(
                    aFiltered.length === 0
                        ? "No records match the selected filters"
                        : aFiltered.length + " record(s) found"
                );
            }
        },

        _updateCount: function (iFiltered, iTotal) {
            var oCount = this.getView().byId("idProdRecordCount");
            if (oCount) {
                oCount.setText(iFiltered + " of " + iTotal + " Production Orders");
            }
        },

        // ── Search ────────────────────────────────────────────────────────
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            if (sQuery === undefined || sQuery === null) {
                sQuery = oEvent.getSource().getValue ? oEvent.getSource().getValue() : "";
            }
            this._sSearchValue = sQuery || "";
            this._applyFilters();
        },

        onSearchLive: function (oEvent) {
            this._sSearchValue = oEvent.getParameter("newValue") || "";
            this._applyFilters();
        },

        // ── Plant dropdown ────────────────────────────────────────────────
        onPlantFilterChange: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            this._sPlantFilter = oItem ? oItem.getKey() : "";
            this._applyFilters();
        },

        // ── Order Type dropdown ───────────────────────────────────────────
        onOrderTypeFilterChange: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            this._sOrderTypeFilter = oItem ? oItem.getKey() : "";
            this._applyFilters();
        },

        // ── Clear ─────────────────────────────────────────────────────────
        onClearFilters: function () {
            this._sSearchValue     = "";
            this._sPlantFilter     = "";
            this._sOrderTypeFilter = "";

            var oView = this.getView();
            var oSearch = oView.byId("idProdSearchField");
            var oPlant  = oView.byId("idProdPlantFilter");
            var oType   = oView.byId("idProdOrderTypeFilter");
            if (oSearch) { oSearch.setValue(""); }
            if (oPlant)  { oPlant.setSelectedKey(""); }
            if (oType)   { oType.setSelectedKey(""); }

            if (this._aAllRecords) {
                this.getView().getModel("localModel").setProperty("/items", this._aAllRecords);
                this._updateCount(this._aAllRecords.length, this._aAllRecords.length);
            }
            MessageToast.show("Filters cleared.");
        },

        // ── Refresh ───────────────────────────────────────────────────────
        onRefresh: function () {
            this._aAllRecords      = null;
            this._sSearchValue     = "";
            this._sPlantFilter     = "";
            this._sOrderTypeFilter = "";

            var oView = this.getView();
            var oSearch = oView.byId("idProdSearchField");
            var oPlant  = oView.byId("idProdPlantFilter");
            var oType   = oView.byId("idProdOrderTypeFilter");
            if (oSearch) { oSearch.setValue(""); }
            if (oPlant)  { oPlant.setSelectedKey(""); }
            if (oType)   { oType.setSelectedKey(""); }

            this._fetchAllData();
            MessageToast.show("Table refreshed.");
        },

        // ── Row press → dialog ────────────────────────────────────────────
        onRowPress: function (oEvent) {
            var oSource  = oEvent.getSource();
            var oContext = oSource.getBindingContext("localModel");
            if (!oContext) { return; }
            this.getView().getModel("detailModel").setData(oContext.getObject());
            var oDialog = this.getView().byId("idOrderDetailDialog");
            if (oDialog) { oDialog.open(); }
        },

        onCloseDialog: function () {
            var oDialog = this.getView().byId("idOrderDetailDialog");
            if (oDialog) { oDialog.close(); }
        },

        onUpdateFinished: function () {
            var oFooter = this.getView().byId("idProdFooterText");
            if (oFooter) {
                oFooter.setText("Last updated: " + new Date().toLocaleTimeString());
            }
        },

        onSelectionChange: function () {},

        onNavBack: function () {
            this.navTo("dashboard");
        },

        onLogout: function () {
            this.getOwnerComponent().getModel("userModel").setProperty("/isLoggedIn", false);
            this.navTo("login");
        }
    });
});