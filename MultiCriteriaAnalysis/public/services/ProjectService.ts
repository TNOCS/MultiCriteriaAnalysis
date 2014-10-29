module Services {
    export class ProjectService {
        public project: Models.McaProject;

        constructor() {
            this.project = new Models.McaProject();
        }
    }
}