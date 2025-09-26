'use strict';
define([
    'angular',
    'components/shared/index',
    'components/angular_libraries/notification_service'
], function(angular) {
    return angular.module('peWaiversModule', [
        'powerSchoolModule',
        'ngSanitize',
        'notificationServiceModule'
    ]);
});