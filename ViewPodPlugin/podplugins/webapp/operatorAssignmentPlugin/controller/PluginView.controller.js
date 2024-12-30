sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/base/Log",
    "sap/ui/model/Filter", 
    "sap/ui/model/FilterOperator",
], function (JSONModel, PluginViewController,Log,Filter,FilterOperator) {
    "use strict";

    var oLogger = Log.getLogger("viewPluginTemplate", Log.Level.INFO);

    var oPluginViewTemplateController = PluginViewController.extend("Kusuma.ext.viewplugins.operatorAssignmentPlugin.controller.PluginView", {
        metadata: {
            properties: {
            }
        },

        onInit: function () {
            if (PluginViewController.prototype.onInit) {
                PluginViewController.prototype.onInit.apply(this, arguments);
            }
            var oModel = new JSONModel();
            this.getView().setModel(oModel, 'data');
        },


        /**
         * @see PluginViewController.onBeforeRenderingPlugin()
         */
        onBeforeRenderingPlugin: function () {
            // this.subscribe("PodSelectionChangeEvent", this.onPodSelectionChangeEvent, this);
            // this.subscribe("OperationListSelectEvent", this.onOperationChangeEvent, this);
            // this.subscribe("WorklistSelectEvent", this.onWorkListSelectEvent, this);
            var oConfig = this.getConfiguration();
            this.configureNavigationButtons(oConfig);
        },

        onExit: function () {
            if (PluginViewController.prototype.onExit) {
                PluginViewController.prototype.onExit.apply(this, arguments);
            }
            // this.unsubscribe("PodSelectionChangeEvent", this.onPodSelectionChangeEvent, this);
            // this.unsubscribe("OperationListSelectEvent", this.onOperationChangeEvent, this);
            // this.unsubscribe("WorklistSelectEvent", this.onWorkListSelectEvent, this);
        },

        onBeforeRendering: function () {
            var oModel = new JSONModel();
            this._loadResourceData();
                  },
        

        onAfterRendering: function () {
        },
        onSearch:function(){
            var sOrderId = this.getView().byId("OrderId").getValue(); 
            var oTable = this.getView().byId("idOrderTable"); 
            var oBinding = oTable.getBinding("items"); 
            var aFilters = [];
            if (sOrderId) { 
                var oFilter = new Filter("order", FilterOperator.Contains, sOrderId);
                 aFilters.push(oFilter);
                 } 
            oBinding.filter(aFilters); 
                     
        },
        onOrderRequest: function(oEvent) {
            // Create the list dialog
            if (!this._oListDialog) {
                var oList = new sap.m.List({
                    items: {
                        path: "data>/Orders/content",
                        template: new sap.m.StandardListItem({
                            title: "{data>order}",
                            type: "Active",
                            press: this.onOrderSelected.bind(this)
                        })
                    }
                });

                this._oListDialog = new sap.m.Dialog({
                    title: "Select Order ID",
                    content: oList,
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function() {
                            this._oListDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oListDialog);
                this._oListDialog.setModel(this.getView().getModel());
            }

            // Open the list dialog
            this._oListDialog.open();
        },
        onOrderSelected: function(oEvent) {
            var sOrderId = oEvent.getSource().getTitle();
            this.byId("OrderId").setValue(sOrderId);
            this._oListDialog.close();
        },
        onSelectionChange:function(oEvent){
            var bSelected = oEvent.getParameter("selected");
            this.getView().byId("idAssign").setEnabled(bSelected)
            this.getView().byId("idRevoke").setEnabled(bSelected)
            this.getView().byId("idAdd").setEnabled(bSelected)
            this.getView().byId("idRemove").setEnabled(bSelected)
        },

        // onPodSelectionChangeEvent: function (sChannelId, sEventId, oData) {
        //     // don't process if same object firing event
        //     if (this.isEventFiredByThisPlugin(oData)) {
        //         return;
        //     }
        // },

        // onOperationChangeEvent: function (sChannelId, sEventId, oData) {
        //     // don't process if same object firing event
        //     if (this.isEventFiredByThisPlugin(oData)) {
        //         return;
        //     }
        // },

        // onWorkListSelectEvent: function (sChannelId, sEventId, oData) {
        //     // don't process if same object firing event
        //     if (this.isEventFiredByThisPlugin(oData)) {
        //         return;
        //     }
        // },
        _loadResourceData: function() {
            var that = this,
              sUrl = this.getPublicApiRestDataSourceUri() + '/order/v1/orders/list';
            var oParameters = {
              plant: this.getPodController().getUserPlant()
            };
  
            this.ajaxGetRequest(
              sUrl,
              oParameters,
              function(oResponseData) {
                
                that._handleResourceResponse(oResponseData);
              },
              function(oError, sHttpErrorMessage) {
                console.error("Error fetching data:", error);
                //that.handleErrorMessage(oError, sHttpErrorMessage);
              }
            );
          },
          _handleResourceResponse: function(oResponseData) {
            var oModel = this.getView().getModel('data');
  
            console.log('Data received', oResponseData);
  
            //Convert custom value array to object for data binding
            for (var i = 0; i < oResponseData.length; i++) {
              var oCustomData = oResponseData[i].customValues.reduce((acc, val) => {
                acc[val.attribute] = val.value;
                return acc;
              }, {});
              oResponseData[i].customData = oCustomData;
            }
            oModel.setProperty('/Orders', oResponseData);
  
            console.log('Data set in model:', oModel.getData());
          },

        configureNavigationButtons: function (oConfiguration) {
            if (!this.isPopup() && !this.isDefaultPlugin()) {
                this.byId("closeButton").setVisible(oConfiguration.closeButtonVisible);
            }
        }
    });

    return oPluginViewTemplateController;
});


