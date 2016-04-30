'use strict';

angular.module('weatherApp.moment.moment-filter', [])
.filter('moment', [function() {
  return function(date, format) {
      return moment(date).format(format);
  };
}]);
