sap.ui.define([
    "zshopfloor/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("zshopfloor.controller.PlannedOrders", {

        onInit: function () {
            this.getRouter().getRoute("plannedOrders").attachPatternMatched(this._onRouteMatched, this);
            this._sSearchValue     = "";
            this._sPlantFilter     = "";
            this._sOrderTypeFilter = "";
            // Local JSON model to hold ALL records fetched once
            this._aAllRecords      = null;

            // Local model that drives the table
            var oLocalModel = new JSONModel({ items: [] });
            this.getView().setModel(oLocalModel, "localModel");
        },

        _onRouteMatched: function () {
            var oUserModel = this.getOwnerComponent().getModel("userModel");
            if (!oUserModel.getProperty("/isLoggedIn")) {
                this.navTo("login", {}, true);
                return;
            }
            // Fetch all data from OData once on route match
            this._fetchAllData();
        },

        _getTable: function () {
            return this.getView().byId("idPlannedOrdersTable");
        },

        // ── Fetch ALL records from OData into memory ──────────────────────
        _fetchAllData: function () {
            var oODataModel = this.getOwnerComponent().getModel(); // default OData model
            var oView = this.getView();

            oODataModel.read("/PlannedOrdersSet", {
                success: function (oData) {
                    var aResults = oData.results || [];
                    this._aAllRecords = aResults;
                    this.getView().getModel("localModel").setProperty("/items", aResults);
                    this._updateCount(aResults.length, aResults.length);
                }.bind(this),
                error: function (oErr) {
                    MessageToast.show("Failed to load planned orders.");
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

                // 1. Plant filter (trim spaces, case-insensitive)
                if (sPlant !== "") {
                    var sRecordPlant = (oRecord.Werks || "").trim();
                    if (sRecordPlant !== sPlant) { return false; }
                }

                // 2. Order Type filter (Dispo field, trim spaces)
                if (sOrderType !== "") {
                    var sRecordType = (oRecord.Dispo || "").trim();
                    if (sRecordType !== sOrderType) { return false; }
                }

                // 3. Free-text search across key fields
                if (sSearch !== "") {
                    var sPlnum = (oRecord.Plnum || "").toLowerCase();
                    var sMatnr = (oRecord.Matnr || "").toLowerCase();
                    var sWerks = (oRecord.Werks || "").toLowerCase();
                    var sDispo = (oRecord.Dispo || "").toLowerCase();
                    var bMatch = sPlnum.indexOf(sSearch) !== -1 ||
                                 sMatnr.indexOf(sSearch) !== -1 ||
                                 sWerks.indexOf(sSearch) !== -1 ||
                                 sDispo.indexOf(sSearch) !== -1;
                    if (!bMatch) { return false; }
                }

                return true;
            });

            this.getView().getModel("localModel").setProperty("/items", aFiltered);
            this._updateCount(aFiltered.length, this._aAllRecords.length);

            var sMsg = "";
            if (sPlant !== "" || sOrderType !== "" || sSearch !== "") {
                sMsg = aFiltered.length === 0
                    ? "No records match the selected filters"
                    : aFiltered.length + " record(s) found";
                MessageToast.show(sMsg);
            }
        },

        _updateCount: function (iFiltered, iTotal) {
            var oCountText = this.getView().byId("idRecordCount");
            if (oCountText) {
                oCountText.setText(iFiltered + " of " + iTotal + " Planned Orders");
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
            var oSearch = oView.byId("idSearchField");
            var oPlant  = oView.byId("idPlantFilter");
            var oType   = oView.byId("idOrderTypeFilter");
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
            this._aAllRecords = null;
            this._sSearchValue     = "";
            this._sPlantFilter     = "";
            this._sOrderTypeFilter = "";

            var oView = this.getView();
            var oSearch = oView.byId("idSearchField");
            var oPlant  = oView.byId("idPlantFilter");
            var oType   = oView.byId("idOrderTypeFilter");
            if (oSearch) { oSearch.setValue(""); }
            if (oPlant)  { oPlant.setSelectedKey(""); }
            if (oType)   { oType.setSelectedKey(""); }

            this._fetchAllData();
            MessageToast.show("Table refreshed.");
        },

        // ── Row press ─────────────────────────────────────────────────────
        onRowPress: function (oEvent) {
            var oItem    = oEvent.getSource();
            var oContext = oItem.getBindingContext("localModel");
            if (!oContext) { return; }
            var oData = oContext.getObject();
            MessageBox.information(
                "Order No: "  + (oData.Plnum || "-") +
                "\nMaterial: " + (oData.Matnr || "-") +
                "\nPlant: "    + (oData.Werks || "-") +
                "\nType: "     + (oData.Dispo || "-") +
                "\nQuantity: " + (oData.Gsmng || "0") + " " + (oData.Meins || ""),
                { title: "Planned Order Details" }
            );
        },

        onUpdateFinished: function (oEvent) {
            var oFooter = this.getView().byId("idPlannedFooterText");
            if (oFooter) {
                oFooter.setText("Last updated: " + new Date().toLocaleTimeString());
            }
        },

        onSelectionChange: function () {},

        onNavBack: function () {
            this.navTo("dashboard");
        }
    });
});