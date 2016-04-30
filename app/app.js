'use strict';

// Declare app level module which depends on views, and components
angular.module('weatherApp', [
  'ngRoute',
  'weatherApp.forecast',
  'weatherApp.weather',
  'weatherApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/forecast'});
}]);
