'use strict';

angular.module('weatherApp.forecast', [
    'ngRoute',
    'ngMessages',
    'chart.js',
    'weatherApp.moment.moment-filter',
    'weatherApp.weather.serviceWeather'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/forecast', {
        templateUrl: 'views/forecast/daily.html',
        controller: 'DailyForecastCtrl',
        controllerAs: 'self'
    });
}])

.controller('DailyForecastCtrl', [
    '$scope',
    'serviceWeather',
    function($scope, serviceWeather) {
        var self = this;

        self.loading = true;
        self.search = '';
        self.variation = {
            data: [[]],
            series: ['Máxima', 'Mínima'],
            labels: []
        };
        self.favorite = function() {
            serviceWeather.setFavoriteCity(self.data);
        };
        self.searchCity = function() {
            serviceWeather.getCompleteWeatherByCityName(self.search)
                .then(processResponseWeather)
                .finally(stopLoading);
        };

        serviceWeather.getInitialWeather()
            .then(processResponseWeather)
            .finally(stopLoading);

        function processResponseWeather(response) {
            self.data = response;
            self.variation.data = [[],[]];
            self.variation.labels = [];
            for(var i in response.forecast.list){
                var day = response.forecast.list[i];
                self.variation.labels.push(moment(day.dt).format('ddd'));
                self.variation.data[0].push(day.temp.max);
                self.variation.data[1].push(day.temp.min);
            }
        }

        function stopLoading() {
            self.loading = false;
        }
    }
]);
