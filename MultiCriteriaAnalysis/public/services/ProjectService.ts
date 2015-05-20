module Services {
    export class ProjectService {
        public projects           : Models.McaProject[];
        public project            : Models.McaProject;
        public activeCriteria     : Models.Criteria;
        public activeScenario     : Models.Scenario;
        public activeDataSource   : Models.DataSourceViewModel;
        public activeSolution     : Models.Solution;
        public compareToSolutions : Models.Solution[] = [];

        constructor() {
            // TODO Obtain those projects from local storage or GitHub...
            this.projects = [];
            // TODO Remove
            //this.createExampleProject();
            $.ajax({
                url: 'data/DefaultProject.json',
                async: false,
                dataType: 'json',
                success: (response) => {
                    this.createProject(response);
                }
            });
        }

        createExampleProject() {
            var project = Models.McaProject.createExampleProject();
            this.projects.push(project);
            this.project = project;
        }

        createProject(project: Models.McaProject) {
            var parsedProject = new Models.McaProject(project);
            this.projects.push(parsedProject);
            this.project = parsedProject;
        }
    }
}
