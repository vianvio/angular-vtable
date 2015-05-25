'use strict';

angular.module('myApp').controller('vTableSampleCtrl', ['$scope', 'vTalbeSampleApiService',
  function($scope, vTalbeSampleApiService) {
    $scope.arrCheckedId = [];
    $scope.facilityTable = {
      tableId: 'fmTable',
      tableTitles: ['ID', 'Facility Name', 'Longitude', 'Latitude', 'Type'],
      tableWithCheckbox: true,
      tableContents: vTalbeSampleApiService.retrieveVTableSampleData,
      tableColNames: ['id', 'bname', 'longitude', 'latitude', 'range'],
      dataIdColName: 'id',
      needPageNumber: true,
      numPerPage: 4,
      divBase: true,
      defaultSortCol: 'id',
      minColWidth: 50,
      rowChecked: function(bchecked, id) {
        console.log(bchecked);
        console.log(id);
      }
    };
    $scope.meetingTable = {
      tableId: 'meetingTable',
      tableTitles: ['ID', 'first Name', 'last name', 'email', 'country', 'ip'],
      // tableWithCheckbox: true,
      tableContents: vTalbeSampleApiService.retrieveVTableSampleData2,
      tableColNames: ['id', 'first_name', 'last_name', 'email', 'country', 'ip_address'],
      dataIdColName: 'id',
      needPageNumber: false,
      defaultSortCol: 'id',
      sortType: 'local',
      rowChecked: function(bchecked, id) {
        console.log(bchecked);
        console.log(id);
      }
    };

    $scope.nameTable = {
      tableId: 'nameTable',
      tableTitles: ['ID', 'first Name', 'last name', 'email', 'country', 'ip'],
      tableWithCheckbox: true,
      tableContents: vTalbeSampleApiService.retrieveVTableSampleData3,
      tableColNames: ['id', 'first_name', 'last_name', 'email', 'country', 'ip_address'],
      dataIdColName: 'id',
      needPageNumber: true,
      numPerPage: 8,
      sortType: 'server',
      divBase: true,
      colResizable: true,
      defaultSortCol: 'id',
      rowChecked: function(bchecked, id) {
        console.log(bchecked);
        console.log(id);
      }
    };
  }
]);