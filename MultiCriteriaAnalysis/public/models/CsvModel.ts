module Models {
    /**
     * Class for writing and reading CSV data.
     */
    export class CsvModel {
        static createCsvTemplate(project: McaProject) {
            var csv: string = CsvModel.createCsvHeader(project);

            project.criterias.forEach(main => {
                if (!main.isEnabled) return;
                main.subCriterias.forEach(sub => {
                    if (!sub.isEnabled || !sub.subCriterias || sub.subCriterias.length === 0) return;
                    csv += `${main.title}; ${sub.title};`;
                    var isFirstModule = true;
                    sub.subCriterias.forEach(m => {
                        if (!m.isEnabled) return;
                        csv += `${isFirstModule ? '' : ';;'} ${m.title}; ${CsvModel.optionsAsArray(m)}; ${m.isScenarioDependent ? 'yes' : 'no'}\r\n`;
                        isFirstModule = false;
                    });

                });
            });
            // Replace escaped HTML characters.
            return csv.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }

        /**
         * Create a project header.
         * @method createCsvHeader
         * @param  {McaProject}    project [description]
         * @return {[type]}                [description]
         */
        private static createCsvHeader(project: McaProject) {
            var header: string = '';

            header += `Project; ${project.title}; ${project.id}\r\n\r\n`;
            header += `Main criteria; Sub criteria; Module; Options; Uses scenario; Generic effect (no scenario); ${CsvModel.scenariosAsString(project)}\r\n`;
            return header;
        }

        /**
         * Print the scenarios as string.
         * @method scenariosAsString
         * @param  {McaProject}      project [description]
         * @return {[type]}                  [description]
         */
        private static scenariosAsString(project: McaProject) {
            var scenarios: Models.Scenario[] = [];
            project.scenarios.forEach(s => {
                if (s.subScenarios && s.subScenarios.length > 0) {
                    CsvModel.scenarioAsStringRecursively(s, scenarios);
                } else {
                    scenarios.push(s);
                }
            });
            return scenarios.map(s => s.title).join('; ');
        }

        private static scenarioAsStringRecursively(scenario: Scenario, scenarios: Models.Scenario[]) {
            scenario.subScenarios.forEach(s => {
                if (s.subScenarios && s.subScenarios.length > 0) {
                    CsvModel.scenarioAsStringRecursively(s, scenarios);
                } else {
                    scenarios.push(s);
                }
            });
            return scenarios;
        }

        /**
         * Returns the allowable options as a comma separated list
         * @method optionsAsArray
         * @param  {Criteria}     m [description]
         * @return {[type]}         [description]
         */
        private static optionsAsArray(m: Criteria) {
            var str: string = '';
            m.options.forEach(o => {
                str += `${o.title} (${o.value}), `;
            });
            // strip final ', '
            return str.length > 0 ? str.slice(0, -2) : '';
        }
    }
}
