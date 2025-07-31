'use strict';
define(function(require) {
    const module = require('components/UCSD_PE_Waivers/module');
    const $j = require('jquery');

    module.factory('getData', ($http) => {
        return {
            getAPIData: function(dataSource) {
                return $http(dataSource).then(function successCallback(response) {
                    return response.data;
                },
                function errorCallback(response) {
                    console.error('Status Code:', response.status);
                    // alert('API call failed. Check console log for further details: ' + response.data.message);
                    throw response;
                });
            },
            getTList: function(path) {
                return $j.ajax({
                    'method': 'get',
                    'url': path,
                    'dataType': 'json',
                    success: response => {
                        return response;
                    },
                    error: error => {
                        throw error;
                    }
                })
            }
        }
    })
    .factory('drawerFunctions', () => {
        return {
            openPEDrawer: function(width = '40%') {
                $j('#pe-overlay').fadeIn();
                $j('#pe-drawer').animate({ width: width, minWidth: '550px' }, 500);
                $j('body').css('overflow-y', 'hidden');
            },
            closePEDrawer: function() {
                $j('#pe-overlay').fadeOut();
                $j(`#pe-drawer`).animate({ width: '0', minWidth: '0' }, 500);
                $j('body').css('overflow-y', 'auto');
            },
        }
    })
    .factory('peSubmit', (getData) => {
        function writeToTable(path, method, args, parameters = '', orderby = '') {
            const params = orderby !== '' ? `?pagesize=0&order=${orderby}` : '?pagesize=0';
            if (parameters && Object.keys(parameters).length > 0) {
                const urlParams = new URLSearchParams(parameters);
                params += '&' + urlParams.toString();
            }

            const requestData = {
                "method": method,
                "url": path + params,
                "headers": {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            }

            if (args && Object.keys(args).length > 0) {
                requestData["data"] = JSON.stringify(args);
            }
            return getData.getAPIData(requestData)
                .catch(error => {
                    throw error;
                });
        }

        function payLoad(args, address, id = null) {
            const tablename = address.match(/\/table\/([^/]+)/)[1],
                path = `${address}${id ? `/${id}` : ''}`,
                method = id ? 'PUT' : 'POST',
                payload = {
                    'tables': {
                        [tablename]: args
                    }
                };

            return writeToTable(path, method, payload)
                .catch(error => {
                    throw error;
                });
        }
        return {
            writeToPeWaiver: function(args, id = null) {
                const path = '/ws/schema/table/u_ucsd_pe_waiver';
                return payLoad(args, path, id)
                    .catch(error => {
                        throw error;
                    });
            }
        }
    })
    .factory('formatForOracle', () => {
        return {
            orDate: function(dateString) {
                let new_date = new Date(dateString);
                return (dateString) ? `${new_date.getFullYear()}-${String(new_date.getMonth() + 1).padStart(2, '0')}-${String(new_date.getDate()).padStart(2, '0')}` : '';
            }
        }
    })
    .factory('deleteWaiver', ($http) => {
        return {
            deleteWaiver: function(path, id) {
                return $http({
                    "url": path + id,
                    "method": "DELETE",
                    "headers": {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                }).then(function successCallback(response) {
                    return response;
                },
                function errorCallback(response) {
                    $log.error('Status Code:', response.status);
                    throw response;
                });
            }
        }
    });
});