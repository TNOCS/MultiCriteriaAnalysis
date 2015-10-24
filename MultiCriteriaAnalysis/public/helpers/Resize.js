var Helpers;
(function (Helpers) {
    var Resize;
    (function (Resize) {
        var moduleName = 'csWeb.resize';
        try {
            Resize.myModule = angular.module(moduleName);
        }
        catch (err) {
            Resize.myModule = angular.module(moduleName, []);
        }
        Resize.myModule.directive('resize', ['$window',
            function ($window) {
                return {
                    terminal: false,
                    restrict: 'A',
                    scope: {
                        resizeX: '@',
                        resizeY: '@'
                    },
                    link: function (scope, element, attrs) {
                        scope.onResizeFunction = function () {
                            if (scope.resizeX) {
                                var windowWidth = $window.innerWidth;
                                element.width((windowWidth - scope.resizeX) + 'px');
                            }
                            if (scope.resizeY) {
                                var windowHeight = $window.innerHeight;
                                element.height((windowHeight - scope.resizeY) + 'px');
                            }
                        };
                        scope.onResizeFunction();
                        angular.element($window).bind('resize', function () {
                            scope.onResizeFunction();
                            scope.$apply();
                        });
                    }
                };
            }
        ]);
    })(Resize = Helpers.Resize || (Helpers.Resize = {}));
})(Helpers || (Helpers = {}));
