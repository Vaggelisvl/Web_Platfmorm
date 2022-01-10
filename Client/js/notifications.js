accept = function(other_id){
	const xhr = new XMLHttpRequest();
		xhr.open('POST','http://localhost:8081/friend_req_accept/'+current_user.id+'/'+other_id);
		xhr.send();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status == 200){
					location.reload();
				}
			}
		}
}

reject = function(other_id){
	const xhr = new XMLHttpRequest();
		xhr.open('POST','http://localhost:8081/friend_req_delete/'+current_user.id+'/'+other_id);
		xhr.send();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status == 200){
					location.reload();
				}
			}
		}
}

create_page = function(){
	const xhr = new XMLHttpRequest();
		xhr.open('GET','http://localhost:8081/get_friend_reqs/'+current_user.id);
		xhr.send();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status == 200){
					const results = JSON.parse(xhr.responseText);
					//console.log(results);
					
					col = ["name", "surname"]
					
					const divElem = document.getElementById('result');
					const table = document.createElement('table');
					
					
					// ADD JSON DATA TO THE TABLE AS ROWS.
					for (var i = 0; i < results.length; i++) {

						tr = table.insertRow(-1);
						
						var tabCell = tr.insertCell(-1);
						
						var id = results[i]["id"];
						var name = results[i]["name"] + " " + results[i]["surname"];
						tabCell.innerHTML = "<a href='user.html?id=" + id +"'>" + name + "</a>";
							
						var tabCell2 = tr.insertCell(-1);
						tabCell2.innerHTML = "<button onclick='accept(" + id + ")'>Accept</button>";
						
						var tabCell3 = tr.insertCell(-1);
						tabCell3.innerHTML = "<button onclick='reject(" + id + ")'>Reject</button>";
					}
					
					const title = document.createElement('h3');
					title.innerHTML = "Friend Requests List";
					divElem.appendChild(title);
					divElem.appendChild(table);
				}
			}
		};
}

window.addEventListener( "load", function () {
		check_login(create_page);
});
	
