var Services;
(function (Services) {
    var ProjectService = (function () {
        function ProjectService() {
            this.project = new Models.McaProject();
        }
        return ProjectService;
    })();
    Services.ProjectService = ProjectService;
})(Services || (Services = {}));
//# sourceMappingURL=ProjectService.js.map
