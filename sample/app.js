'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'vTable'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/vTableSample', {
      templateUrl: 'sample/vTableSample/vTableSample.html',
      controller: 'vTableSampleCtrl'
    }).otherwise({
      redirectTo: '/vTableSample'
    });
}]);