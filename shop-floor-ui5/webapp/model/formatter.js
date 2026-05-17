sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Formats a SAP date string (e.g. /Date(1234567890000)/) to a readable date.
         */
        formatDate: function (sDate) {
            if (!sDate) return "";
            var oDate;
            if (typeof sDate === "string" && sDate.indexOf("/Date(") > -1) {
                var iMs = parseInt(sDate.replace(/\/Date\((\d+)\)\//, "$1"), 10);
                oDate = new Date(iMs);
            } else {
                oDate = new Date(sDate);
            }
            if (isNaN(oDate.getTime())) return sDate;
            return oDate.toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric"
            });
        },

        /**
         * Formats a quantity value with unit.
         */
        formatQuantity: function (sValue, sUnit) {
            if (!sValue && sValue !== 0) return "";
            var fVal = parseFloat(sValue);
            if (isNaN(fVal)) return sValue;
            var sFormatted = fVal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
            return sUnit ? sFormatted + " " + sUnit : sFormatted;
        },

        /**
         * Returns a semantic ValueState based on production order status code.
         */
        statusToState: function (sStatus) {
            if (!sStatus || sStatus.trim() === "") return "None";
            var sUpper = sStatus.toUpperCase().trim();
            switch (sUpper) {
                case "REL":  return "Success";
                case "TECO": return "Success";
                case "CRTD": return "Information";
                case "PREL": return "Warning";
                case "DLT":  return "Error";
                case "CLSD": return "None";
                default:     return "Information";
            }
        },

        /**
         * Returns a human-readable status text from a status code.
         */
        statusToText: function (sStatus) {
            if (!sStatus || sStatus.trim() === "") return "N/A";
            var sUpper = sStatus.toUpperCase().trim();
            
            // Map common SAP codes to text
            switch (sUpper) {
                case "REL":  return "Released";
                case "TECO": return "Tech. Completed";
                case "CRTD": return "Created";
                case "PREL": return "Pre-Released";
                case "DLT":  return "Deleted";
                case "CLSD": return "Closed";
                default:     return sUpper; // Show the raw code (e.g. Z01, 001) as mixed status
            }
        },

        /**
         * Returns an icon URI for a status code.
         */
        statusToIcon: function (sStatus) {
            if (!sStatus) return "sap-icon://status-inactive";
            switch (sStatus.toUpperCase()) {
                case "REL":  return "sap-icon://accept";
                case "TECO": return "sap-icon://sys-enter-2";
                case "CRTD": return "sap-icon://add-document";
                case "PREL": return "sap-icon://pending";
                case "DLT":  return "sap-icon://delete";
                case "CLSD": return "sap-icon://locked";
                default:     return "sap-icon://status-inactive";
            }
        },

        /**
         * Formats a boolean to Yes/No string.
         */
        boolToYesNo: function (bValue) {
            return bValue ? "Yes" : "No";
        },

        /**
         * Returns highlight state for a table row based on order status.
         */
        statusToHighlight: function (sStatus) {
            if (!sStatus) return "None";
            switch (sStatus.toUpperCase()) {
                case "REL":  return "Success";
                case "TECO": return "Success";
                case "CRTD": return "Information";
                case "PREL": return "Warning";
                case "DLT":  return "Error";
                default:     return "None";
            }
        },

        getCount: function (aItems) {
            if (!aItems) return 0;
            return aItems.length;
        }

    };
});
