sap.ui.define([
    "zshopfloor/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("zshopfloor.controller.App", {
        onInit: function () {
            this.getRouter().attachRouteMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oUserModel = this.getModel("userModel");
            var bLoggedIn  = oUserModel.getProperty("/isLoggedIn");

            // Session Guard: If not logged in and trying to access any page other than login
            if (!bLoggedIn && sRouteName !== "login") {
                this.getRouter().navTo("login");
                return;
            }
            
            // Hide side menu on login page
            if (sRouteName === "login") {
                oUserModel.setProperty("/sideMenuVisible", false);
            } else {
                oUserModel.setProperty("/sideMenuVisible", true);
                // Sync Side Navigation Selection
                var oSideNav = this.getView().byId("idSideNavigation");
                if (oSideNav) {
                    oSideNav.setSelectedKey(sRouteName);
                }
            }
        },

        onSideNavButtonPress: function () {
            var oUserModel = this.getModel("userModel");
            var bExpanded = oUserModel.getProperty("/sideMenuExpanded");
            oUserModel.setProperty("/sideMenuExpanded", !bExpanded);
        },

        onSideItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey  = oItem.getKey();
            this.getRouter().navTo(sKey);
        },

        onLogout: function () {
            this.getModel("userModel").setProperty("/isLoggedIn", false);
            this.getRouter().navTo("login");
        }
    });
});
