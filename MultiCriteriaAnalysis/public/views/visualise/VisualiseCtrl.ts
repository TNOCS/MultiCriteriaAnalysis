module Visualise {
    declare var Cesium: any;

    export interface IVisualiseScope extends ng.IScope {
        vm: VisualiseCtrl;
    }

    export interface XYZ {
        x: number;
        y: number;
        z: number;
    }

    /** Interface to describe a building block */
    export interface IBuildingBox {
        guid:   string;
        name:   string;
        oid:    number;
        min:    XYZ;
        max:    XYZ;
        color?: any;
        score?: number;
    }

    export class SelectedModel {
        name:  string;
        score: number;
    }

    export class VisualiseCtrl {
        private project: Models.McaProject;
        private viewer: any;
        private location: any;
        private selectedModel = new SelectedModel();

        public static $inject = [
            '$scope',
            'userService',
            'messageBusService',
            'projectService'
        ];

        constructor(
            private $scope: IVisualiseScope,
            public userService: Services.UserService,
            private messageBus: csComp.Services.MessageBusService,
            private projectService: Services.ProjectService
        ) {
            $scope.vm = this;

            if (projectService.project == null) return;
            this.project = projectService.project;

            this.initialize();
            this.update3DModel();
        }

        private initialize() {
            Cesium.BingMapsApi.defaultKey = 'AixgYcSF8GWn2Fs0o1bv8Scqm7rDcYToscQg1qFFYgNiOEEEVvy8aUkDTIgpbNW4';

            this.viewer = new Cesium.Viewer('cesiumContainer', {
                selectionIndicator:   false,
                infoBox:              false,
                scene3DOnly:          true,
                sceneModePicker:      false,
                fullscreenButton:     false,
                homeButton:           false,
                baseLayerPicker:      false,
                animation:            false,
                timeline:             false,
                geocoder:             false,
                navigationHelpButton: true
            });

            // var scene = this.viewer.scene;

            this.location = Cesium.Cartesian3.fromDegrees(4.323693, 52.082356, 0);

            // this.viewer.camera.flyTo({
            //     destination: this.location
            // });

            var heading = Cesium.Math.toRadians(50.0),
                pitch = Cesium.Math.toRadians(-20.0),
                range = 1000.0;
            this.viewer.camera.lookAt(this.location, new Cesium.HeadingPitchRange(heading, pitch, range));

            this.setUpMouseHandlers();
        }

        private update3DModel() {
            var scene = this.viewer.scene;

            const unitConversion = 1000;

            var data = this.model;
            data.forEach(boundingBox => {
                var min = boundingBox.min;
                var max = boundingBox.max;

                var m = Cesium.Matrix4.multiplyByTranslation(
                    Cesium.Transforms.eastNorthUpToFixedFrame(this.location),
                    new Cesium.Cartesian3(0, 0, 0),
                    new Cesium.Matrix4());

                var aabb = new Cesium.AxisAlignedBoundingBox(
                    new Cesium.Cartesian3(min.x / unitConversion, min.y / unitConversion, min.z / unitConversion),
                    new Cesium.Cartesian3(max.x / unitConversion, max.y / unitConversion, max.z / unitConversion));
                var box = Cesium.BoxGeometry.fromAxisAlignedBoundingBox(aabb);

                var instance = new Cesium.GeometryInstance({
                    geometry: box,
                    modelMatrix: m,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(boundingBox.color)
                    },
                    id: boundingBox.guid
                });

                var material;
                material = Cesium.Material.fromType('Color');
                material.uniforms.color = boundingBox.color; // new Cesium.Color(1.0, 1.0, 0.0, 1.0);

                scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: instance,
                    appearance: new Cesium.EllipsoidSurfaceAppearance({
                        material: material // Cesium.Material.fromType('Color')
                    })
                }));
            });
        }

        private get moduleScores() {
            if (typeof this.projectService.activeSolution === 'undefined') {
                this.projectService.activeSolution = this.project.solutions[this.project.solutions.length - 1];
            }
            if (!this.projectService.activeSolution) {
                this.messageBus.notifyBottom('Active solution', 'Please create an new solution in the Solutions tab.');
                return;
            }
            this.projectService.activeSolution.computeModuleScores(this.project.rootCriterion, this.project);
            var moduleScores: Models.IModuleScores = this.projectService.activeSolution.moduleScores;
            return moduleScores;
        }

        private convertScoreToColor(score: number) {
            // http://colorbrewer2.org/?type=diverging&scheme=RdYlGn&n=5
            //const colors = ['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641'];
            const alpha = 0.9;
            const color0 = new Cesium.Color(215 / 255,  48 / 255,  39 / 255, alpha);
            const color1 = new Cesium.Color(253 / 255, 174 / 255,  97 / 255, alpha);
            const color2 = new Cesium.Color(255 / 255, 255 / 255, 191 / 255, alpha);
            const color3 = new Cesium.Color(166 / 255, 217 / 255, 106 / 255, alpha);
            const color4 = new Cesium.Color( 26 / 255, 150 / 255,  65 / 255, alpha);
            if (score < 1) return color0;
            if (score < 2) return color1;
            if (score < 3) return color2;
            if (score < 4) return color3;
            return color4;
        }

        private get model(): IBuildingBox[] {
            const defaultColor = new Cesium.Color(1, 1, 0, 0.9);
            var scores = this.moduleScores;
            var data: IBuildingBox[] = [
                {
                    'guid': 'house2',
                    'name': 'Housing Ribbon 4.2',
                    'oid': 59048085,
                    'min': {
                        'x': 13900.000000001899,
                        'y': 60150.000000030544,
                        'z': -46165.000023550674
                    },
                    'max': {
                        'x': 42600.0000000019,
                        'y': 76150.00000003052,
                        'z': -25665.15625
                    }
                },
                {
                    'guid': 'house1',
                    'name': 'Housing Ribbon 4.1',
                    'oid': 58982549,
                    'min': {
                        'x': 14900.001953126899,
                        'y': 60150.000000030544,
                        'z': -58165.00000741584
                    },
                    'max': {
                        'x': 42600.0000000019,
                        'y': 100850.00000003052,
                        'z': -46165
                    }
                },
                {
                    'guid': 'shops4',
                    'name': 'Shops Ribbon 4',
                    'oid': 59179157,
                    'min': {
                        'x': -24899.998046928446,
                        'y': 3449.999979956163,
                        'z': -58165
                    },
                    'max': {
                        'x': 13900.001953126899,
                        'y': 28650.000000030515,
                        'z': -45495
                    }
                },
                {
                    'guid': 'house4',
                    'name': 'Housing Ribbon 4.4',
                    'oid': 59113621,
                    'min': {
                        'x': 13900.003906251899,
                        'y': 3450.0000000305445,
                        'z': -58165.000077458026
                    },
                    'max': {
                        'x': 30200.0039062519,
                        'y': 28266.322265655515,
                        'z': -38165
                    }
                },
                {
                    'guid': 'hotel1',
                    'name': 'Hotel Ribbon 1',
                    'oid': 58785941,
                    'min': {
                        'x': -11099.995926185242,
                        'y': -44949.999999969485,
                        'z': -57835.00000000119
                    },
                    'max': {
                        'x': 14900.001953126899,
                        'y': -27149.999999969485,
                        'z': 54165
                    }
                },
                {
                    'guid': 'garage0',
                    'name': 'Garage Ribbon 0',
                    'oid': 58720405,
                    'min': {
                        'x': -42600.0000000019,
                        'y': -100350.00176998902,
                        'z': -70835
                    },
                    'max': {
                        'x': 29400.007812498116,
                        'y': 28650.006042510984,
                        'z': -58165
                    }
                },
                {
                    'guid': 'house1',
                    'name': 'Housing Ribbon 1',
                    'oid': 58917013,
                    'min': {
                        'x': -11099.99418484226,
                        'y': 83450.00000002676,
                        'z': -58165
                    },
                    'max': {
                        'x': 14900.005859376899,
                        'y': 100850.00000003052,
                        'z': 54165
                    }
                },
                {
                    'guid': 'theater1',
                    'name': 'Theater Ribbon 1',
                    'oid': 58851477,
                    'min': {
                        'x': -11099.996294837074,
                        'y': -44849.99998588357,
                        'z': 54164.99999999997
                    },
                    'max': {
                        'x': 14900.005859376899,
                        'y': 100850.00000003052,
                        'z': 70835
                    }
                },
                {
                    'guid': 'shops2',
                    'name': 'Shops Ribbon 3.2',
                    'oid': 59572373,
                    'min': {
                        'x': -25899.998046873094,
                        'y': -100850.00000003052,
                        'z': -58165
                    },
                    'max': {
                        'x': -11099.998046873101,
                        'y': -74850.00000003052,
                        'z': -13165
                    }
                },
                {
                    'guid': 'museum1',
                    'name': 'Museum Ribbon 3.1',
                    'oid': 59506837,
                    'min': {
                        'x': -11099.998046873101,
                        'y': -100849.99998518969,
                        'z': -25835
                    },
                    'max': {
                        'x': 14900.001953126899,
                        'y': -50689.99998518969,
                        'z': -13165
                    }
                },
                {
                    'guid': 'house3',
                    'name': 'Housing Ribbon 4.3',
                    'oid': 59703445,
                    'min': {
                        'x': 13900.003906161714,
                        'y': 3450.000000030501,
                        'z': -38165
                    },
                    'max': {
                        'x': 30200.0039062519,
                        'y': 60150.000000030515,
                        'z': -25665.1572265625
                    }
                },
                {
                    'guid': 'museum2',
                    'name': 'Museum Ribbon 3.2',
                    'oid': 59637909,
                    'min': {
                        'x': -42599.998535840576,
                        'y': -100849.99980065304,
                        'z': -58165.00000353016
                    },
                    'max': {
                        'x': -25899.998362406703,
                        'y': -68541.46073815304,
                        'z': -45165
                    }
                },
                {
                    'guid': 'offices2',
                    'name': 'Offices Ribbon 2.2',
                    'oid': 59310229,
                    'min': {
                        'x': -42599.99978686297,
                        'y': -68541.46093771016,
                        'z': 5834.999943042771
                    },
                    'max': {
                        'x': -24899.997770545444,
                        'y': 28650.000000030515,
                        'z': 22835
                    }
                },
                {
                    'guid': 'offices1',
                    'name': 'Offices Ribbon 2.1',
                    'oid': 59244693,
                    'min': {
                        'x': -42599.99892303032,
                        'y': 3450.000000017433,
                        'z': -58165.00009944775
                    },
                    'max': {
                        'x': -24899.99693348872,
                        'y': 28650.000000030515,
                        'z': 5835
                    }
                },
                {
                    'guid': 'shops1',
                    'name': 'Shops Ribbon 3.1',
                    'oid': 59441301,
                    'min': {
                        'x': -11099.998046873101,
                        'y': -68549.99999996947,
                        'z': -57835
                    },
                    'max': {
                        'x': 14900.001953126899,
                        'y': -50689.999999969485,
                        'z': -25835
                    }
                },
                {
                    'guid': 'offices3',
                    'name': 'Offices Ribbon 2.3',
                    'oid': 59375765,
                    'min': {
                        'x': -42599.999693944315,
                        'y': -68541.46095234368,
                        'z': -58165.000065055894
                    },
                    'max': {
                        'x': -24899.998012553864,
                        'y': -43341.460937469485,
                        'z': 5835
                    }
                }
            ];
            data.forEach(box => {
                box.color = defaultColor;
                for (var key in scores) {
                    if (!scores.hasOwnProperty(key)) continue;
                    if (key.indexOf(box.guid) < 0) continue;
                    let score = scores[key];
                    box.color = this.convertScoreToColor(score);
                    box.score = score;
                    console.log(box);
                    return;
                }
            });
            return data;
        }

        public setUpMouseHandlers() {
            var scene = this.viewer.scene;
            var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

            handler.setInputAction(click => {
                var pickedObject = scene.pick(click.position);
                if (Cesium.defined(pickedObject)) {
                    console.log(pickedObject);
                    var id = pickedObject.id;
                    this.model.some(box => {
                        if (box.guid !== id) return false;
                        this.selectedModel.name  = box.name;
                        this.selectedModel.score = box.score;
                        return true;
                    });
                } else {
                    this.selectedModel.name  = '';
                    this.selectedModel.score = undefined;
                }
                if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') { this.$scope.$apply(); }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // this.handler.setInputAction(movement => {
            //     var pickedObject = this.scene.pick(movement.endPosition);
            //     if (Cesium.defined(pickedObject) && pickedObject.id !== undefined && pickedObject.id.feature !== undefined) {
            //         this.showFeatureTooltip(pickedObject.id.feature, movement.endPosition);
            //     } else {
            //         $('.cesiumPopup').fadeOut('fast').remove();
            //     }
            // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }

    }
}