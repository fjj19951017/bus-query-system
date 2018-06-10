require([
    "esri/Map",
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/views/2d/draw/Draw",
    "esri/Graphic",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "dojo/domReady!"
], function(Map,
            WebMap,
            MapView,
            FeatureLayer,
            Draw,
            Graphic,
            Polyline,
            geometryEngine) {
    let featureLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/app/Element2/FeatureServer/2", {
        outFields: ["*"]
    });

    let webMap = new WebMap({
        portalItem: {
            id: "23fe7e8317ba4331b6ca72bf2a8eddb6"
        }
    });

    let view = new MapView({
        map: webMap,
        container: "container",
        center: [113.391943, 23.050846],
        scale: 30000

    });

    let draw = new Draw({
        view: view
    });

    let beginDraw = document.getElementsByClassName('btn btn-primary')[0];
    let blackScreen = document.querySelector('.black-screen');
    let geometry;

    beginDraw.onclick = function() {
        //屏幕聚焦在地图上
        blackScreen.className = 'black-screen-active';
        //开始画公交线路
        let action = draw.create("polyline", {mode: "click"});

        action.on("vertex-add", updateVertices);

        action.on("vertex-remove", updateVertices);

        action.on("cursor-update", createGraphic);

        action.on("draw-complete", function(evt) {
            geometry = updateVertices(evt);
            blackScreen.className = 'black-screen'; //取消聚焦
        });

    };


    function updateVertices(evt) {

        let result = createGraphic(evt);

        if (result.selfIntersects) {
            evt.preventDefault();
        }

        return result.graphic.geometry;
    }

    function createGraphic(evt) {
        let vertices = evt.vertices;
        view.graphics.removeAll();

        let graphic = new Graphic({
            geometry: new Polyline({
                paths: vertices,
                spatialReference: view.spatialReference
            }),
            symbol: {
                type: "simple-line",
                color: [4, 90, 141],
                width: 4,
                cap: "round",
                join: "round"
            }
        });

        let intersectingFeature = getIntersectingFeature(graphic.geometry);


        if (intersectingFeature) {
            view.graphics.addMany([graphic, intersectingFeature]);
        }

        else {
            view.graphics.add(graphic);
        }

        return {
            graphic: graphic,
            selfIntersects: intersectingFeature
        }

    }

    function getIntersectingFeature(polyline) {
        if (isSelfIntersecting(polyline)) {
            return new Graphic({
                geometry: getLastSegment(polyline),
                symbol: {
                    type: "simple-line",
                    style: "short-dot",
                    width: 3.5,
                    color: "yellow"
                }
            });
        }
        return null;
    }

    function getLastSegment(polyline) {
        let line = polyline.clone();
        let lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
        let existingLineFinalPoint = line.getPoint(0, line.paths[0].length -
            1);

        return new Polyline({
            spatialReference: view.spatialReference,
            hasZ: false,
            paths: [
                [
                    [existingLineFinalPoint.x, existingLineFinalPoint.y],
                    [lastXYPoint.x, lastXYPoint.y]
                ]
            ]
        });
    }

    function isSelfIntersecting(polyline) {
        if (polyline.paths[0].length < 3) {
            return false
        }
        let line = polyline.clone();

        let lastSegment = getLastSegment(polyline);
        line.removePoint(0, line.paths[0].length - 1);

        return geometryEngine.crosses(lastSegment, line);
    }

    let stationName  = document.getElementById('name');
    let route = document.getElementById('route');
    let price = document.getElementById('price');
    let timetable = document.getElementById('timetable');
    let executeAdd = document.getElementsByClassName('btn btn-danger')[0];
    executeAdd.onclick = function() {
        //添加图层
        const addFeature =  new Graphic({
            geometry: geometry,
            attributes: {
                name: stationName.value,
                station: route.value,
                price: price.value,
                timetable: timetable.value,
                Oneway: 'FT',
                start: 0,
                end_: 0
            }
        });

        console.log(addFeature);

        featureLayer.applyEdits({
            addFeatures: [addFeature]
        }).then(function() {
            alert('添加成功');

        }, function(err) {
            console.log(err)
        })
    }

});