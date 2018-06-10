require([
    "esri/Map",
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/PopupTemplate",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/tasks/FindTask",
    "esri/tasks/support/FindParameters",
    "esri/Graphic",
    "esri/tasks/RouteTask",
    "esri/tasks/support/RouteParameters",
    "esri/tasks/support/FeatureSet",
    "dojo/domReady!"
], function(Map,
            WebMap,
            MapView,
            FeatureLayer,
            PopupTemplate,
            QueryTask,
            Query,
            FindTask,
            FindParameters,
            Graphic,
            RouteTask,
            RouteParameters,
            FeatureSet) {

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

    let layer = [];
    for(let i = 0; i < 3; i++) {
        layer[i] = new FeatureLayer({
            /* url: `http://localhost:6080/arcgis/rest/services//app/Element/MapServer/${i}` */
            url: `http://localhost:6080/arcgis/rest/services/app/Element2/MapServer/${i}`
        });
        webMap.add(layer[i]);
    }

    let busStationTemplate = {
        title: "公交站",
        content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "name",
                label: "站点名称",
                visible: true
            }, {
                fieldName: "route",
                label: "途经线路",
                visible: true
            }]
        }]
    };

    let routeTemplate = {
        title: "公交线路",
        content: [{
            type: "fields",
            fieldInfos: [{
                fieldName: "name",
                label: "路线名称",
                visible: true
            }, {
                fieldName: "timetable",
                label: "首末班",
                visible: true
            }, {
                fieldName: "price",
                label: "票价",
                visible: true
            }
            ]
        }]
    };

    let roadTemplate = {
        title: "道路"
    };

    layer[0].popupTemplate = busStationTemplate;
    layer[1].popupTemplate = roadTemplate;
    layer[2].popupTemplate = routeTemplate;

    let listItem = document.getElementsByClassName('list-item');
    let search = document.getElementById('search');
    let searchBody = document.getElementsByClassName('search-body')[0];
    let searchBody_2 = document.getElementsByClassName('search-body-2')[0];
    let activeListItem = document.getElementsByClassName('list-item-active');
    let searchTitleId = document.getElementById('search-title-id');
    let showUp = document.getElementsByClassName('show-up')[0];
    let searchStation = document.getElementById('search-station');
    let searchResult = document.getElementsByClassName('search-result')[0];

    for(let i = 0; i < listItem.length; i++) {
        listItem[i].onclick = function (e) {
            if(activeListItem.length !== 0) {
                if(e.target.tagName.toLowerCase() === 'li' || e.target.className !== 'list-item-active') {
                    searchResult.innerHTML = '';
                }
                activeListItem[0].className = 'list-item';
            }
            if(e.target.tagName.toLowerCase() === 'li') {
                e.target.className = 'list-item-active';
            }
            search.style.display = 'block';
            searchStation.value = '';
            switch(i) {
                case 0: {
                    searchTitleId.innerHTML = '站点查询';
                    searchBody.style.display = 'block';
                    searchBody_2.style.display = 'none';
                    showUp.style.visibility = 'visible';
                    searchResult.style.top = 165 + 'px';

                }
                break;
                case 1: {
                    searchTitleId.innerHTML = '公交线路查询';
                    searchBody.style.display = 'block';
                    searchBody_2.style.display = 'none';
                    showUp.style.visibility = 'hidden';
                    searchResult.style.top = 165 + 'px';
                }
                break;
                case 2: {
                    searchTitleId.innerHTML = '最短路程查询';
                    searchBody.style.display = 'none';
                    searchBody_2.style.display = 'block';
                    searchResult.style.top = 203 + 'px';
                }
                break;
                case 3: {
                    searchTitleId.innerHTML = '最少换乘查询';
                    searchResult.style.top = 185 + 'px';
                }
                break;
                case 4: {
                    searchTitleId.innerHTML = '站点查询';
                }
                break;
            }
        }
    }

    let title_1 = document.getElementById('title-1');
    let title_2 = document.getElementById('title-2');
    let list_1 = document.getElementById('list-1');
    let list_2 = document.getElementById('list-2');
    let listAppear = document.getElementsByClassName('list-appear');

    title_1.onclick = function() {
        if(listAppear.length !== 0) {
            if(listAppear[0].id !== 'list-1') {
                listAppear[0].className = 'list';
                list_1.className = 'list-appear';
            }
            else {
                listAppear[0].className = 'list';
            }
        }
        else {
            list_1.className = 'list-appear';
        }
    };
    title_2.onclick = function() {
        if(listAppear.length !== 0) {
            if(listAppear[0].id !== 'list-2') {
                listAppear[0].className = 'list';
                list_2.className = 'list-appear';
            }
            else {
                listAppear[0].className = 'list';
            }
        }
        else {
            list_2.className = 'list-appear';
        }
    };

    let close = document.getElementsByClassName('close-icon')[0];
    close.onclick = function() {
        search.style.display = 'none';
        activeListItem[0].className = 'list-item';
    };

    let showStation = document.getElementById('show-station');
    showStation.onclick = function() {
        if(showStation.checked) {
            webMap.add(layer[0]);
        }
        else {
            webMap.remove(layer[0]);
        }
    };

    let searchStationOk = document.getElementById('search-station-ok');

    searchStationOk.onclick = function() {
        let searchContent = searchStation.value;
        let stationLayerUrl = 'http://localhost:6080/arcgis/rest/services/app/Element2/MapServer';
        let findTask = new FindTask({
            url: stationLayerUrl
        });
        if(searchTitleId.innerHTML === '站点查询') {    //站点查询
            let params = new FindParameters();
            params.layerIds = [0];
            params.searchText = searchContent;
            params.searchFields = ['name'];
            params.returnGeometry = true;
            findTask.execute(params).then((results) => {
                //高亮显示要素
                view.graphics.removeAll();
                results.results.forEach(function(x) {
                    let graphic = new Graphic({
                        geometry: x.feature.geometry,
                        symbol: {
                            type: "simple-marker",
                            color: [255, 0, 0, 0.5],
                            size: 7,
                            outline: {
                                width: 1,
                                color: [255, 0, 0, 0.5]
                            }
                        }
                    });
                    view.graphics.add(graphic);
                });
                //生成查询结果
                let searchResult = document.getElementsByClassName('search-result')[0];
                searchResult.innerHTML = '';
                for(let i = 0; i < results.results.length; i++) {

                    let result = document.createElement('div');
                    let resultTitle = document.createElement('div');
                    let resultBody = document.createElement('div');
                    let goTo = document.createElement('div');

                    result.className = 'panel panel-primary';
                    result.style.backgroundColor = '#545454';
                    result.style.margin = '10px';
                    resultTitle.className = 'panel-heading';
                    resultBody.className = 'panel-body';
                    goTo.style.padding = '5px';
                    goTo.style.textAlign = 'right';

                    resultTitle.innerHTML = `公交站:${results.results[i].feature.attributes.name}`;
                    resultBody.innerHTML = `途经线路：${results.results[i].feature.attributes.route}`;
                    goTo.innerHTML = '<span class="label label-danger">移动至</span>';

                    result.appendChild(resultTitle);
                    result.appendChild(resultBody);
                    result.appendChild(goTo);

                    searchResult.appendChild(result);
                    goTo.firstChild.onclick = (function(){
                        let j = i;
                        return function() {
                            //地图视角移动到所选要素
                            view.goTo({
                                target: results.results[j].feature.geometry,
                                scale: 10000,
                                easing: 'ease-out'
                            });
                            //弹出框
                            view.popup.open({
                                location: results.results[j].feature.geometry,
                                title: '公交站',
                                content: results.results[j].feature.attributes.name
                            })
                        }
                    })();
                }
            });
        }
        else if(searchTitleId.innerHTML === '公交线路查询') {
            let params = new FindParameters();
            params.layerIds = [2];
            params.searchText = searchContent;
            params.searchFields = ['name'];
            params.returnGeometry = true;
            findTask.execute(params).then((results) => {

                //生成查询结果
                let searchResult = document.getElementsByClassName('search-result')[0];
                searchResult.innerHTML = '';
                for(let i = 0; i < results.results.length; i++) {

                    let result = document.createElement('div');
                    let resultTitle = document.createElement('div');
                    let resultBody = document.createElement('div');
                    let goTo = document.createElement('div');

                    result.className = 'panel panel-primary';
                    result.style.backgroundColor = '#545454';
                    result.style.margin = '10px';
                    resultTitle.className = 'panel-heading';
                    resultBody.className = 'panel-body';
                    goTo.style.padding = '5px';
                    goTo.style.textAlign = 'right';

                    resultTitle.innerHTML = `公交线路:${results.results[i].feature.attributes.name}`;
                    resultBody.innerHTML = `途经站点：${results.results[i].feature.attributes.station}<br />
                        票价：${results.results[i].feature.attributes.price}<br />
                        首末班：${results.results[i].feature.attributes.timetable}`;
                    goTo.innerHTML = '<span class="label label-warning">在地图上显示</span>';

                    result.appendChild(resultTitle);
                    result.appendChild(resultBody);
                    result.appendChild(goTo);

                    searchResult.appendChild(result);
                    goTo.firstChild.onclick = function() {
                        //高亮显示要素
                        view.graphics.removeAll();
                        let graphic = new Graphic({
                            geometry: results.results[i].feature.geometry,
                            symbol: {
                                type: "simple-line",
                                color: '#1874CD',
                                width: 5
                            }
                        });
                        view.graphics.add(graphic);

                        // let startParams = new FindParameters();
                        // startParams.layerIds = [0];
                        // startParams.searchText = `${results.results[i].feature.attributes.start}`;
                        // startParams.searchFields = ['FID'];
                        // startParams.returnGeometry = true;
                        // startParams.contains = false;   //取消模糊搜索
                        // findTask.execute(startParams).then((results) => {
                        //     results.results[0].feature.geometry.y += 8;
                        //     let start = new Graphic({
                        //         geometry: results.results[0].feature.geometry,
                        //         symbol: {
                        //             type: "picture-marker",
                        //             url: "img/start.png",
                        //             width: '12pt',
                        //             height: '16pt',
                        //         }
                        //     });
                        //     view.graphics.add(start);
                        // });
                        //
                        // let endParams = new FindParameters();
                        // endParams.layerIds = [0];
                        // endParams.searchText = `${results.results[i].feature.attributes.end}`;
                        // endParams.searchFields = ['FID'];
                        // endParams.returnGeometry = true;
                        // endParams.contains = false;   //取消模糊搜索
                        // findTask.execute(endParams).then((results) => {
                        //     results.results[0].feature.geometry.y += 8;
                        //     let end = new Graphic({
                        //         geometry: results.results[0].feature.geometry,
                        //         symbol: {
                        //             type: "picture-marker",
                        //             url: "img/end.png",
                        //             width: '12pt',
                        //             height: '16pt'
                        //         }
                        //     });
                        //     view.graphics.add(end);
                        // });
                    }
                }
            });
        }

    };

    let routeStart_1 = document.getElementById('route-start-1');
    let routeEnd_1 = document.getElementById('route-end-1');
    let routeParams = {};

    let autoFinish = function() {
        for(let i = 1; i < 5; i++) {
            if(document.getElementsByClassName(`autoFinish-${i}`).length > 0) {
                searchBody_2.removeChild(document.getElementsByClassName(`autoFinish-${i}`)[0]);
            }
        }


        let routePont = new FindParameters();
        routePont.layerIds = [0];
        routePont.searchText = this.value;
        routePont.searchFields = ['name'];
        routePont.returnGeometry = true;
        let findTask = new FindTask({
            url: 'http://localhost:6080/arcgis/rest/services/app/Element2/MapServer'
        });
        findTask.execute(routePont).then((results) => {
            if(results.results.length > 0) {

                let resultList = document.createElement('div');
                if(this.id === 'route-start-1') {
                    if(results.results.length < 4) {
                        resultList.className = 'autoFinish-1';
                    }
                    else {
                        resultList.className = 'autoFinish-2';
                    }
                }
                else {
                    if(results.results.length < 4) {
                        resultList.className = 'autoFinish-3';
                    }
                    else {
                        resultList.className = 'autoFinish-4';
                    }
                }

                results.results.forEach((x) => {
                    let resultItem = document.createElement('div');
                    resultItem.className  = 'autoFinish-resultList';
                    resultItem.innerHTML = x.feature.attributes.name;
                    resultList.appendChild(resultItem);
                    resultItem.onmouseenter = () => {
                        view.graphics.removeAll();
                        let graphic = new Graphic({
                            geometry: x.feature.geometry,
                            symbol: {
                                type: "simple-marker",
                                color: [255, 0, 0, 0.5],
                                size: 7,
                                outline: {
                                    width: 1,
                                    color: [255, 0, 0, 0.5]
                                }
                            }
                        });
                        view.graphics.add(graphic);
                    };
                    if(this.id === 'route-start-1') {
                        resultItem.onclick = () => {
                            routeStart_1.value = x.feature.attributes.name;
                            searchBody_2.removeChild(resultList);
                            routeParams.start = x.feature.geometry;
                        };
                        // routeStart_1.onblur = () => {
                        //     resultList.style.visibility = 'hidden';
                        // };
                        // routeStart_1.onfocus = () => {
                        //     resultList.style.visibility = 'visible';
                        // };
                    }
                    else {
                        resultItem.onclick = () => {
                            routeEnd_1.value = x.feature.attributes.name;
                            searchBody_2.removeChild(resultList);
                            routeParams.end = x.feature.geometry;
                        };
                        // routeEnd_1.onblur = () => {
                        //     resultList.style.visibility = 'hidden';
                        // };
                        // routeEnd_1.onfocus = () => {
                        //     resultList.style.visibility = 'visible';
                        // };
                    }
                });
                searchBody_2.appendChild(resultList);
            }
        });
    };

    routeStart_1.onkeyup = autoFinish;
    routeEnd_1.onkeyup = autoFinish;

    let searchRouteOk = document.getElementById('search-route-ok');
    searchRouteOk.onclick = () => {
        let routeTask = new RouteTask({
            url: 'http://localhost:6080/arcgis/rest/services/app/Element/NAServer/%E8%B7%AF%E5%BE%84'
        });
        let routeTaskParams = new RouteParameters({
            stops: new FeatureSet(),
            returnDirections: true
        });

        for(let x in routeParams) {
            let stop = new Graphic({
                geometry: routeParams[x],
                symbol: {
                    type: "simple-marker",
                    color: [255, 0, 0, 0.5],
                    size: 7,
                    outline: {
                        width: 1,
                        color: [255, 0, 0, 0.5]
                    }
                }
            });
            routeTaskParams.stops.features.push(stop);
        }
        routeTask.solve(routeTaskParams).then((data) => {

            view.graphics.removeAll();
            let graphic = new Graphic({
                geometry: data.routeResults[0].route.geometry,
                symbol: {
                    type: "simple-line",
                    color: '#6964ad',
                    width: 5
                }
            });
            view.graphics.add(graphic);
        })
    };

    let user = document.getElementsByClassName('user')[0];
    let logout = document.getElementsByClassName('logout')[0];

    user.onclick = function() {
        if(!logout.style || logout.style.visibility === 'hidden') {
            logout.style.visibility = 'visible';
        }
        else {
            logout.style.visibility = 'hidden';
        }
    };

});