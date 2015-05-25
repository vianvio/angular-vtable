'use strict';

angular.module("myApp")
  .factory("vTalbeSampleApiService", ['$q', '$http', function($q, $http) {
    var svc = {};

    svc.retrieveVTableSampleData = function(pageNum, rowPerPage) {
      var deferred = $q.defer();

      $http({
          method: 'GET',
          url: 'sample/vTableSample/data.json'
        })
        .success(function(resp) {
          setTimeout(function() {
            deferred.resolve({
              rowCount: 16,
              data: resp.filter(function(item) {
                //fake page number and row per page
                return (item.id > (pageNum - 1) * rowPerPage) && (item.id < pageNum * rowPerPage + 1);
              })
            });
          }, 3000);
        })
        .error(function(resp) {
          deferred.reject(resp);
        });

      return deferred.promise;
    };

    svc.retrieveVTableSampleData2 = function(pageNum, rowPerPage, sortCol, sortReverse) {
      var deferred = $q.defer();

      $http({
          method: 'GET',
          url: 'sample/vTableSample/data2.json'
        })
        .success(function(resp) {
          console.log(resp);
          setTimeout(function() {
            deferred.resolve({
              rowCount: 0,
              data: resp.sort(function(item1, item2) {
                if (sortReverse) {
                  return item1[sortCol] <= item2[sortCol] ? 1 : -1;
                } else {
                  return item1[sortCol] > item2[sortCol] ? 1 : -1;
                }
              })
            });
          }, 3000);
        })
        .error(function(resp) {
          deferred.reject(resp);
        });

      return deferred.promise;
    };

    svc.retrieveVTableSampleData3 = function(pageNum, rowPerPage, sortCol, sortReverse) {
      var deferred = $q.defer();

      $http({
          method: 'GET',
          url: 'sample/vTableSample/data2.json'
        })
        .success(function(resp) {
          setTimeout(function() {
            deferred.resolve({
              rowCount: 20,
              data: resp.sort(function(item1, item2) {
                if (sortReverse) {
                  return item1[sortCol] <= item2[sortCol] ? 1 : -1;
                } else {
                  return item1[sortCol] > item2[sortCol] ? 1 : -1;
                }
              }).filter(function(item, index) {
                //fake page number and row per page
                return ((index + 1) > (pageNum - 1) * rowPerPage) && (index < pageNum * rowPerPage);
              })
            });
          }, 1500);
        })
        .error(function(resp) {
          deferred.reject(resp);
        });

      return deferred.promise;
    };

    return svc;
  }]);