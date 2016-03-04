module Models {
    /**
     * Class for writing and reading CSV data.
     */
    export class CsvModel {
        static createCsvTemplate(projectService: Services.ProjectService) {
            if (!projectService || !projectService.hasOwnProperty('project')) return;
            var project = projectService.project;
            var scores = projectService.activeSolution.scores || {};
            var csv: string = CsvModel.createCsvHeader(project);
            var allScenarios = CsvModel.getFlatScenarios(project.scenarios);
            var numberOfScenarios = Object.keys(allScenarios).length;

            project.criterias.forEach(main => {
                if (!main.isEnabled) return;
                main.subCriterias.forEach(sub => {
                    if (!sub.isEnabled || !sub.subCriterias || sub.subCriterias.length === 0) return;
                    csv += `${main.title}; ${sub.title};`;
                    var isFirstModule = true;
                    sub.subCriterias.forEach(subsub => {
                        if (!subsub.isEnabled) return;
                        if (subsub.subCriterias.length > 0) {
                            subsub.subCriterias.forEach(m => {
                                csv += `${isFirstModule ? '' : ';;'}${subsub.title}; ${m.title}; ${CsvModel.optionsAsArray(m)}; ${m.isScenarioDependent ? 'yes' : 'no'};`
                                if (!subsub.isScenarioDependent) {
                                    if (scores.hasOwnProperty(m.id) && (scores[m.id].hasOwnProperty('0'))) {
                                        csv += `${scores[m.id]['0'].value};`;
                                    } else {
                                        csv += `;`;
                                    }
                                } else {
                                    csv += `;`;
                                    if (scores.hasOwnProperty(subsub.id)) {
                                        for (let i = 0; i < numberOfScenarios; i++) {
                                            csv += `${scores[subsub.id].hasOwnProperty(Object.keys(allScenarios)[i]) ? scores[subsub.id][Object.keys(allScenarios)[i]].value + ';' : ';'}`;
                                        }
                                    }
                                }
                                csv += `\r\n`;
                                isFirstModule = false;
                            });
                        } else {
                            // in case of no sub-sub-criteria
                            csv += `${isFirstModule ? '' : ';;'}; ${subsub.title}; ${CsvModel.optionsAsArray(subsub)}; ${subsub.isScenarioDependent ? 'yes' : 'no'};`
                            if (!subsub.isScenarioDependent) {
                                if (scores.hasOwnProperty(subsub.id) && (scores[subsub.id].hasOwnProperty('0'))) {
                                    csv += `${scores[subsub.id]['0'].value};`;
                                } else {
                                    csv += `;`;
                                }
                            } else {
                                csv += `;`;
                                if (scores.hasOwnProperty(subsub.id)) {
                                    for (let i = 0; i < numberOfScenarios; i++) {
                                        csv += `${scores[subsub.id].hasOwnProperty(Object.keys(allScenarios)[i]) ? scores[subsub.id][Object.keys(allScenarios)[i]].value + ';' : ';'}`;
                                    }
                                }
                            }
                            csv += `\r\n`;
                            isFirstModule = false;
                        }
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
            header += `Main criteria; Sub criteria; Sub sub criteria; Module; Options; Uses scenario; Generic effect (no scenario); ${CsvModel.scenariosAsString(project)}\r\n`;
            return header;
        }

        /**
         * Print the scenarios as string.
         * @method scenariosAsString
         * @param  {McaProject}      project [description]
         * @return {string}                  [description]
         */
        private static scenariosAsString(project: McaProject): string {
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

        private static scenarioAsStringRecursively(scenario: Scenario, scenarios: Models.Scenario[]): Scenario[] {
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
         * Recursive walk through scenarios and at them to a flat array
         */
        private static getFlatScenarios(scenarios: Scenario[], flatScenarios: { [key: string]: Scenario } = {}): { [key: string]: Scenario } {
            scenarios.forEach((s) => {
                if (s.hasSubs()) {
                    CsvModel.getFlatScenarios(s.subScenarios, flatScenarios);
                } else {
                    flatScenarios[s.id] = s;
                }
            });
            return flatScenarios;
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
