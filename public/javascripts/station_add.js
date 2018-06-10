require([
    "esri/Map",
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/views/2d/draw/Draw",
    "esri/Graphic",
    "dojo/domReady!"
], function(Map,
            WebMap,
            MapView,
            FeatureLayer,
            Draw,
            Graphic) {
    let featureLayer = new FeatureLayer("http://localhost:6080/arcgis/rest/services/app/Element2/FeatureServer/0", {
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

    let beginDraw = document.getElementsByClassName('btn btn-warning')[0];
    let blackScreen = document.querySelector('.black-screen');
    let geometry;
    beginDraw.onclick = function() {
        //屏幕聚焦在地图上
        blackScreen.className = 'black-screen-active';
        //开始画公交站点
        let action = draw.create("point");
        action.on("cursor-update", function (evt) {
            createPointGraphic(evt.coordinates);
        });

        // PointDrawAction.draw-complete
        // Create a point when user clicks on the view or presses "C" key.
        action.on("draw-complete", function (evt) {
            geometry = createPointGraphic(evt.coordinates);
            blackScreen.className = 'black-screen'; //取消聚焦
        });
    };

    function createPointGraphic(coordinates){
        view.graphics.removeAll();
        let point = {
            type: "point", // autocasts as /Point
            x: coordinates[0],
            y: coordinates[1],
            spatialReference: view.spatialReference
        };

        let graphic = new Graphic({
            geometry: point,
            symbol: {
                type: "simple-marker", // autocasts as SimpleMarkerSymbol
                style: "circle",
                color: "red",
                size: "8px"
            }
        });
        view.graphics.add(graphic);
        return point; //返回geometry对象
    }

    let stationName  = document.getElementById('name');
    let route = document.getElementById('route');
    let executeAdd = document.getElementsByClassName('btn btn-danger')[0];
    executeAdd.onclick = function() {
        //添加图层
        const addFeature =  new Graphic({
            geometry: geometry,
            attributes: {
                name: stationName.value,
                route: route.value
            }
        });

        featureLayer.applyEdits({
            addFeatures: [addFeature]
        }).then(function() {
                alert('添加成功');
        });
    }

});