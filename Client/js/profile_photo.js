submit_photo = function(){
	
	if(document.getElementById("file").value == ""){
		alert('Select a file!');
		return;
	}
	
	var photo = document.getElementById("file").files[0];  // file from input
	
	var req = new XMLHttpRequest();
	var formData = new FormData();

	formData.append("photo", photo);                                
	req.open("POST", 'http://localhost:8081/profile_image_upload/' + current_user.id);
	req.send(formData);
	req.onreadystatechange = function(){
		if (req.readyState == 4){
			if(req.status == 200){
				//go back to profile
				window.location.href = 'user.html?id='+current_user.id;
			}
		}
	}
	
}


create_page = function(){
	/*var elem = document.getElementById('form');
	elem.setAttribute('action', 'http:localhost:8081/profile_image_upload/' + current_user.id);*/
	return;
}

window.addEventListener( "load", function () {
	check_login(create_page);
});


