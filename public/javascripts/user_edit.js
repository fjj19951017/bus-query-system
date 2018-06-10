$(function(){

    let tbody = document.getElementsByTagName('tbody')[0];

    //查询
    $.ajax({
        url:'/admin/getUser',
        type:'get',
        data: {type: 'search'},
        success: function(data,status){
            if(status === 'success'){
                console.log(data);
                for(let x in data) {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `<td id="username-${x}">${data[x].uname}</td>
                                <td>${data[x].upassword}</td>
                                <td><button class="btn btn-danger" id="delete-${x}">删除</button></td>`;
                    tbody.appendChild(tr);
                }
            }
        },
        error: function(data,status){
            if(status === 'error'){
                console.log('error');
            }
        }
    });

    //删除
    tbody.onclick = function(e) {
        if(e.target.className.toLowerCase() === 'btn btn-danger') {
            let deleteTargetId = document.getElementById(`username-${e.target.id.split('-')[1]}`);
            let userName = deleteTargetId.innerHTML;
            $.ajax({
                url:'/admin/getUser',
                type:'get',
                data: {
                    type: 'delete',
                    uname: userName
                },
                success: function(data,status){
                    location.href = '/admin/user_edit';
                },
                error: function(data,status){
                    if(status === 'error'){
                        console.log('error');
                    }
                }
            });
        }
    }

});
