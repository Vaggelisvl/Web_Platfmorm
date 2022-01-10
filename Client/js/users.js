add_friend = function(me, other){
	var obj = {id:me,other_id:other};
	
	var url = "http://localhost:8081/friend_req/"+me+"/"+other;
	req = new XMLHttpRequest();
	req.open("POST", url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));	
	req.onreadystatechange = function(){
			if (req.readyState == 4){
				if (req.status == 200){
					alert('Friend Request sent!');
				}
			}
	}
}

get_users = function (friends_list) {
	var friend_ids = [];
	for (var i = 0; i < friends_list.length; i++) {
		friend_ids[i] = friends_list[i].id;
	}
	console.log(friend_ids);
	
	
		const xhr = new XMLHttpRequest();
		xhr.open('GET','http://localhost:8081/users/');
		xhr.send();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status == 200){
					const results = JSON.parse(xhr.responseText);
					console.log(results);
					
					
					var col_names = ['Profile',	'Email', 'Name',	'Surname',	'Tel', 'Add to network'];
					var col = [' ', 'email', 'name', 'surname', 'tel'];
					
					const divElem = document.getElementById('result');
					const table = document.createElement('table');
					var tr = table.insertRow(-1);
					for (var i = 0; i < col_names.length; i++) {
						var th = document.createElement("th");      // TABLE HEADER.
						th.innerHTML = col_names[i];
						tr.appendChild(th);
					}
	
					// ADD JSON DATA TO THE TABLE AS ROWS.
					for (var i = 0; i < results.length; i++) {

						tr = table.insertRow(-1);
						var id = results[i]['id']
						for (var j = 0; j < col.length; j++) {
							var tabCell = tr.insertCell(-1);
							if(j == 0){
								tabCell.innerHTML = '<a href="user.html?id=' + id +'"><img src="http://localhost:8081/images/' + results[i]['profile_photo']+'" height="20"></a>';
							}else {
								tabCell.innerHTML = results[i][col[j]];
							}
						}
						var tabCell = tr.insertCell(-1);
						if((current_user.id != id) && !friend_ids.includes(id)){
							tabCell.innerHTML = "<button onclick='add_friend("+current_user.id+ "," +id+ ")'>Connect</button>";
						}else{
							tabCell.innerHTML = "";
						}
					}
					
					divElem.appendChild(table);
				}
			}
		};
};

get_friends = function () {
			const xhr = new XMLHttpRequest();
			xhr.open('GET','http://localhost:8081/friends/'+current_user.id);
			xhr.send();
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4){
					if (xhr.status == 200){
						var friends_list = JSON.parse(xhr.responseText);
						get_users(friends_list);
					}
				}
			};
		};

window.addEventListener( "load", function(){
	check_login(get_friends);
	});
