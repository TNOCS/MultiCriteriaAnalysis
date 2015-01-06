var Helpers;
(function (Helpers) {
    (function (Resize) {
        /**
        * Config
        */
        var moduleName = 'csWeb.resize';

        /**
        * Module
        */
        Resize.myModule;

        try  {
            Resize.myModule = angular.module(moduleName);
        } catch (err) {
            // named module does not exist, so create one
            Resize.myModule = angular.module(moduleName, []);
        }

        /**
        * Directive to resize an element by settings its width or height,
        * for example to make sure that the scrollbar appears.
        * Typical usage:
        * <div style="overflow-y: auto; overflow-x: hidden" resize resize-x="20" resize-y="250">...</div>
        * Load the directive in your module, e.g.
        * angular.module('myWebApp', ['csWeb.resize'])
        */
        Resize.myModule.directive('resize', [
            '$window',
            function ($window) {
                return {
                    terminal: false,
                    // E = elements, A=attributes and C=css classes. Can be compined, e.g. EAC
                    restrict: 'A',
                    // Name if optional. Text Binding (Prefix: @), One-way Binding (Prefix: &), Two-way Binding (Prefix: =)
                    scope: {
                        resizeX: '@',
                        resizeY: '@'
                    },
                    // Directives that want to modify the DOM typically use the link option.link takes a function with the following signature, function link(scope, element, attrs) { ... } where:
                    // * scope is an Angular scope object.
                    // * element is the jqLite wrapped element that this directive matches.
                    // * attrs is a hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
                    link: function (scope, element, attrs) {
                        scope.onResizeFunction = function () {
                            // console.log(scope.resizeX + "-" + scope.resizeY);
                            if (scope.resizeX) {
                                var windowWidth = $window.innerWidth;
                                element.width((windowWidth - scope.resizeX) + 'px');
                            }
                            if (scope.resizeY) {
                                var windowHeight = $window.innerHeight;
                                element.height((windowHeight - scope.resizeY) + 'px');
                            }
                        };

                        // Call to the function when the page is first loaded
                        scope.onResizeFunction();

                        // Listen to the resize event.
                        angular.element($window).bind('resize', function () {
                            scope.onResizeFunction();
                            scope.$apply();
                        });
                    }
                };
            }
        ]);
    })(Helpers.Resize || (Helpers.Resize = {}));
    var Resize = Helpers.Resize;
})(Helpers || (Helpers = {}));
//# sourceMappingURL=Resize.js.map
