submit_cv = function(){
	
	var category = document.getElementById('category').value;
	var title = document.getElementById('title').value;
	var description = document.getElementById('description').value;
	var year_start = parseInt(document.getElementById('year_start').value);
	var year_end = parseInt(document.getElementById('year_end').value);
	var public_check = document.getElementById('public').checked;
	var isPublic = 0;
	if(public_check){
		isPublic = 1;
	}
	
	var obj = {user_id: current_user.id, category: category, title: title, description: description, year_start: year_start, year_end: year_end, isPublic: isPublic};
	
	var url = "http://127.0.0.1:8081/cv";
	var req = new XMLHttpRequest();
	req.open("POST", url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));	
	
	req.onreadystatechange = function(){
		if (req.readyState == 4){
					if (req.status == 200){
						window.location.href = 'user.html?id=' + current_user.id;
					}
		}
	}
};

create_page = function(){
	return true;
}

window.addEventListener( "load", function () {
	check_login(create_page);
});


