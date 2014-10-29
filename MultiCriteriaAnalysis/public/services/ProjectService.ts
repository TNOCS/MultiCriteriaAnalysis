module Services {
    export class ProjectService {
        public project: Models.McaProject;
        public activeSolution: Models.Solution;

        constructor() {
            this.project = new Models.McaProject();
        }
    }
}