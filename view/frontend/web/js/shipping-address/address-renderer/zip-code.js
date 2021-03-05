define([
    'underscore',
    'ko',
    'uiRegistry',
    'Magento_Ui/js/form/element/abstract',
    'jquery',
    'inputMask',
    'mage/url',    
    'Magento_Checkout/js/action/get-payment-information',
    'loader'
], function (_, ko, registry, Abstract, jquery, mask, url, getPaymentInformationAction) {
    'use strict';

    return Abstract.extend({
        defaults: {
            loading: ko.observable(false),
            imports: {
                update: '${ $.parentName }.country_id:value'
            }
        },

        initialize: function () {
            this._super();
            jquery('#'+this.uid).mask('00000-000', {clearIfNotMatch: true});
            return this;
        },

        /**
         * @param {String} value
         */
        update: function (value) {
            var country = registry.get(this.parentName + '.' + 'country_id'),
                options = country.indexedOptions,
                option;

            if (!value) {
                return;
            }

            if(options[value]){
                option = options[value];

                if (option['is_zipcode_optional']) {
                    this.error(false);
                    this.validation = _.omit(this.validation, 'required-entry');
                } else {
                    this.validation['required-entry'] = true;
                }

                this.required(!option['is_zipcode_optional']);

            }

            this.firstLoad = true;
        },


        onUpdate: function () {
            this.bubble('update', this.hasChanged());
            var validate = this.validate();

            if(validate.valid == true && this.value() && this.value().length == 9){
                jquery('body').loader('show');

                var element = this;

                var value = this.value();
                value = value.replace('-', '');


                jquery.ajax({
                    url: `https://viacep.com.br/ws/${value}/json/`,
                    dataType: 'json',
                    timeout: 4000
                }).done(function (data) {
                    if(data.error){
                        // TODO
                    }else{
                        if(registry.get(element.parentName + '.' + 'street.0')){
                            registry.get(element.parentName + '.' + 'street.0').value(data.logradouro ?? '');
                        }
                        if(registry.get(element.parentName + '.' + 'street.2')){
                            registry.get(element.parentName + '.' + 'street.2').value(data.bairro ?? '');
                        }
                        if(registry.get(element.parentName + '.' + 'city')){
                            registry.get(element.parentName + '.' + 'city').value(data.localidade ?? '');
                        }

                        var slcUF = "";

                        switch(data.uf) {
                            case "AC":
                                slcUF = "485";
                                break;
                            case "AL":
                                slcUF = "486";
                                break;
                            case "AP":
                                slcUF = "487";
                                break;
                            case "AM":
                                slcUF = "488";
                                break;
                            case "BA":
                                slcUF = "489";
                                break;
                            case "CE":
                                slcUF = "490";
                                break;
                            case "ES":
                                slcUF = "491";
                                break;
                            case "GO":
                                slcUF = "492";
                                break;
                            case "MA":
                                slcUF = "493";
                                break;
                            case "MT":
                                slcUF = "494";
                                break;
                            case "MS":
                                slcUF = "495";
                                break;
                            case "MG":
                                slcUF = "496";
                                break;
                            case "PA":
                                slcUF = "497";
                                break;
                            case "PB":
                                slcUF = "498";
                                break;
                            case "PR":
                                slcUF = "499";
                                break;
                            case "PE":
                                slcUF = "500";
                                break;
                            case "PI":
                                slcUF = "501";
                                break;
                            case "RJ":
                                slcUF = "502";
                                break;
                            case "RN":
                                slcUF = "503";
                                break;
                            case "RS":
                                slcUF = "504";
                                break;
                            case "RO":
                                slcUF = "505";
                                break;
                            case "RR":
                                slcUF = "506";
                                break;
                            case "SC":
                                slcUF = "507";
                                break;
                            case "SP":
                                slcUF = "508";
                                break;
                            case "SE":
                                slcUF = "509";
                                break;
                            case "TO":
                                slcUF = "510";
                                break;
                            case "DF":
                                slcUF = "511";
                                break;
                        }

                        if(registry.get(element.parentName + '.' + 'region_id')){
                            registry.get(element.parentName + '.' + 'region_id').value(slcUF ?? '');
                        }
                        if(registry.get(element.parentName + '.' + 'country_id')){
                            registry.get(element.parentName + '.' + 'country_id').value('BR');
                        }

                        var deferred = jquery.Deferred();
                        getPaymentInformationAction(deferred);
                        jquery.when(deferred).done(function () {
                            // isApplied(false);
                            // totals.isLoading(false);
                        });
                    }
                    jquery('body').loader('hide');
                }).error(function(){
                    jquery('body').loader('hide');
                });
            }else{
                jquery('body').loader('hide');
            }

        }
    });
});
