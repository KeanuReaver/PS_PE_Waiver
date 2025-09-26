'use strict';
define(function(require) {
    let module = require('components/UCSD_PE_Waivers/module');
    let $j = require('jquery');

    module.directive('peWaiverDrawer', [function () {
        return {
            restrict: 'A',
            scope: {
                record: '=',
                mainList: '=',
                studentdcid: '=',
                peTeachers: '=',
                studentNumber: '=',
                studentName: '='
            },
            templateUrl: '/scripts/components/UCSD_PE_Waivers/pe_waiver_drawer_template.html',
            controller: [
                    '$scope', '$window', 'peSubmit', 'drawerFunctions', 'formatForOracle', 'notificationService',
                    function ($scope, $window, peSubmit, drawerFunctions, formatForOracle, notificationService) {
                if (typeof initBehaviors === 'function') initBehaviors();

                const originalRecord = angular.copy($scope.record || {});

                $scope.closeDrawerNoSave = function () { closeWithoutSaving(); };
                $scope.saveChanges = function () { saveWaiverWarning(); };

                function saveWaiver() {
                    const args = {
                        start_date: formatForOracle.orDate($scope.record.peStart),
                        end_date:   formatForOracle.orDate($scope.record.peEnd),
                        reason:     $scope.record.reason,
                        comments:   $scope.record.comments || '',
                        author:     $scope.record.author
                    };
                    if (!$scope.record.waiverid) args.studentsdcid = $scope.studentdcid;

                    return peSubmit.writeToPeWaiver(args, $scope.record.waiverid)
                        .then(sendNotifications) // still runs even if it returns a resolved promise
                        .catch(function (err) {
                            console.error('Failed to save record:', err);
                            alert('Failed to save record. Missing Data');
                        })
                        .finally(function () {
                            // Always close the drawer whether notify succeeded or not
                            drawerFunctions.closePEDrawer();
                        });
                }

                function saveWaiverWarning() {
                    const msg = ($scope.record && $scope.record.newRec)
                        ? 'Save new waiver?'
                        : 'Save edits to waiver?';
                    if ($window.confirm(msg)) saveWaiver();
                }

                function closeDrawer() {
                    if ($scope.record && $scope.record.newRec) {
                        $scope.mainList.pop();
                        $scope.record = {};
                    } else {
                        $scope.record = originalRecord;
                    }
                    drawerFunctions.closePEDrawer();
                }

                function closeWithoutSaving() {
                    if ($window.confirm('Close without saving? You will lose all changes.')) {
                        closeDrawer();
                    }
                }

                function sendNotifications() {
                    const teachers = $scope.peTeachers || [];

                    if (teachers.length === 0) {
                        $window.alert('No PE teachers or Counselors found.');
                        return Promise.resolve(); // keep the chain happy
                    }

                    if (!$scope.studentNumber || !$scope.studentName) {
                        // Missing required student identifiers for your GAS endpoint
                        return Promise.resolve();
                    }

                    const change_note = (!$scope.record.waiverid)
                        ? ('A PE waiver has been created for ' + $scope.record.peStart + ' to ' + $scope.record.peEnd + '. Please check PowerSchool for details')
                        : ('A PE waiver has been altered for ' + $scope.record.peStart + ' to ' + $scope.record.peEnd + '. Please check PowerSchool for details');

                    return notificationService.send({
                            title:  'Student PE Waiver Notification',
                            stunum: String($scope.studentNumber),
                            stuname:String($scope.studentName),
                            change: change_note,
                            recip_e: teachers
                        })
                        .then(function () {
                            $window.alert(teachers.join(', ') + ' has/have been notified of Waiver.');
                        })
                        .catch(function (err) {
                            console.error('Failed to notify PE teacher(s):', err);
                            $window.alert('Failed to notify PE teacher(s).');
                        });
                }
            }]
        };
    }]);
});