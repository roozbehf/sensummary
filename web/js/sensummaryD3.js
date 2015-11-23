//   PoC of an D3 View for a Sens Summary Dashboard
//   (as an AngularJS directive)
//
//   (c) 2015 Roozbeh Farahbod
//   Thanks to Gregory Hilkert (http://blog.ideahaven.co) for his good tutorial on D3 and AngularJS

app.directive('sensuNodes', ['$window', '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'E',
      scope: {
        data: '=',
        senserver: '=',
        label: '@',
        onClick: '&'
      },
      link: function(scope, ele, attrs) {
          var svg,
            bubbleRadius = 30,
            defaultWidth, defaultHeight,
            width, height;

          $window.onresize = function() {
            scope.$apply();
          };

          scope.$watch(function() {
            return angular.element($window)[0].innerWidth;
          }, function() {
            scope.render(scope.data);
          });

          scope.$watch('data', function(newData) {
            scope.render(newData);
          }, true);

          scope.render = function(data) {
            if (!data) return;

            if (!svg) {
              defaultWidth = 1.7 * Math.sqrt(bubbleRadius * bubbleRadius * scope.data.nodes.length);
              defaultHeight = defaultWidth;

              width = defaultWidth;
              height = defaultHeight;

              svg = d3.select(ele[0])
                .append('svg')
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("class", "bubble");
            }

            svg.selectAll('*').remove();

            var force = d3.layout.force()
              .nodes(d3.values(data.nodes))
              .gravity(0.5)
              .distance(30)
              .charge(-7 * bubbleRadius)
              .size([width, height])
              .start();

            force.linkDistance(width/2);

            var node = svg.selectAll(".node")
              .data(data.nodes)
              .enter()
              .append("g")
              .attr("class", "node")
              .call(force.drag);

            var toolTip = function(d) {
              var statusReport;
              switch (d.status) {
                case 0:
                  statusReport = "<span style='color: green' class='glyphicon glyphicon-ok-sign'></span>";
                  break;

                case 1:
                  statusReport = "<span style='color: yellow' class='glyphicon glyphicon-exclamation-sign'></span>";
                  break;

                case 2:
                  statusReport = "<span style='color: red' class='glyphicon glyphicon-remove-sign'></span>";
                  break;

                default:
                  statusReport = "<span class='glyphicon glyphicon-question-sign'></span>"
              }
              return statusReport + " " + d.name
                        + "<br><span style='color: #888888' class='glyphicon glyphicon-refresh'></span> "
                        + "<span class='updatetime'>updated " + d.lastUpdate + "</span>";
            };

            var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(toolTip);

            node.call(tip);

            var nodeBubble = function (d) {
              switch (d.status) {
                case 0: return "img/circle-green.svg";
                case 1: return "img/circle-yellow.svg";
                case 2: return "img/circle-red.svg";
                default: return "img/circle-grey.svg";
              }
            };

            node.append("image")
              .attr("xlink:href", nodeBubble)
              .attr("x", -12)
              .attr("y", -12)
              .attr("width", bubbleRadius)
              .attr("height", bubbleRadius)
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide)
              .on('dblclick', function (d) {
                if (d.url != null) {
                  window.open(d.url, '_blank');
                }
              });

            // node.append("text")
            //   .attr("dx", 12)
            //   .attr("dy", ".35em")
            //   .attr("class", "textdata")
            //   .text(function(d) { return d.name; });

            force.on("tick", function() {
              node.attr("transform", function(d) {
                return "translate(" + d.x + ", " + d.y + ")";
              })
            });


          };
      }}
}])
