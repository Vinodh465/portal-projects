sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "zshopfloor/model/formatter"
], function (Controller, History, UIComponent, MessageBox, formatter) {
	"use strict";

	return Controller.extend("zshopfloor.controller.BaseController", {
        
        formatter: formatter,

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.m.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Navigates to a specific route.
		 * @public
		 * @param {string} sName the name of the route
		 * @param {object} oParameters the parameters for the route
		 * @param {boolean} bReplace if set to true, the current history entry is replaced
		 */
		navTo: function (sName, oParameters, bReplace) {
			this.getRouter().navTo(sName, oParameters, bReplace);
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("dashboard", {}, true);
			}
		},

        showError: function(sMessage) {
            MessageBox.error(sMessage);
        },

        onLogout: function() {
            var oUserModel = this.getOwnerComponent().getModel("userModel");
            oUserModel.setProperty("/isLoggedIn", false);
            oUserModel.setProperty("/userId", "");
            this.navTo("login");
        }

	});

});
