require([
    "esri/layers/FeatureLayer",
    "dojo/domReady!"
], function(FeatureLayer) {

    let featureLayer = new FeatureLayer({
        url: "http://localhost:6080/arcgis/rest/services/app/Element2/FeatureServer/2",
        outFields : ["*"]
    });

    //描述活动页码的左右两边各有几个非活动页码
    window.leftDistance = 0;
    window.rightDistance = 4;


    let queryAllStation = function() {
        let query = featureLayer.createQuery();
        query.returnGeometry = false;
        query.where = "name <> ''";
        return featureLayer.queryFeatures(query);
    };

    let queryStationByName = function() {
        let searchData = document.getElementById('name').value;
        let query = featureLayer.createQuery();
        query.returnGeometry = false;
        let queryLanguage = `name = '${searchData}'`;
        query.where = queryLanguage;
        return featureLayer.queryFeatures(query);
    };

    let queryStationByOid = function(id) {
        let query = featureLayer.createQuery();
        query.returnGeometry = false;
        let queryLanguage = `OBJECTID = '${id}'`;
        query.where = queryLanguage;
        return featureLayer.queryFeatures(query);
    };


    let displayResults = function(data) {

        let pagination = document.getElementById('pagination');
        let table = document.getElementsByTagName('table')[0];
        let pagination_2 = document.getElementsByClassName('pagination');
        //首先清除表格的内容，以及重置页码
        let checkTbody = document.getElementsByTagName('tbody');
        if(checkTbody. length !== 0) {
            table.innerHTML = `<thead>
                <tr>
                    <th>编号</th>
                    <th>线路名称</th>
                    <th>途径站点</th>
                    <th>票价</th>
                    <th>首末班</th>
                    <th>操作</th>
                </tr>
            </thead>`;
        }
        pagination.innerHTML = '';
        window.leftDistance = 0;
        window.rightDistance = 4;

        const pageSize = 3; //每页显示3条数据
        let pageNum = Math.ceil(data.features.length / pageSize); //页数
        let tbody = [];
        let li = [];

        //显示换页栏
        for(let x of pagination_2) {
            x.style.visibility = 'visible';
        }

        for(let i = 0; i < pageNum; i++) {
            //生成表格
            tbody[i] = document.createElement('tbody');
            tbody[i].id = `tbody-${i}`;
            if(i === 0) {
                tbody[i].className = 'visible';
            }
            else {
                tbody[i].className = 'hidden';
            }
            //生成换页栏
            li[i] = document.createElement('li');
            li[i].style.position = 'relative';
            li[i].style.left = '0';
            if(i === 0) {
                li[i].innerHTML = `<span style="cursor: pointer">${i + 1}</span>`;
                li[i].className = 'active active-page';
            }
            else {
                li[i].innerHTML = `<span style="cursor: pointer">${i + 1}</span>`;
            }

        }
        for(let x in data.features) {

            let index = parseInt(x / pageSize);
            let tableRow = `<tr>
                    <td>${data.features[x].attributes.OBJECTID}</td>
                    <td>${data.features[x].attributes.name}</td>
                    <td>${data.features[x].attributes.station}</td>
                    <td>${data.features[x].attributes.price}</td>
                    <td>${data.features[x].attributes.timetable}</td>
                    <td>
                        <div class="btn-group" id="objectId-${data.features[x].attributes.OBJECTID}">
                            <button class="btn btn-default" id="update-${x}">修改</button><button class="btn btn-danger" id="delete-${x}">删除</button>
                        </div>
                    </td>
                </tr>`;
            tbody[index].innerHTML += tableRow;
        }



        tbody.forEach(function(x) {
            table.appendChild(x);
        });

        li.forEach(function(x) {
            pagination.appendChild(x);
        });

    };

    //显示所有数据
    let showAllData = document.getElementById('show-all-data');
    showAllData.onclick = function() {
        queryAllStation().then(displayResults);
    };

    //显示搜索结果
    let search = document.getElementById('search-data');
    search.onclick = function() {
        queryStationByName().then(displayResults);
    };

    let table = document.getElementsByClassName('table')[0];
    let tableResponsive = document.getElementsByClassName('table-responsive')[0];
    tableResponsive.addEventListener('click', editStation);
    table.addEventListener('click', deleteStation);

    let edit = document.getElementsByClassName('edit')[0];

    //编辑
    function editStation(e) {
        if(e.target.className.toLowerCase() === 'btn btn-default') {
            edit.className = 'edit-active';
            let commitEdit = document.getElementById('commit-edit');
            let cancel = document.getElementById('cancel-edit');
            let stationName = document.querySelector('#station-name');
            let route = document.querySelector('#route');
            let price = document.querySelector('#price');
            let timetable = document.querySelector('#timetable');
            commitEdit.onclick = function() {

                let targetId = e.target.parentNode.id.split('-')[1];
                queryStationByOid(targetId).then(function(data) {

                    let updateFeature = data.features[0];
                    updateFeature.attributes.name = stationName.value;
                    updateFeature.attributes.station = route.value;
                    updateFeature.attributes.price = '¥' + stationName.value;
                    updateFeature.attributes.timetable = route.value;

                    featureLayer.applyEdits({
                        updateFeatures: [updateFeature]
                    });
                }).then(queryAllStation).then(displayResults);
                //关闭编辑窗口
                edit.className = 'edit';
            };
            cancel.onclick = function() {
                stationName.value = '';
                route.value = '';
                edit.className = 'edit';
            }
        }
    }

    //删除
    function deleteStation(e) {
        if(e.target.className.toLowerCase() === 'btn btn-danger') {
            let confirmMessage = confirm('确认删除？');
            if(confirmMessage) {
                let targetId = e.target.parentNode.id.split('-')[1];
                queryStationByOid(targetId).then(function(data) {
                    const deleteFeature = {
                        objectId: data.features[0].attributes.OBJECTID
                    };
                    featureLayer.applyEdits({
                        deleteFeatures: [deleteFeature]
                    });
                }).then(queryAllStation).then(displayResults);
            }
        }
    }

    function nextPage() {
        let pagination = document.getElementById('pagination');
        let visible = document.querySelector('.visible');
        let activePage = document.querySelector('.active-page');
        let children = pagination.children;

        if(!visible.nextSibling) {
            alert('已经是最后一页');
            return;
        }
        visible.nextSibling.className = 'visible';
        visible.className = 'hidden';
        activePage.nextSibling.className = 'active active-page';
        activePage.className = '';

        if(window.rightDistance === 0) {
            for(let i of children) {
                i.style.left = `${parseInt(i.style.left) - 34}px`;
            }
        }
        else {
            window.rightDistance--;
            window.leftDistance++;
        }
    }

    function previousPage() {
        let pagination = document.getElementById('pagination');
        let visible = document.querySelector('.visible');
        let activePage = document.querySelector('.active-page');
        let children = pagination.children;

        if(visible.id.toLowerCase() === 'tbody-0') {
            alert('已经是第一页');
            return;
        }
        visible.previousSibling.className = 'visible';
        visible.className = 'hidden';
        activePage.previousSibling.className = 'active active-page';
        activePage.className = '';

        if(window.leftDistance === 0) {
            for(let i of children) {
                i.style.left = `${parseInt(i.style.left) + 34}px`;
            }
        }
        else {
            window.rightDistance++;
            window.leftDistance--;
        }
    }

    let pagination = document.getElementById('pagination');
    pagination.onclick = goToPage;

    function goToPage(e) {
        let pagination = document.getElementById('pagination');
        let visible = document.querySelector('.visible');
        let activePage = document.querySelector('.active-page');
        if(e.target.tagName.toLowerCase() === 'span') {
            let previousId = visible.id.split('-')[1];
            let nowId = e.target.innerHTML - 1;
            //刷新表格内容
            visible.className = 'hidden';
            document.getElementById(`tbody-${nowId}`).className = 'visible';
            //刷新活动页码
            activePage.className = '';
            e.target.parentNode.className = 'active active-page';
            //维护window.leftDistance和window.rightDistance的性质
            window.leftDistance += nowId - previousId;
            window.rightDistance -= nowId - previousId
        }
    }

    let arrow = document.getElementsByClassName('arrow');
    arrow[0].onclick = nextPage;
    arrow[1].onclick = previousPage;
});
