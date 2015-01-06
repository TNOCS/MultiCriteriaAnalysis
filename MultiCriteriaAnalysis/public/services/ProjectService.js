var Services;
(function (Services) {
    var ProjectService = (function () {
        function ProjectService() {
            this.project = new Models.McaProject();
            this.project.createDummy();

            // TODO Obtain those projects from local storage or GitHub...
            this.projects = [this.project];
        }
        return ProjectService;
    })();
    Services.ProjectService = ProjectService;
})(Services || (Services = {}));
//# sourceMappingURL=ProjectService.js.map
