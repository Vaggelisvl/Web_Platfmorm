function update() {
    const XHR = new XMLHttpRequest();

	
	const name = document.getElementById( "name" ).value;
	const surname = document.getElementById( "surname" ).value;
	const tel = document.getElementById( "tel" ).value;
	const email = document.getElementById( "email" ).value;
	const password = document.getElementById( "password" ).value;
	
	if(name == "" || surname == "" || tel == "" || email == "" || password == ""){
		alert("Please fill all fields");
		return;
	}
	
	const user = {id:current_user.id, name: name, surname: surname, tel: tel, email: email, password: password, profile_photo: ''};
	
	console.log(user);
	
    // Define what happens on successful data submission
	
    // Define what happens in case of error
    XHR.addEventListener( "error", function( event ) {
      alert( 'Oops! Something went wrong.' );
    } );

    // Set up our request
    XHR.open( "POST", "http://127.0.0.1:8081/update_user");
	
	
    // The data sent is what the user provided in the form
	const myJSON = JSON.stringify(user); 
	//console.log(myJSON);
	
	XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send(myJSON);
	
	XHR.onreadystatechange = function(){
		if (XHR.readyState == 4){
			if (XHR.status == 200){
				const result = XHR.responseText;
				console.log(result);
				
				if(result == "Success"){
					//go to login
					window.location.href = "settings.html"
				}else{
					alert("Could not update data");
				}
			}
		}
	};

  }


create_page = function(){
	
	document.getElementById( "name" ).value = current_user.name;
	document.getElementById( "surname" ).value = current_user.surname;
	document.getElementById( "tel" ).value = current_user.tel;
	document.getElementById( "email" ).value = current_user.email;
	document.getElementById( "password" ).value = current_user.password;
	
}
		
window.addEventListener( "load", function () {
		check_login(create_page);
});	
