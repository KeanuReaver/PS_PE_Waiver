'use strict';
define(function(require) {
    let module = require('components/UCSD_PE_Waivers/module');
    let $j = require('jquery');

    module.directive('peWaiverDrawer', [function() {
        return {
            restrict: 'A',
            scope: {
                record: '=',
                mainList: '=',
                studentdcid: '='
            },
            templateUrl: '/scripts/components/UCSD_PE_Waivers/pe_waiver_drawer_template.html',
            controller: ['$scope', '$window', 'peSubmit', 'drawerFunctions', 'formatForOracle', function($scope, $window, peSubmit, drawerFunctions, formatForOracle) {
                initBehaviors();
                const originalRecord = angular.copy($scope.record);

                function saveWaiver() {
                    const args = {
                        start_date: formatForOracle.orDate($scope.record.peStart),
                        end_date: formatForOracle.orDate($scope.record.peEnd),
                        reason: $scope.record.reason,
                        comments: $scope.record.comments || '',
                        author: $scope.record.author
                    }
                    if (!$scope.record.waiverid) args.studentsdcid = $scope.studentdcid;

                    peSubmit.writeToPeWaiver(args, $scope.record.waiverid)
                        .catch(error => {
                            console.error('Failed to save record:', error);
                        })
                        .then(() => {
                            drawerFunctions.closePEDrawer();
                        });
                }

                function saveWaiverWarning() {
                    let conMes = ''

                    if (!!$scope.record.newRec) {
                        conMes = 'Save new waiver?'
                    } else {
                        conMes = 'Save edits to waiver?'
                    }

                    let confirmation = $window.confirm(conMes);

                    if (confirmation) {
                        saveWaiver();
                    } 
                }

                function closeDrawer() {
                    if (!!$scope.record.newRec) {
                        $scope.mainList.pop();
                        $scope.record = {};
                    } else {
                        $scope.record = originalRecord;
                    }
                    drawerFunctions.closePEDrawer();
                }

                function closeWithoutSaving() {
                    let confirmation = $window.confirm('Close without saving? You will lose all changes.')
                    if (confirmation) {
                        closeDrawer();
                    }
                }

                $scope.closeDrawerNoSave = function() {
                    closeWithoutSaving()
                }

                $scope.saveChanges = function() {
                    saveWaiverWarning();
                }
            }]
        };
    }]);
});