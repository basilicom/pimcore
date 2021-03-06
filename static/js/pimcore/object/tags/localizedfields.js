/**
 * Pimcore
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.pimcore.org/license
 *
 * @copyright  Copyright (c) 2009-2013 pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     New BSD License
 */

pimcore.registerNS("pimcore.object.tags.localizedfields");
pimcore.object.tags.localizedfields = Class.create(pimcore.object.tags.abstract, {

    type: "localizedfields",

    initialize: function (data, fieldConfig) {

        this.data = {};
        this.metaData = {};
        this.inherited = false;
        this.languageElements = {};
        this.inheritedFields = {};

        if (data) {
            if (data.data) {
                this.data = data.data;
            }
            if (data.metaData) {
                this.metaData = data.metaData;
            }
            if (data.inherited) {
                this.inherited = data.inherited;
            }
        }
        this.fieldConfig = fieldConfig;

        this.keysToWatch = [];

        if (this.inherited) {

            for (var i=0; i<pimcore.settings.websiteLanguages.length; i++) {
                var currentLanguage = pimcore.settings.websiteLanguages[i];

                var metadataForLanguage = this.metaData[currentLanguage];
                var dataKeys = Object.keys(metadataForLanguage);

                for (var k = 0; k < dataKeys.length; k++) {
                    var dataKey = dataKeys[k];
                    var metadataForKey = metadataForLanguage[dataKey];
                    if (metadataForKey.inherited) {
                        this.keysToWatch.push({
                            lang: currentLanguage,
                            key: dataKey
                        });
                    }
                }
            }
        }
    },

    getLayoutEdit: function () {

        var panelConf = {
            autoScroll: true,
            monitorResize: true,
            cls: "object_field",
            activeTab: 0,
            height: 10,
            items: [],
            deferredRender: true,
            forceLayout: true,
            hideMode: "offsets",
            enableTabScroll:true
        };

        var wrapperConfig = {
            border: false,
            layout: "fit"
        };


        if(!this.fieldConfig.width) {
            /*panelConf.listeners = {
                afterrender: function () {
                    this.component.ownerCt.doLayout();
                    this.component.setWidth(this.component.ownerCt.getWidth()-45);
                }.bind(this)
            };*/
        }

        if(this.fieldConfig.width) {
            wrapperConfig.width = this.fieldConfig.width;
        }

        if(this.fieldConfig.height) {
            panelConf.height = this.fieldConfig.height;
            panelConf.autoHeight = false;
        }

        // this is because the tabpanel has a strange behavior with automatic height, this corrects the problem
        panelConf.listeners = {
            afterrender: function () {
                this.tabPanelAdjustIntervalCounter = 0;
                this.tabPanelAdjustInterval = window.setInterval(function () {

                    this.tabPanelAdjustIntervalCounter++;
                    if(this.tabPanelAdjustIntervalCounter > 20) {
                        clearInterval(this.tabPanelAdjustInterval);
                    }

                    if(!this.fieldConfig.height && !this.fieldConfig.region) {
                        try {
                            var panelBodies = this.tabPanel.items.first().getEl().query(".x-panel-body");
                            var panelBody = Ext.get(panelBodies[0]);
                            panelBody.applyStyles("height: auto;");
                            var height = panelBody.getHeight();
                            // 100 is just a fixed value which seems to be ok(caused by title bar, tabs itself, ... )
                            this.component.setHeight(height+100);

                            //this.tabPanel.getEl().applyStyles("position:relative;");
                            this.component.doLayout();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }.bind(this), 100);
            }.bind(this)
        };

        /*if(this.fieldConfig.layout) {
            wrapperConfig.layout = this.fieldConfig.layout;
        }*/

        if(this.fieldConfig.region) {
            wrapperConfig.region = this.fieldConfig.region;
        }

        if(this.fieldConfig.title) {
            wrapperConfig.title = this.fieldConfig.title;
        }


        this.fieldConfig.datatype ="layout";
        this.fieldConfig.fieldtype = "panel";

        for (var i=0; i<pimcore.settings.websiteLanguages.length; i++) {

            this.currentLanguage = pimcore.settings.websiteLanguages[i];
            this.languageElements[this.currentLanguage] = [];

            panelConf.items.push({
                xtype: "panel",
                layout: "pimcoreform",
                border:false,
                autoScroll: true,
                padding: "10px",
                deferredRender: false,
                hideMode: "offsets",
                title: pimcore.available_languages[pimcore.settings.websiteLanguages[i]],
                items: this.getRecursiveLayout(this.fieldConfig).items
            });

        }

        this.tabPanel = new Ext.TabPanel(panelConf);


        wrapperConfig.items = [this.tabPanel];
        this.component = new Ext.Panel(wrapperConfig);

        return this.component;
    },

    getLayoutShow: function () {

        this.component = this.getLayoutEdit();
        this.component.disable();

        return this.component;
    },

    getDataForField: function (name) {

        try {
            if (this.data[this.currentLanguage]) {
                if (this.data[this.currentLanguage][name]) {
                    return this.data[this.currentLanguage][name];
                } else if (typeof this.data[this.currentLanguage][name] !== undefined){
                    return null;
                }
            }
        } catch (e) {
            console.log(e);
        }
        return;
    },

    getMetaDataForField: function(name) {
        try {
            if (this.metaData[this.currentLanguage]) {
                if (this.metaData[this.currentLanguage][name]) {
                    return this.metaData[this.currentLanguage][name];
                } else if (typeof this.data[this.currentLanguage][name] !== undefined){
                    return null;
                }
            }
        } catch (e) {
            console.log(e);
        }
        return;

    },

    addToDataFields: function (field, name) {
        this.languageElements[this.currentLanguage].push(field);
    },

    addFieldsToMask: function (field) {
        this.object.edit.fieldsToMask.push(field);
    },

    getValue: function () {

        var localizedData = {};
        var currentLanguage;

        for (var i=0; i<pimcore.settings.websiteLanguages.length; i++) {

            currentLanguage = pimcore.settings.websiteLanguages[i];
            localizedData[currentLanguage] = {};

            for (var s=0; s<this.languageElements[currentLanguage].length; s++) {
                if(this.languageElements[currentLanguage][s].isDirty()) {
                    localizedData[currentLanguage][this.languageElements[currentLanguage][s].getName()]
                                                        = this.languageElements[currentLanguage][s].getValue();
                }
            }
        }
        return localizedData;
    },

    getName: function () {
        return this.fieldConfig.name;
    },

    isDirty: function() {
        if(!this.isRendered()) {
            return false;
        }

        var currentLanguage;

        for (var i=0; i<pimcore.settings.websiteLanguages.length; i++) {

            currentLanguage = pimcore.settings.websiteLanguages[i];

            for (var s=0; s<this.languageElements[currentLanguage].length; s++) {
                if(this.languageElements[currentLanguage][s].isDirty()) {
                    return true;
                }
            }
        }

        return false;
    },

    isMandatory: function () {

        var currentLanguage;

        for (var i=0; i<pimcore.settings.websiteLanguages.length; i++) {

            currentLanguage = pimcore.settings.websiteLanguages[i];

            for (var s=0; s<this.languageElements[currentLanguage].length; s++) {
                if(this.languageElements[currentLanguage][s].isMandatory()) {
                    return true;
                }
            }
        }

        return false;
    },

    isInvalidMandatory: function () {

        var currentLanguage;
        var isInvalid = false;
        var invalidMandatoryFields = [];

        for (var i=0; i<pimcore.settings.websiteLanguages.length; i++) {

            currentLanguage = pimcore.settings.websiteLanguages[i];

            for (var s=0; s<this.languageElements[currentLanguage].length; s++) {
                if(this.languageElements[currentLanguage][s].isMandatory()) {
                    if(this.languageElements[currentLanguage][s].isInvalidMandatory()) {
                        invalidMandatoryFields.push(this.languageElements[currentLanguage][s].getTitle() + " - "
                                                + currentLanguage.toUpperCase() + " ("
                                                + this.languageElements[currentLanguage][s].getName() + ")");
                        isInvalid = true;
                    }
                }
            }
        }

        // return the error messages not bool, this is handled in object/edit.js
        if(isInvalid) {
            return invalidMandatoryFields;
        }

        return isInvalid;
    },

    dataIsNotInherited: function() {
        if (!this.inherited) {
            return true;
        }

        var foundUnmodifiedInheritedField = false;
        for (var i=0; i<pimcore.settings.websiteLanguages.length; i++) {

            var currentLanguage = pimcore.settings.websiteLanguages[i];

            for (var s=0; s<this.languageElements[currentLanguage].length; s++) {

                if (this.metaData[currentLanguage]) {
                    var languageElement = this.languageElements[currentLanguage][s];
                    var key = languageElement.name;
                    if (this.metaData[currentLanguage][key]) {
                        if (this.metaData[currentLanguage][key].inherited) {
                            if(languageElement.isDirty()) {
                                this.metaData[currentLanguage][key].inherited = false;
                                languageElement.unmarkInherited();
                            } else {
                                foundUnmodifiedInheritedField = true;
                            }
                        }
                    }
                }
            }
        }

        if (!foundUnmodifiedInheritedField) {
            this.inherited = false;
        }
        return !this.inherited;
    },

    markInherited:function (metaData) {
        // nothing to do, only sub-elements can be marked
    }

});

pimcore.object.tags.localizedfields.addMethods(pimcore.object.helpers.edit);