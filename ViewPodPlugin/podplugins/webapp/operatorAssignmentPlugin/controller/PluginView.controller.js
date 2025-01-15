sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/base/Log",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (JSONModel, PluginViewController, Log, Filter, FilterOperator) {
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
            this.orderListPage = 0;
            var oModel = new JSONModel();
            this.getView().setModel(oModel, 'data');
        },


        /**
         * @see PluginViewController.onBeforeRenderingPlugin()
         */
        onBeforeRenderingPlugin: function () {
            var oConfig = this.getConfiguration();
            this.configureNavigationButtons(oConfig);
        },

        onExit: function () {
            if (PluginViewController.prototype.onExit) {
                PluginViewController.prototype.onExit.apply(this, arguments);
            }

        },

        onBeforeRendering: function () {
            var oModel = new JSONModel();
            this._loadResourceData();
            this._loadRoutingData();
        },


        onAfterRendering: function () {
        },
        onSearch: function () {
            var sOrderId = this.getView().byId("OrderId").getValue();
            var sMaterialId = this.getView().byId("MaterialId").getValue();
            var oTable = this.getView().byId("idOrderTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            if (sOrderId) {
                var oFilter = new Filter("order", FilterOperator.Contains, sOrderId);
                // var oFilter = new Filter("material", FilterOperator.Contains, sMaterialId);
                aFilters.push(oFilter);
            }
            oBinding.filter(aFilters);

        },

        // Material Value help

        onMaterialValueHelpRequest: function () {
            var oView = this.getView(),
                oViewModel = oView.getModel("data");

            if (!this.oMaterialVHDia) {
                //Load the fragment
                this.oMaterialVHDia = sap.ui.xmlfragment(
                    "Kusuma.ext.viewplugins.operatorAssignmentPlugin.view.fragments.MaterialValueHelpRequest",
                    this
                );

                this.oMaterialVHDia.getTableAsync().then(function (oTable) {
                    //Add columns to the table
                    oTable.addColumn(
                        new sap.ui.table.Column({
                            label: new sap.m.Text({ text: "Material" }),
                            template: new sap.m.Text({ text: "{Material>material/material}" }),
                            width: "170px"

                        })
                    );
                    oTable.addColumn(
                        new sap.ui.table.Column({
                            label: new sap.m.Text({ text: "Material Description" }),
                            template: new sap.m.Text({ text: "{Material>material/description}" }),
                            width: "170px"
                        })
                    );

                    //Bind data to the table
                    oTable.setModel(oViewModel, "Material");
                    oTable.bindRows("Material>/");
                });
            }
            this.oMaterialVHDia.open();
        },

        onMaterialVHDiaSearch: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
                aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                aFilters = [];

            //Create filters based on selected input Values
            aFilters = aFilterGroupItems.map(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getValue) {
                    return new Filter({
                        path: oFGI.getName(),
                        operator: FilterOperator.Contains,
                        value1: oControl.getValue()
                    });
                }
            })
                .filter(Boolean); //Filter out empty values

            //Get the table for dialog and apply filter 
            this.oMaterialVHDia.getTableAsync().then(oTable => {
                var oRowBindingCtx = oTable.getBinding("rows");
                //    oRowBindingCtx = oTable.getBinding("rows");
                oRowBindingCtx.filter(aFilters);
            });
        },
        onMaterialVHDiaOKPress: function (oEvent) {
            //Get the table 
            this.oMaterialVHDia.getTableAsync().then(oTable => {
                var oRowBindingCtx = oTable.getBinding("rows");
                //    oRowBindingCtx = oTable.getBinding("rows");
                var iSelectedIndex = oTable.getSelectedIndex();
                //No order selected
                if (iSelectedIndex < 1) {
                    return;
                }

                // Retrieve the data of the selected row
                var oSelectedItem = oTable.getContextByIndex(iSelectedIndex).getObject();
                //Close dialog
                this.oMaterialVHDia.close();

                //Get Batch info for selected resource
                var sSelectedorder = oSelectedItem.material.material;

                //Set the selected order to model
                var oViewModel = this.getView().getModel("data");
                oViewModel.setProperty("/Material", sSelectedorder);
                oViewModel.setProperty("/ismaterialSelected", true);
            });

        },


        onMaterialVHDiaCancelPress: function (oEvent) {
            this.oMaterialVHDia.close();
        },


        // order value help
        onOrderValueHelpRequest: function () {
            var that = this;
            var oView = this.getView(),
                oViewModel = oView.getModel("data");

            if (!this.oOrderVHDia) {
                //Load the fragment
                this.oOrderVHDia = sap.ui.xmlfragment(
                    "Kusuma.ext.viewplugins.operatorAssignmentPlugin.view.fragments.OrderValueHelpRequest",
                    this
                );

                this.oOrderVHDia.getTableAsync().then(function (oTable) {
                    //Add columns to the table
                    oTable.addColumn(
                        new sap.ui.table.Column({
                            label: new sap.m.Text({ text: "Order" }),
                            template: new sap.m.Text({ text: "{data>order}" }),
                            width: "170px"

                        })
                    );
                    oTable.addColumn(
                        new sap.ui.table.Column({
                            label: new sap.m.Text({ text: "status" }),
                            template: new sap.m.Text({ text: "{data>status}" }),
                            width: "170px"
                        })
                    );
                    oTable.addColumn(
                        new sap.ui.table.Column({
                            label: new sap.m.Text({ text: "orderType" }),
                            template: new sap.m.Text({ text: "{data>orderType}" }),
                            width: "170px"
                        })
                    );
                    //Bind data to the table
                    oTable.setModel(oViewModel, "data");
                    oTable.bindRows("data>/");
                    // Implement custom pagination handling
                    oTable.attachEvent("rowsUpdated", function () {
                        that._updateTablePagination(oTable);
                    }.bind(this));
                });
            }
            this.oOrderVHDia.open();
        },
        _updateTablePagination: function(oTable) {
            var iNumberOfRows = 20;  // Number of rows per page
            var oBinding = oTable.getBinding("rows");
            oBinding.attachChange(function(oEvent) {
                var iStartIndex = oBinding.iLastStartIndex || 0;
                var iLength = oBinding.iLastLength || iNumberOfRows;
                oBinding.changeParameters({
                    $skip: iStartIndex,
                    $top: iLength
                });
            });
        },

        onOrderVHDiaSearch: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
                aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                aFilters = [];

            //Create filters based on selected input Values
            aFilters = aFilterGroupItems.map(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getValue) {
                    return new Filter({
                        path: oFGI.getName(),
                        operator: FilterOperator.Contains,
                        value1: oControl.getValue()
                    });
                }
            })
                .filter(Boolean); //Filter out empty values

            //Get the table for dialog and apply filter 
            this.oOrderVHDia.getTableAsync().then(oTable => {
                var oRowBindingCtx = oTable.getBinding("rows");
                //    oRowBindingCtx = oTable.getBinding("rows");
                oRowBindingCtx.filter(aFilters);
            });
        },
        onOrderVHDiaOKPress: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("tokens");

            //No order selected
            if (aSelectedItems.length < 1) {
                return;
            }

            //Close dialog
            this.oOrderVHDia.close();

            //Get Batch info for selected resource
            var sSelectedorder = aSelectedItems[0].getKey();

            //Set the selected order to model
            var oViewModel = this.getView().getModel("data");
            oViewModel.setProperty("/order", sSelectedorder);
            oViewModel.setProperty("/isorderSelected", true);
        },

        onOrderVHDiaCancelPress: function (oEvent) {
            this.oOrderVHDia.close();
        },
        _loadRoutingData: function (oEvent) {
            var that = this,
                sUrl = this.getPublicApiRestDataSourceUri() + '/recipe/v1/recipes?recipe=120000000002&recipeType=SHOP_ORDER'
            var oOrdersTable = this.getView().byId("idOrderTable");
            var oParameters = {
                plant: this.getPodController().getUserPlant()
            };

            this.ajaxGetRequest(
                sUrl,
                oParameters,
                function (oResponseData) {

                    that._handleResourceResponse(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                    console.error("Error fetching data:", error);
                    //that.handleErrorMessage(oError, sHttpErrorMessage);
                }
            );
        },

        _loadResourceData: function (oEvent) {
            if (oEvent) {
                this.orderListPage = 0;
            }
            var locale = sap.ui.getCore().getConfiguration().getLocale().toLocaleString();
            var that = this,
                // Get the locale string from the SAP core configuration

                sUrl = this.getPublicApiRestDataSourceUri() + '/order/v1/orders/list?sort=createdDateTime,desc&locale=' +
                    locale +
                    '&size={pageSize}&page={page}';
            // Replace placeholders with actual values
            var sUrl = sUrl.replace('{pageSize}', 20).replace('{page}', oEvent ? 0 : this.orderListPage);
            // var that = this,
            //     sUrl = this.getPublicApiRestDataSourceUri() + '/order/v1/orders/list';
            var oOrdersTable = this.getView().byId("idOrderTable");
            var oParameters = {
                plant: this.getPodController().getUserPlant()
            };

            // this.ajaxGetRequest(
            //     sUrl,
            //     oParameters,
            //     function (oResponseData) {

            //         that._handleResourceResponse(oResponseData);
            //     },
            //     function (oError, sHttpErrorMessage) {
            //         console.error("Error fetching data:", error);
            //         //that.handleErrorMessage(oError, sHttpErrorMessage);
            //     }
            // );

            this.ajaxGetRequest(sUrl, oParameters, function (oResponse) {
                var aContent = oResponse.content;
                var totalElements = oResponse.totalElements;
                var currentDataLength; //get current model data length



                //Set retrieved data to model
                if (that.orderListPage === 0) {
                    that.getView().getModel("data").setData(aContent);
                } else {
                    var aModelData = that.getView().getModel("data").getData();
                    if (!Array.isArray(aModelData)) { aModelData = []; }
                    that.getView().getModel("data").setData(aModelData.concat(aContent))
                    //oModel.setData(aContent)
                }

                var currentDataLength = that.getView().getModel('data').getData().length
                if (currentDataLength === +totalElements) {
                    oOrdersTable.getBindingInfo('items').binding.isLengthFinal = function () {
                        return true;
                    };
                    oOrdersTable.setGrowingTriggerText('');
                } else {
                    oOrdersTable.getBindingInfo('items').binding.isLengthFinal = function () {
                        return false;
                    };
                    const growingText = that.getI18nText('growingTriggerText', [currentDataLength, totalElements]);
                    oOrdersTable.setGrowingTriggerText(growingText);
                }
            })
        },
        onBeforeTableUpdate: function (oEvent) {
            if (oEvent.getParameters().reason === 'Growing') {
                this.orderListPage++;
                this._loadResourceData();
            }
        },
        _handleResourceResponse: function (oResponseData) {
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


