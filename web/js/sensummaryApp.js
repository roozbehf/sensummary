//   PoC of an AngularJS Application for a Sens Summary Dashboard
//   (c) 2015 Roozbeh Farahbod

var app = angular.module("sensummary", []);

app.controller('sensummaryCtrl', ['$scope', '$http', function($scope, $http){
  const SENSERVER = "http://139.162.152.72:4567";
  var UCHIWA_URL = "http://139.162.151.87/uchiwa/#/client/Site%20PoC"
  var data = {
    nodes: []
  };

  // // code to create sample data
  //
  // const DATA_SIZE = 40;
  // while (data.nodes.length < DATA_SIZE) {
  //   data.nodes.push({
  //     name: "FRA-" + Math.floor((Math.random() * 1000) + 1).toString(),
  //     status: Math.floor((Math.random() * 4)),
  //     url: "http://www.roozbeh.ca",
  //     lastUpdate: "few seconds ago"
  //   })
  // }
  // $scope.data = data;

  $scope.senserver = SENSERVER;

  var notifyDataChange = function() {
    $scope.data = data;
    console.log("All node data is loaded.");
    $scope.$apply();
  };

  var getClients = new Promise(function(resolve, reject) {
    $http.get(SENSERVER + "/clients")
      .success(function(response) {
        for (var ci in response) {
          var cname = response[ci].name;
          var node = {
            name: cname,
            status: -1,
            url: (UCHIWA_URL ? (UCHIWA_URL + "/" + cname) : null),
            lastUpdate: "few seconds ago"
          };
          data.nodes.push(node);
        }
        resolve();
        console.log("Fetched the node list.");
      })
  });

  var getStatus = function () {
    return new Promise(function(resolve, reject) {
      var statusPromises = [];
      for (var ni in data.nodes) {
        statusPromises.push(new Promise(function(sresolve, sreject) {
          var node = data.nodes[ni];
          $http.get(SENSERVER + "/clients/" + node.name + "/history")
            .success(function(checksResponse) {
                node.status = -1;
                for (var cci in checksResponse) {
                  var check = checksResponse[cci];
                  node.status = Math.max(node.status, check.last_status);
                }
                console.log("Fetched node status of '" + node.name + "' as " + node.status);
                sresolve();
            });
        }));
      }
      Promise.all(statusPromises).then(resolve());
    });
  };

  getClients
    .then(getStatus)
    .then(notifyDataChange);

}]);
