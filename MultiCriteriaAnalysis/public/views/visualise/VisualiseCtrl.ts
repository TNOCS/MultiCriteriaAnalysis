module Visualise {
    declare var Cesium: any;

    export interface IVisualiseScope extends ng.IScope {
        vm: VisualiseCtrl;
    }

    export class VisualiseCtrl {
        private project: Models.McaProject;

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
        }

        private initialize() {
            var imageProvider;
            var viewer = new Cesium.Viewer('cesiumContainer', {
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
                    navigationHelpButton: false,
                    imageryProvider:      imageProvider
                });

            var scene = viewer.scene;

            var location = Cesium.Cartesian3.fromDegrees(4.323693, 52.082356, 50); // Rotterdam
            var camera = viewer.camera;

            var unitConversion = 1000;

            viewer.camera.flyTo({
                destination : location
            });

        var boxes = [  
        {  
            "guid":"3AD1pxR0z3vedFg0gqE_dY",
            "name":"Housing Ribbon 4.3",
            "oid":1048853,
            "min":{  
                "x":-66129.03130048513,
                "y":-29425.553000867367,
                "z":-38165.0
            },
            "max":{  
                "x":-11179.45703125,
                "y":17951.732177734375,
                "z":-25665.15625
            }
        },
        {  
            "guid":"1mcEPlFFr32gxEa922f46_",
            "name":"Housing Ribbon 4.1",
            "oid":327957,
            "min":{  
                "x":-105996.890625,
                "y":-53334.11996459961,
                "z":-58165.000007192895
            },
            "max":{  
                "x":-66128.57421875,
                "y":-6613.002197265625,
                "z":-46164.99996948242
            }
        },
        {  
            "guid":"0JVVvaMiv4yfY1vk3ZwIH_",
            "name":"Housing Ribbon 1",
            "oid":262421,
            "min":{  
                "x":-89178.76904296875,
                "y":-73995.29077148438,
                "z":-58165.0
            },
            "max":{  
                "x":-59567.021484375,
                "y":-42771.619384765625,
                "z":54165.00000000055
            }
        },
        {  
            "guid":"2K9461lA927fwl5JSLbDLY",
            "name":"Housing Ribbon 4.4",
            "oid":459029,
            "min":{  
                "x":-40795.83517456055,
                "y":-10062.324310302734,
                "z":-58165.0
            },
            "max":{  
                "x":-11180.564453125,
                "y":17956.706787109375,
                "z":-38164.99987841895
            }
        },
        {  
            "guid":"2by76t3gH7K8MaeOtzAB1f",
            "name":"Housing Ribbon 4.2",
            "oid":393493,
            "min":{  
                "x":-86368.18377685547,
                "y":-39113.294189453125,
                "z":-46165.000001032866
            },
            "max":{  
                "x":-56229.54296875,
                "y":-6594.256103515625,
                "z":-25665.15625
            }
        },
        {  
            "guid":"2Jw2Dx7n19IPTNh7g12cWR",
            "name":"Garage Ribbon 0",
            "oid":65813,
            "min":{  
                "x":-40611.616638183594,
                "y":-55179.290771484375,
                "z":-70835.0
            },
            "max":{  
                "x":105604.875,
                "y":73995.29077148438,
                "z":-58165.0
            }
        },
        {  
            "guid":"1kQ773cv9CrBXFi2Cg$UT8",
            "name":"Theater Ribbon 1",
            "oid":196885,
            "min":{  
                "x":-89181.6953125,
                "y":-73982.79516601562,
                "z":54164.999999995984
            },
            "max":{  
                "x":42375.353515625,
                "y":35138.527099609375,
                "z":70835.0
            }
        },
        {  
            "guid":"0EBknzY554nOiBLXOfWgHw",
            "name":"Hotel Ribbon 1",
            "oid":131349,
            "min":{  
                "x":12525.23046875,
                "y":3732.7109375,
                "z":-57835.00003814612
            },
            "max":{  
                "x":47015.734375,
                "y":38684.298583984375,
                "z":54164.9999618539
            }
        },
        {  
            "guid":"0_gjzzTF10OvDMJyJAfQzo",
            "name":"Museum Ribbon 3.1",
            "oid":852245,
            "min":{  
                "x":31229.23095703125,
                "y":18036.709228515625,
                "z":-25835.00000000298
            },
            "max":{  
                "x":86871.59765625,
                "y":69150.69702148438,
                "z":-13165.0
            }
        },
        {  
            "guid":"1c68cj5Aj6xB4C_m19qMaW",
            "name":"Shops Ribbon 3.1",
            "oid":786709,
            "min":{  
                "x":31229.23095703125,
                "y":18036.709228515625,
                "z":-57835.00003814708
            },
            "max":{  
                "x":61206.48828125,
                "y":49539.671630859375,
                "z":-25835.00003814699
            }
        },
        {  
            "guid":"2rpH22DmH5fxMqZEyvb9bR",
            "name":"Museum Ribbon 3.2",
            "oid":983317,
            "min":{  
                "x":70185.5541381836,
                "y":3827.0139770507812,
                "z":-58164.999921328126
            },
            "max":{  
                "x":105996.890625,
                "y":36712.796630859375,
                "z":-45164.99969482422
            }
        },
        {  
            "guid":"3vxLhVtKzFJQvESrJeOUbw",
            "name":"Shops Ribbon 3.2",
            "oid":917781,
            "min":{  
                "x":66211.53581237793,
                "y":20927.835693359375,
                "z":-58165.0
            },
            "max":{  
                "x":95856.611328125,
                "y":48473.663818359375,
                "z":-13165.0
            }
        },
        {  
            "guid":"3GVtpp8KvAnxIseahiSPhO",
            "name":"Offices Ribbon 2.1",
            "oid":590101,
            "min":{  
                "x":-7642.7691650390625,
                "y":-55179.291015625,
                "z":-58165.00001484036
            },
            "max":{  
                "x":23127.3828125,
                "y":-25814.886962890625,
                "z":5835.000030517578
            }
        },
        {  
            "guid":"3wPFtUHx5EGxpc0Co63Os_",
            "name":"Shops Ribbon 4",
            "oid":524565,
            "min":{  
                "x":-31204.7001953125,
                "y":-41125.187744140625,
                "z":-58165.000033947465
            },
            "max":{  
                "x":12376.3671875,
                "y":5004.966552734375,
                "z":-45495.00003051758
            }
        },
        {  
            "guid":"0vN2XGRrr8dR6nj1aagXrh",
            "name":"Offices Ribbon 2.3",
            "oid":721173,
            "min":{  
                "x":49557.23083496094,
                "y":-11467.291015625,
                "z":-58164.999938964844
            },
            "max":{  
                "x":80327.3828125,
                "y":17897.113037109375,
                "z":5835.000793457031
            }
        },
        {  
            "guid":"1IPtICIvP0CBDUnsRVLaQz",
            "name":"Offices Ribbon 2.2",
            "oid":655637,
            "min":{  
                "x":-7642.76904296875,
                "y":-55179.29089355469,
                "z":5834.999997834311
            },
            "max":{  
                "x":80330.7421875,
                "y":17894.907958984375,
                "z":22835.0
            }
        }
        ]

        boxes.forEach(function(boundingBox){
            var min = boundingBox.min;
            var max = boundingBox.max;

            var m = Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(location), 
            new Cesium.Cartesian3(min.x / unitConversion, min.y / unitConversion, min.z / unitConversion), 
            new Cesium.Matrix4());

            var geometry = Cesium.BoxGeometry.fromDimensions({
            vertexFormat : Cesium.VertexFormat.POSITION_AND_NORMAL,
            dimensions : new Cesium.Cartesian3((max.x - min.x) / unitConversion, (max.y - min.y) / unitConversion, (max.z - min.z) / unitConversion)
            });
            var instance = new Cesium.GeometryInstance({
            geometry : geometry,
            modelMatrix : m,
            id : boundingBox.guid
            });

            var material = Cesium.Material.fromType('Color');
            material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 0.8);

            scene.primitives.add(new Cesium.Primitive({
            geometryInstances : instance,
            appearance : new Cesium.EllipsoidSurfaceAppearance({
                material : material
            })
            }));
        });

        }
        
        private getModuleScores() {
            this.projectService.activeSolution.computeModuleScores(this.project.rootCriterion, this.project);
            var moduleScores: Models.IModuleScores = this.projectService.activeSolution.moduleScores;
        }
    }
}