'use strict';
define(function(require) {
    const module = require('components/UCSD_PE_Waivers/module');
    const $j = require('jquery');

    module.controller('PhysEdMainController', ['$scope', '$window', 'getData', 'drawerFunctions', 'deleteWaiver', function($scope, $window, getData, drawerFunctions, deleteWaiver) {
        $scope.studentdcid;     // init value
        $scope.author;          // init value
        $scope.studentNumber;   // init value
        $scope.studentName;     // init value

        const waiverPath = '/admin/students/pe_queries/peWaiver.json';
        const peTeacherPath = '/admin/students/pe_queries/getPETeacher.json';

        $scope.waiverList = [];
        $scope.currentRecord = {};
        $scope.peteachers = [];

        function getWaivers() {
            initBehaviors();
            
            const formatDate = (date) => {
                // console.log(date);
                const jsDate = date 
                    ? new Date(date) 
                    : null;
                // console.log(jsDate);    
                if (!!jsDate) {
                    const year = jsDate.getFullYear();
                    const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
                    const day = jsDate.getDate().toString().padStart(2, '0');
                    
                    return `${month}/${day}/${year}`;
                } 
                return date;    
            }
            
            getData.getTList(`${waiverPath}?studentdcid=${$scope.studentdcid}`)
                .then(response => {
                    const fResp = response.filter(obj => Object.keys(obj).length !== 0);
                    $scope.waiverList = fResp.map(record => {
                        return {
                            waiverid: record.waiverid,
                            peStart: formatDate(record.peStart) || record.peStart,
                            peEnd: formatDate(record.peEnd) || record.peEnd,
                            reason: record.reason,
                            comments: record.comments,
                            author: record.author
                        }
                    }).sort((a, b) => new Date(b.peStart) - new Date(a.peStart));
                    // console.log($scope.waiverList);
                    $scope.$apply();
                })
                .catch(error => {
                    console.error('Failed to get waiverList:', error);
                });
        }

        function getPETeachers() {
            getData.getTList(peTeacherPath)
                .then(response => {
                    const data = response.filter(obj => Object.keys(obj).length !== 0);
                    $scope.peteachers = data.map(rec => rec.email_addr);
                    // console.log($scope.peteachers);
                })
                .catch(error => {
                    console.error('Failed to get PE teachers:', error);
                });
        }
        
        function aktuallyDelete(record) {
            if (!!record.newRec) {
                const index = $scope.waiverList.indexOf(record);
                if (index !== -1) {
                    $scope.waiverList.splice(index, 1);
                }
            } else if (!!record.waiverid) {
                // console.log('this ran')
                deleteWaiver.deleteWaiver('/ws/schema/table/u_ucsd_pe_waiver/', record.waiverid)
                    .then(response => {
                        console.log(response);
                    })
                    .catch(error => {
                        console.error('Failed to delete record:', error);
                    })
                    .finally(() => {
                        getWaivers();
                    });
            }
        }

        $j(() => {
            getWaivers();
            getPETeachers();
        });

        $scope.closePEDrawer = function() {
            drawerFunctions.closePEDrawer();
        }

        $scope.openPEDrawer = function(record = {}) {
            if (Object.keys(record).length > 0) {
                $scope.currentRecord = record;
            } else {
                const newRecord = {
                    author: $scope.author || '',
                    newRec: true
                };
                $scope.currentRecord = newRecord;
                $scope.waiverList.push(newRecord);
            }
            drawerFunctions.openPEDrawer();
        }
        
        $scope.deleteWaiver = function(record) {
            let confirmation = $window.confirm('Are you sure you want to remove or delete this record permanenetly?');
            
            if (confirmation) {
                aktuallyDelete(record);
            }
        }
    }]);
});