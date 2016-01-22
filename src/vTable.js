'use strict';

/* Directives */

angular.module('vTable', [])
  .run(['$templateCache', function($templateCache) {
    $templateCache.put('src/vTable.html',
      '<div ng-if=\'!tconfig.divBase\' class=\"holder-vTable {{tconfig.tableId}}-body-height\">' +
      '<table id=\"tableContactList\" class=\"table table-striped table-bordered table-hover no-margin\">' +
      '<thead>' +
      '<tr>' +
      '<td class=\'{{tconfig.tableId}}-col-checkbox text-center\' ng-if=\'tconfig.tableWithCheckbox\'>' +
      '<input type=\'checkbox\' ng-checked=\'chkAllChecked\' ng-click=\'allChecked()\' />' +
      '</td>' +
      '<td class=\'text-center vTable-col vTable-head-cursor {{tconfig.tableId}}-col-{{tconfig.tableColNames[$index]}} {{tconfig.tableId}}-col-head-{{tconfig.tableColNames[$index]}}\' ng-repeat=\'tableTitle in tconfig.tableTitles\' ng-click=\'setSortCol(tconfig.tableColNames[$index], $event)\'>{{tableTitle}}</td>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr ng-repeat=\'content in realData | orderBy:sortCol:sortReverse\'>' +
      '<td class=\'text-center\' ng-if=\'tconfig.tableWithCheckbox\'>' +
      '<input type=\'checkbox\' ng-checked=\'content.checked\' ng-click=\'rowChecked(content[tconfig.dataIdColName])\' />' +
      '</td>' +
      '<td ng-repeat=\'colName in tconfig.tableColNames\'>{{content[colName]}}</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '<div ng-if=\'tconfig.divBase\' class=\'vTable-thead {{tconfig.tableId}}-thead col-md-12 no-padding position-relative\'>' +
      '<div class=\'vTable-col-checkbox {{tconfig.tableId}}-col-head-checkbox\' ng-if=\'tconfig.tableWithCheckbox\'>' +
      '<input type=\'checkbox\' ng-checked=\'chkAllChecked\' ng-click=\'allChecked()\' />' +
      '</div>' +
      '<div resizable resize-col=\'{{$index}}\' ng-repeat=\'tableTitle in tconfig.tableTitles\' class=\'vTable-col position-relative vTable-resize vTable-head-cursor {{tconfig.tableId}}-col-{{tconfig.tableColNames[$index]}} {{tconfig.tableId}}-col-head-{{tconfig.tableColNames[$index]}} {{$last ? \"vTable-col-last\" : \"\"}} {{tconfig.colResizable ? \"\" : \"vTable-unresizable\"}}\' ng-mousedown=\'getMouseDownPosition($event)\' ng-click=\'setSortCol(tconfig.tableColNames[$index], $event)\'>{{tableTitle}}</div>' +
      '</div>' +
      '<div ng-if=\'tconfig.divBase\' class=\'vTable-tbody col-md-12 no-padding {{tconfig.tableId}}-body-height position-relative\'>' +
      '<div class=\'vTable-tr col-md-12 no-padding position-relative\' ng-repeat=\'content in realData | orderBy:sortCol:sortReverse\'>' +
      '<div class=\'text-center vTable-col-checkbox {{tconfig.tableId}}-col-checkbox\' ng-if=\'tconfig.tableWithCheckbox\' ng-class=\'getColWidth(\"checkbox\")\'>' +
      '<input type=\'checkbox\' ng-checked=\'content.checked\' ng-click=\'rowChecked(content[tconfig.dataIdColName])\' />' +
      '</div>' +
      '<div resizable resize-col=\'{{$index}}\' ng-repeat=\'colName in tconfig.tableColNames\' class=\'vTable-col position-relative vTable-resize {{tconfig.tableId}}-col-{{colName}} {{$last ? \"vTable-col-last\" : \"\"}} {{tconfig.colResizable ? \"\" : \"vTable-unresizable\"}}\' ng-style=\'getColWidth(colName, $last)\'>{{content[colName]}}</div>' +
      '</div>' +
      '</div>' +
      '<div class=\'pull-left col-md-12 no-padding {{tconfig.tableId}}-page-number\' ng-if=\'tconfig.needPageNumber\'>' +
      '<nav>' +
      '<ul class=\'pagination no-margin\'>' +
      '<li><a href=\'\' ng-click=\'turnPage(0)\'>&laquo;</a></li>' +
      '<li ng-repeat=\'index in arrPageNum\' ng-class=\'index === currentPageNum ? \"active\" : \"\"\'><a href=\'\' ng-click=\'turnPage(index)\'>{{index}}</a></li>' +
      '<li><a href=\'\' ng-click=\'turnPage(-1)\'>&raquo;</a></li>' +
      '</ul>' +
      '</nav>' +
      '</div>' +
      '<div style=\'clear:both;\'></div>');
  }])
  .directive('vtable', ['$window', function($window) {
    return {
      restrict: 'E',
      scope: {
        tconfig: '='
      },
      link: function(scope, element, attrs, ctrl) {
        var maxPageNumber = 1;
        var newPageNumber = 1;

        var _localSort = function(sortCol) {
          if (scope.sortCol === sortCol) {
            scope.sortReverse = !scope.sortReverse;
          } else {
            scope.sortReverse = false;
            scope.sortCol = sortCol;
          }
        };

        scope.realData = [];
        scope.sortCol = scope.tconfig.defaultSortCol;
        scope.mouseDownPosition = -1;

        angular.element($window).bind('resize', function() {
          // make columns responsive
          scope.$evalAsync(function() {
            // recover the head bar as flex, so it will responsive
            angular.element('.' + scope.tconfig.tableId + '-thead').css({
              display: 'flex'
            });
            // clear style of heads, will init the col with as css defined.
            // otherwise the width will not be responsive
            scope.tconfig.tableColNames.forEach(function(colName) {
              angular.element('.' + scope.tconfig.tableId + '-col-head-' + colName).removeAttr('style');
            });
          });
        });

        scope.getMouseDownPosition = function(e) {
          scope.mouseDownPosition = (e.offsetX || e.clientX - $(e.target).offset().left + window.pageXOffset);
        };

        scope.setSortCol = function(sortCol, e) {
          // if server sort
          // calculate offsetx for firefox. why no offsetX in firefox !!!! Even ie has it!
          var _offsetX = (e.offsetX || e.clientX - $(e.target).offset().left + window.pageXOffset);
          if (!scope.tconfig.divBase || !scope.tconfig.colResizable || (scope.mouseDownPosition < e.target.offsetWidth - 7 && _offsetX < e.target.offsetWidth - 7)) {
            if (scope.tconfig.sortType === 'server') {
              var _sortReverse = false;
              if (scope.sortCol === sortCol) {
                var _sortReverse = !scope.sortReverse;
              }
              scope.tconfig.tableContents(scope.currentPageNum, scope.tconfig.numPerPage, sortCol, _sortReverse).then(function(rawData) {
                scope.realData = rawData.data;
                scope.chkAllChecked = false;
                _localSort(sortCol);
              });
            } else {
              _localSort(sortCol);
            }
          }
        };

        scope.rowChecked = function(id) {
          var _bAllChecked = true;
          // set id checked
          scope.realData.forEach(function(item) {
            if (item[scope.tconfig.dataIdColName] === id) {
              // check if checked
              item.checked = !item.checked;
              if (!item.checked) {
                // anyone unchecked, then uncheck all
                scope.chkAllChecked = false;
              }
              scope.tconfig.rowChecked(item.checked, id);
            }
            if (!item.checked) {
              _bAllChecked = false;
            }
          });
          scope.chkAllChecked = _bAllChecked;
        };

        scope.allChecked = function() {
          // check what have not been checked, and fire the rowChecked(id) function
          scope.realData.forEach(function(item) {
            if (!scope.chkAllChecked) {
              if (!item.checked) {
                // check those unchecked
                item.checked = true;
                scope.tconfig.rowChecked(true, item[scope.tconfig.dataIdColName]);
              }
            } else {
              // all uncheck
              item.checked = false;
              scope.tconfig.rowChecked(false, item[scope.tconfig.dataIdColName]);
            }
          });
          scope.chkAllChecked = !scope.chkAllChecked;
        };

        scope.getColWidth = function(colName, bLast) {
          // get rid of the scroll bar of windows!!!
          if (!bLast) {
            return {
              // as we need to allow users to set flex both for head and col
              // so set flex value of tr as none, but leave the last one
              // so the last one will auto fit the width even there is a scrollbar
              flex: 'none',
              width: angular.element('.' + scope.tconfig.tableId + '-col-head-' + colName)[0].offsetWidth + 'px'
            };
          } else {
            return {
              flex: 1
            }
          }
        };

        //create page number bar
        scope.currentPageNum = 1;
        //if the table owner want to refresh the number bar each time. he can call this inner method.
        scope.refreshPageNum = function(pageNumber) {
          scope.currentPageNum = pageNumber;
          scope.tconfig.tableContents(pageNumber, scope.tconfig.numPerPage, scope.sortCol, scope.sortReverse).then(function(rawData) {
            /*
                raw data need at least two parts: array of data, total number of 
              rows 
            */
            // init
            scope.arrPageNum = [];
            scope.chkAllChecked = false;
            scope.tconfig.numPerPage = scope.tconfig.numPerPage === 0 ? 1 : scope.tconfig.numPerPage;
            maxPageNumber = Math.ceil(rawData.rowCount / scope.tconfig.numPerPage);
            scope.maxPageNumber = maxPageNumber;
            // may have some cases that $promise don't return with a property data
            if (rawData.data) {
              scope.realData = rawData.data;
            } else {
              scope.realData = rawData;
            }

            // set page number bar
            for (var i = 1; i <= maxPageNumber; i++) {
              scope.arrPageNum.push(i);
            }
          });
        };

        scope.turnPage = function(pageNumber) {
          if (pageNumber === 0 && newPageNumber > 1) {
            //go back one page
            newPageNumber = newPageNumber - 1;
            scope.refreshPageNum(newPageNumber);
          } else if (pageNumber === -1 && newPageNumber < maxPageNumber) {
            //go forward one page
            newPageNumber = newPageNumber + 1;
            scope.refreshPageNum(newPageNumber);
          } else if (pageNumber > 0) {
            newPageNumber = pageNumber;
            scope.refreshPageNum(newPageNumber);
          }
          scope.currentPageNum = newPageNumber;
        }

        // initial call
        scope.refreshPageNum(scope.currentPageNum);
      },
      templateUrl: 'src/vTable.html'
    }
  }])
  .directive('resizable', ['$document', function($document) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        var _initWidth = function() {
          scope.tconfig.tableColNames.forEach(function(colName, index) {
            if (index !== scope.tconfig.tableColNames.length - 1) {
              angular.element('.' + scope.tconfig.tableId + '-col-head-' + colName).css({
                flex: 'none',
                width: angular.element('.' + scope.tconfig.tableId + '-col-head-' + colName)[0].offsetWidth + 'px'
              });
            } else {
              // leave the last one flex as the original value
              // then it will get the exact px value after all ele before are stable
              // this can fix the firefox display issue
              // because the with in firefox is all int!!!!! why not decimal!!!!!
              angular.element('.' + scope.tconfig.tableId + '-col-head-' + colName).css({
                width: angular.element('.' + scope.tconfig.tableId + '-col-head-' + colName)[0].offsetWidth + 'px'
              });
            }
          });
          // as we have record all the width, make it block then we can change the width
          angular.element('.' + scope.tconfig.tableId + '-thead').css({
            display: 'block'
          });
        };

        scope.tconfig.minColWidth = parseInt(scope.tconfig.minColWidth) >= 0 ? parseInt(scope.tconfig.minColWidth) : 50;
        var startX = 0,
          x = 0,
          defaultWidthCol1 = 0,
          defaultWidthCol2 = 0;

        var fnMousemove = function(event) {
          x = event.pageX - startX;
          if (defaultWidthCol2 - x >= scope.tconfig.minColWidth && defaultWidthCol1 + x >= scope.tconfig.minColWidth) {
            angular.element('.' + scope.tconfig.tableId + '-col-' + scope.tconfig.tableColNames[(parseInt(attrs.resizeCol) + 1)]).css({
              "width": (defaultWidthCol2 - x) + 'px'
            });
            angular.element('.' + scope.tconfig.tableId + '-col-' + scope.tconfig.tableColNames[parseInt(attrs.resizeCol)]).css({
              "width": (defaultWidthCol1 + x) + 'px'
            });
          }
        };

        var fnMouseup = function() {
          $document.unbind('mousemove', fnMousemove);
          $document.unbind('mouseup', fnMouseup);
        };

        elem.on('mousedown', function(event) {
          _initWidth();
          var _offsetX = (event.offsetX || event.pageX - $(event.target).offset().left);
          scope.mouseDownPosition = _offsetX;
          if (scope.tconfig.colResizable && (scope.mouseDownPosition >= event.target.offsetWidth - 7 || _offsetX >= event.target.offsetWidth - 7)) {
            x = 0;
            event.preventDefault();
            startX = event.pageX - x;
            defaultWidthCol1 = parseInt(angular.element('.' + scope.tconfig.tableId + '-col-' + scope.tconfig.tableColNames[parseInt(attrs.resizeCol)]).css('width'));
            defaultWidthCol2 = parseInt(angular.element('.' + scope.tconfig.tableId + '-col-' + scope.tconfig.tableColNames[(parseInt(attrs.resizeCol) + 1)]).css('width'));
            $document.on('mousemove', fnMousemove);
            $document.on('mouseup', fnMouseup);
          }
        });
      }
    }
  }]);
