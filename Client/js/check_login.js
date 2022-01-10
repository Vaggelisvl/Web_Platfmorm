var current_user = null;
check_login = function (callback) {

	const xhr = new XMLHttpRequest();
	xhr.open('GET','http://localhost:8081/check_login/');
	xhr.send();
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4){
					if (xhr.status == 200){
						console.log(xhr.responseText);
						const results = JSON.parse(xhr.responseText);
						console.log(results);
						
						if(results.id == -1){
							window.location.href = 'login.html';
						}else{
							current_user = results;
							var profile = document.getElementById('profile');
							profile.setAttribute('href', 'user.html?id='+results.id);
							callback();
						}
						
					}
		}
	};

};
