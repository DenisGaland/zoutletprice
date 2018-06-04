sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/Image"
], function(Controller, ODataModel, MessageBox, MessageToast, ResourceModel, BusyIndicator, Image) {
	"use strict";

	return Controller.extend("z.ZOUTLETARTICLE.controller.View1", {
		timer: true,
		onInit: function() {
			var oView = this.getView();
			var i18nModel = new ResourceModel({
				bundleName: "z.ZOUTLETARTICLE.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
			var path = $.sap.getModulePath("z.ZOUTLETARTICLE", "/image");
			this.getView().byId("imagepp").setSrc(path + "/PP-logo-animated.svg");
			this.getView().byId("background").setSrc(path + "/tablette-scan.png");
			jQuery.sap.delayedCall(2000, this, function() {
				oView.byId("eanSearch").focus();
			});
			var objShell = sap.ui.getCore().byId("shell");
			objShell.setHeaderVisible(true);
			setInterval(function() {
				oView.byId("background").setVisible(true);
				oView.byId("_vbox1").setVisible(false);
			}, 60000);
			//this.setKeyboardShortcuts();
		},

		// setKeyboardShortcuts: function() {
		// 	$(document).keydown($.proxy(function(evt) {
		// 		debugger;
		// 		alert(evt.key);
		// 	}));
		// },

		searchEAN: function(oEvent) {
			var oController = this;
			var oView = this.getView();
			var ean = oEvent.getSource().getValue();
			var config = this.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZDISLABELMAN_SRV.uri;
			var oData = new ODataModel(sServiceUrl, true);
			var sPath = "/getprices";
			oView.byId("eanSearch").setValue("");
			BusyIndicator.show();
			oData.callFunction(sPath, {
				method: "GET",
				urlParameters: {
					Ean: ean
				},
				success: function(OData, oResponse) {
					if (oResponse.data.Message !== "") {
						oView.byId("imgBox").removeAllItems();
						oView.byId("priceoutlet").setText();
						oView.byId("pricevat").setText();
						oView.byId("description").setText();
						jQuery.sap.delayedCall(500, this, function() {
							oView.byId("eanSearch").focus();
						});
						MessageToast.show(oResponse.data.Message, {
							my: "center center",
							at: "center center"
						});
					} else {
						var oImage = new Image({
							//src: "http://www.planetparfum.com/dw/image/v2/AATN_PRD/on/demandware.static/-/Sites-master-catalog-pp/default/dwecc8efac/zoom/20034670_M.jpg",
							src: oResponse.data.ImgUrl,
							densityAware: false,
							width: "200%",
							error: function(oEvent2) {
								var path = $.sap.getModulePath("z.ZOUTLETARTICLE", "/image");
								oEvent2.getSource().setSrc(path + "/notfound.jpg");
							}
						});
						oView.byId("imgBox").removeAllItems();
						oView.byId("imgBox").addItem(oImage);
						if (oResponse.data.OutletPrice === "0.0") {
							oView.byId("priceoutlet").setText(oView.getModel("i18n").getResourceBundle().getText("priceoutlet"));
						} else {
							var outletprice = oResponse.data.OutletPrice.replace(".", ",");
							oView.byId("priceoutlet").setText(oView.getModel("i18n").getResourceBundle().getText("priceoutlet") + " " +
								outletprice + " " + "€");
						}
						if (oResponse.data.VATPrice === "0.0") {
							oView.byId("pricevat").setText(oView.getModel("i18n").getResourceBundle().getText("salesprice"));
						} else {
							var salesprice = oResponse.data.VATPrice.replace(".", ",");
							oView.byId("pricevat").setText(oView.getModel("i18n").getResourceBundle().getText("salesprice") + " " +
								salesprice + " " + "€");
						}
						oView.byId("description").setText(oResponse.data.Maktx);
						oView.byId("background").setVisible(false);
						oView.byId("_vbox1").setVisible(true);
					}
					BusyIndicator.hide();
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("eanSearch").focus();
					});
				},
				error: function(error) {
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.response.body).error.message.value, {
						title: "Error"
					});
				}
			});
		}
	});
});