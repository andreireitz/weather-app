'use strict';

angular.module('weatherApp.weather.serviceWeather', ['webStorageModule'])
.constant('configs', {
    params: {
        units: 'metric',
        lang: 'pt',
        APPID: 'e47b15428edc704fd1c92bd086872a0b'
    },
    cached: false,
    beach: 25,
    initialCity: 'Blumenau',
    url: 'http://api.openweathermap.org/data/2.5/'
})
.factory('serviceWeather', ['$http', '$q', 'webStorage', 'configs', function($http, $q, webStorage, configs) {

    function isWeekend(dt){
        return moment(dt).isoWeekday()>5;
    }

    function cacheIsValid(dt){
        return !moment(dt).isBefore(Date.now(), 'day');
    }

    function getCompleteWeatherByCityName(q){
        var history;

        if(configs.cached){
            history = webStorage.session.get('history') || {};
            if(history[q] && cacheIsValid(history[q].lastUpdate)){
                return $q.when(history[q]);
            }
        }

        return $q.all({
            current: getCurrentByCityName(q),
            forecast: getForecastByCityName(q)
        }).then(function(data){
            data.goBeach = false;
            if(isWeekend(Date.now()) && data.current.main.temp > configs.beach){
                data.goBeach = true;
            }
            for(var i in data.forecast.list){
                var day = data.forecast.list[i];
                if(isWeekend(day.dt) && day.temp.day > configs.beach){
                    data.goBeach = true;
                }
            }

            if(data.current.isFavorite){
                webStorage.session.set('favorite', data);
            }

            if(configs.cached){
                angular.extend(data, {
                    lastUpdate: Date.now()
                });
                history[q] = data;
                webStorage.session.set('history', history);
            }
            return data;
        });
    }

    function getCurrentByCityName(q){
        var favorite = webStorage.session.get('favorite');
        return $http.get(configs.url + 'weather', {
            params: angular.extend({
                q: [q, 'br'].join(',')
            }, configs.params)
        }).then(function(response){
            var data = response.data;
            data.main.temp = Math.floor(data.main.temp);
            data.isFavorite = !!favorite && favorite.current.id == data.id;
            return angular.extend(data, {
                dt: moment().toDate()
            });
        });
    }

    function getForecastByCityName(q) {
        return $http.get(configs.url + 'forecast/daily', {
            params: angular.extend({
                q: [q, 'br'].join(','),
                cnt: 6
            }, configs.params)
        }).then(function(response){
            var data = response.data, now = moment();
            data.goBeach = false;
            data.border = {
                min: {
                    temp: {
                        min: 100
                    }
                },
                max: {
                    temp: {
                        max: -100
                    }
                }
            };
            for(var i in data.list){
                var day = data.list[i];
                day.dt = angular.copy(now.add(1, 'd').toDate());
                if(day.temp.max>data.border.max.temp.max){
                    data.border.max = day;
                }
                if(day.temp.min<data.border.min.temp.min){
                    data.border.min = day;
                }
            }
            return data;
        });
    }


    return {
        getInitialWeather: function(){
            var result = webStorage.session.get('favorite');
            if(result){
                return getCompleteWeatherByCityName(result.current.name);
            }
            return getCompleteWeatherByCityName(configs.initialCity);
        },
        getCompleteWeatherByCityName: getCompleteWeatherByCityName,
        setFavoriteCity: function(result){
            result.current.isFavorite = true;
            webStorage.session.set('favorite', result);
        },
        getFavoriteCity: function(result){
            return webStorage.session.get('favorite');
        }
    };
}]);
