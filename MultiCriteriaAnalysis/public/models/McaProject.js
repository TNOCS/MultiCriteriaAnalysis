var Models;
(function (Models) {
    var McaProject = (function () {
        function McaProject() {
            this.criterias = [];
            this.scenarios = [];
            this.solutions = [];
            this.valueSources = [];
        }
        McaProject.prototype.saveToJson = function () {
            return false;
        };

        McaProject.prototype.loadFromJson = function () {
            return false;
        };

        McaProject.prototype.toJson = function () {
            return '';
        };

        McaProject.prototype.fromJson = function (json) {
            return false;
        };
        return McaProject;
    })();
    Models.McaProject = McaProject;
})(Models || (Models = {}));
//# sourceMappingURL=McaProject.js.map
