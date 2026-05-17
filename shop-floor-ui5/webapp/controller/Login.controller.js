sap.ui.define([
    "zshopfloor/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("zshopfloor.controller.Login", {

        onInit: function () {
            var oLoginModel = new JSONModel({
                userId: "",
                password: "",
                busy: false,
                errorMessage: ""
            });
            this.getView().setModel(oLoginModel, "loginModel");

            // Attach route matched
            this.getRouter().getRoute("login").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // Clear password on every visit
            var oModel = this.getView().getModel("loginModel");
            oModel.setProperty("/password", "");
            oModel.setProperty("/errorMessage", "");
            oModel.setProperty("/userId", ""); // Clear user id too for manual entry
        },

        onLogin: function () {
            var oModel   = this.getView().getModel("loginModel");
            var sUserId  = oModel.getProperty("/userId");
            var sPass    = oModel.getProperty("/password");

            // Validate inputs
            if (!sUserId || !sPass) {
                oModel.setProperty("/errorMessage", "Please enter both User ID and Password.");
                return;
            }

            oModel.setProperty("/errorMessage", "");
            oModel.setProperty("/busy", true);

            var sBaseUrl = "/sap/opu/odata/SAP/ZPP_SHOP_FLOOR_093_SRV";
            // Exact URL based on Postman: /sap/opu/odata/SAP/ZPP_SHOP_FLOOR_093_SRV/LoginSet?$filter=UserId eq '...' and Password eq '...'
            var sUrl = sBaseUrl + "/LoginSet?$filter=UserId eq '" + sUserId + "' and Password eq '" + sPass + "'";

            // Use XML as requested
            jQuery.ajax({
                url: sUrl,
                method: "GET",
                dataType: "xml",
                timeout: 15000,
                beforeSend: function (xhr) {
                    // PROACTIVE SYSTEM AUTH: Use system credentials to prevent SAP Basic Auth popup
                    // This handles the technical connection while the UI validates the end-user
                    var sAuth = "Basic " + btoa("K902093:Vinodh@5284456");
                    xhr.setRequestHeader("Authorization", sAuth);
                },
                success: function (xml) {
                    oModel.setProperty("/busy", false);
                    
                    // Parse XML for Status and Message
                    var $xml = jQuery(xml);
                    var sStatus = $xml.find("d\\:Status, Status").text();
                    var sMessage = $xml.find("d\\:Message, Message").text();
                    var sUserName = $xml.find("d\\:UserName, UserName").text() || sUserId;

                    // Lenient success check: Status S or Message contains "Success"
                    if (sStatus === "S" || (sMessage && sMessage.toLowerCase().indexOf("success") !== -1)) {
                        // 1. Update User State
                        var oComponent = this.getOwnerComponent();
                        var oUserModel = oComponent.getModel("userModel");
                        oUserModel.setProperty("/userId", sUserId);
                        oUserModel.setProperty("/isLoggedIn", true);
                        oUserModel.setProperty("/userName", sUserName);

                        // 2. Clear password
                        oModel.setProperty("/password", "");

                        // 3. Navigate
                        sap.m.MessageToast.show(sMessage || "Login Successful");
                        this.getRouter().navTo("dashboard", {}, true);
                    } else {
                        oModel.setProperty("/errorMessage", sMessage || "Invalid credentials. Please try again.");
                    }
                }.bind(this),

                error: function (oError, sStatus) {
                    oModel.setProperty("/busy", false);
                    var sMsg = "Unable to connect to SAP. Please check your network.";
                    if (sStatus === "timeout") {
                        sMsg = "Connection Timeout: SAP server is not responding.";
                    }
                    oModel.setProperty("/errorMessage", sMsg);
                }.bind(this)
            });
        }

    });
});
