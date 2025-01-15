sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/dm/dme/podfoundation/controller/PluginViewController",
  "sap/base/Log",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
], function (JSONModel, PluginViewController, Log, Filter, FilterOperator) {
  "use strict";

    var oLogger = Log.getLogger("viewPluginTemplate", Log.Level.INFO);

    var oPluginViewTemplateController = PluginViewController.extend("Kusuma.ext.viewplugins.newConfirmationPlugin.controller.PluginView", {
        metadata: {
            properties: {
            }
        },

        onInit: function() {
            if (PluginViewController.prototype.onInit) {
              PluginViewController.prototype.onInit.apply(this, arguments);
            }
  
           
          },

       /**
         * @see PluginViewController.onBeforeRenderingPlugin()
         */
       onBeforeRenderingPlugin: function() {
        this.subscribe('phaseSelectionEvent', this.getActivityConfirmationPluginData, this);
        this.subscribe('refreshPhaseList', this.handleYieldOrScrapReported, this);

        this.subscribe('phaseSelectionEvent', this.getQuantityConfirmationData, this);
        this.subscribe('plantChan');
        this.publish('requestForPhaseData', this);
        this.podType = this.getPodSelectionModel().getPodType();
        //Work Center POD event for Prodcuction Order
        if (this.getPodSelectionModel().getPodType() === 'WORK_CENTER') {
          this.subscribe('OperationListSelectEvent', this.onOperationSelected, this);
          this.publish('phaseSelectionEventWIList', this);
        }
        //Order POD event for Process Order
        if (this.getPodSelectionModel().getPodType() === 'ORDER') {
          this.subscribe('phaseSelectionEvent', this.onPhaseSelected, this);
          this.publish('requestForPhaseData', this);
        }

       // this._setShowFooterToolbar();
      },

      onExit: function() {
        if (this.selectReasonCodeDialog !== undefined) {
          this.selectReasonCodeDialog.destroy();
        }
        if (this._oTableSettings) {
          this._oTableSettings.destroy();
        }
        PluginViewController.prototype.onExit.apply(this, arguments);
        this.unsubscribe('phaseSelectionEvent', this.getActivityConfirmationPluginData, this);
        this.unsubscribe('phaseSelectionEvent', this.getQuantityConfirmationData, this);
        this.unsubscribe('refreshPhaseList', this.handleYieldOrScrapReported, this);

        //Work Center POD event for Prodcuction Order
        if (this.getPodSelectionModel().getPodType() === 'WORK_CENTER') {
          this.unsubscribe('OperationListSelectEvent', this.onOperationSelected, this);
        }
        //Order POD event for Process Order
        if (this.getPodSelectionModel().getPodType() === 'ORDER') {
          this.unsubscribe('phaseSelectionEvent', this.onPhaseSelected, this);
        }
      },

        onBeforeRendering: function () {
          
        },


        onAfterRendering: function () {
        },
       

       

        configureNavigationButtons: function (oConfiguration) {
            if (!this.isPopup() && !this.isDefaultPlugin()) {
                this.byId("closeButton").setVisible(oConfiguration.closeButtonVisible);
            }
        }
    });

    return oPluginViewTemplateController;
});


