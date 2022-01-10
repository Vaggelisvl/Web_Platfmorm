create_page = function(){
	const xhr = new XMLHttpRequest();
		xhr.open('GET','http://localhost:8081/friends/'+current_user.id);
		xhr.send();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status == 200){
					const results = JSON.parse(xhr.responseText);
					//console.log(results);
					
					col = ["name", "surname"]
					
					const divElem = document.getElementById('result');
					const table = document.createElement('table');
					
					/*
					var tr = table.insertRow(-1);
					for (var i = 0; i < col.length; i++) {
						var th = document.createElement("th");      // TABLE HEADER.
						th.innerHTML = col[i];
						tr.appendChild(th);
					}
					*/
					
					// ADD JSON DATA TO THE TABLE AS ROWS.
					for (var i = 0; i < results.length; i++) {

						tr = table.insertRow(-1);
						
						var tabCell = tr.insertCell(-1);
						
						var id = results[i]["id"];
						var name = results[i]["name"] + " " + results[i]["surname"];
							
						tabCell.innerHTML = '<a href="message.html?id=' + id +'"><img src="http://localhost:8081/images/' + results[i]['profile_photo']+'" height="20"></a> <a href="message.html?id=' + id +'">' + name + '</a>'
						
					}
					
					const title = document.createElement('h3');
					title.innerHTML = "Friends List";
					divElem.appendChild(title);
					divElem.appendChild(table);
				}
			}
		};
}

window.addEventListener( "load", function () {
		check_login(create_page);
});
	
