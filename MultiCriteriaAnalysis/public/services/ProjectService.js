var Services;
(function (Services) {
    var ProjectService = (function () {
        function ProjectService() {
            // TODO Obtain those projects from local storage or GitHub...
            this.projects = [];
            // TODO Remove
            this.createExampleProject();
        }
        ProjectService.prototype.createExampleProject = function () {
            var project = Models.McaProject.createExampleProject();
            this.projects.push(project);
            this.project = project;
        };
        return ProjectService;
    })();
    Services.ProjectService = ProjectService;
})(Services || (Services = {}));
//# sourceMappingURL=ProjectService.js.map