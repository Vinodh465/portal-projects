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

    return BaseController.extend("zshopfloor.controller.PlannedOrders", {

        onInit: function () {
            this.getRouter().getRoute("plannedOrders").attachPatternMatched(this._onRouteMatched, this);
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
            return this.getView().byId("idPlannedOrdersTable");
        },

        _applyBindingFilters: function () {
            var oTable   = this._getTable();
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter(this._aCurrentFilters);
                oBinding.sort(this._oCurrentSorter);
            }
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            if (!sQuery && oEvent.getSource().getValue) {
                sQuery = oEvent.getSource().getValue();
            }
            this._buildAndApplyFilters(sQuery || "");
        },

        onSearchLive: function (oEvent) {
            var sVal = oEvent.getParameter("newValue") || "";
            // Optionally auto-search on live change if you want, 
            // but for now we'll just handle the clear action
            if (sVal === "") {
                this._buildAndApplyFilters("");
            }
        },

        _buildAndApplyFilters: function (sSearch) {
            var aFilters = [];
            var sVal = (sSearch || "").trim();

            if (sVal !== "") {
                var aSubFilters = [
                    new Filter("Plnum", FilterOperator.Contains, sVal),
                    new Filter("Matnr", FilterOperator.Contains, sVal),
                    new Filter("Werks", FilterOperator.Contains, sVal),
                    new Filter("Dispo", FilterOperator.Contains, sVal)
                ];

                // If it looks like a number, try with leading zeros (common in SAP)
                if (/^\d+$/.test(sVal) && sVal.length < 10) {
                    var sPadded = sVal.padStart(10, '0');
                    aSubFilters.push(new Filter("Plnum", FilterOperator.Contains, sPadded));
                    aSubFilters.push(new Filter("Matnr", FilterOperator.Contains, sPadded));
                }

                aFilters.push(new Filter({
                    filters: aSubFilters,
                    and: false
                }));
            }

            var oTable = this._getTable();
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                // Apply filter to the binding
                oBinding.filter(aFilters);
                
                if (sVal !== "") {
                    // Small delay to let the binding update its length
                    setTimeout(function() {
                        var iCount = oBinding.getLength();
                        if (iCount === 0) {
                            MessageToast.show("No records match '" + sVal + "'");
                        } else {
                            MessageToast.show("Found " + iCount + " matching records");
                        }
                    }.bind(this), 500);
                }
            }
        },



        onClearFilters: function () {
            this.getView().byId("idSearchField") && this.getView().byId("idSearchField").setValue("");
            this.getView().byId("idStatusFilter") && this.getView().byId("idStatusFilter").setSelectedKey("");
            this._aCurrentFilters = [];
            var oBinding = this._getTable().getBinding("items");
            if (oBinding) { oBinding.filter([]); }
            MessageToast.show("Filters cleared.");
        },

        onUpdateFinished: function (oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            var iActual     = oEvent.getParameter("actual");
            var oCountText  = this.getView().byId("idRecordCount");
            if (oCountText) {
                oCountText.setText(
                    iActual + " of " + iTotalItems + " Planned Orders"
                );
            }
            var oFooter = this.getView().byId("idPlannedFooterText");
            if (oFooter) {
                oFooter.setText("Last updated: " + new Date().toLocaleTimeString());
            }
        },

        onRefresh: function () {
            this._oCurrentSorter = null;
            this._bSortDesc = false;
            var oBinding = this._getTable().getBinding("items");
            if (oBinding) { 
                oBinding.sort(null); // Reset sorting to default backend order
                oBinding.refresh(); 
            }
            MessageToast.show("Sorting reset and table refreshed.");
        },

        onRowPress: function (oEvent) {
            var oItem    = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            if (!oContext) return;
            var oData = oContext.getObject();
            
            MessageBox.information(
                "Order No: " + oData.Plnum +
                "\nMaterial: " + (oData.Matnr || "-") +
                "\nPlant: "    + (oData.Werks || "-") +
                "\nType: "     + (oData.Dispo || "-") +
                "\nQuantity: " + (oData.Gsmng || "0") + " " + (oData.Meins || ""),
                { title: "Planned Order Details" }
            );
        },


        onSelectionChange: function () {
            var iSelected = this._getTable().getSelectedItems().length;
            MessageToast.show(iSelected + " item(s) selected.");
        },

        onExport: function () {
            MessageToast.show("Export feature is currently disabled.");
        },

        onNavBack: function () {
            this.navTo("dashboard");
        }

    });
});
