app.controller('sensummaryCtrl', ['$scope', function($scope){
  const DATA_SIZE = 40;

  var data = {
    nodes: []
  };

  while (data.nodes.length < DATA_SIZE) {
    data.nodes.push({
      name: "FRA-" + Math.floor((Math.random() * 1000) + 1).toString(),
      status: Math.floor((Math.random() * 4)),
      url: "http://www.roozbeh.ca",
      lastUpdate: "few seconds ago"
    })
  }

  $scope.data = data;
}]);
