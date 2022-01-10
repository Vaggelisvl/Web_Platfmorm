function register() {
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
	
	const user = {name: name, surname: surname, tel: tel, email: email, password: password, profile_photo: 'user.png'};
	
	console.log(user);
	
    // Define what happens on successful data submission
	
    // Define what happens in case of error
    XHR.addEventListener( "error", function( event ) {
      alert( 'Oops! Something went wrong.' );
    } );

    // Set up our request
    XHR.open( "POST", "http://127.0.0.1:8081/register" );
	
	
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
					window.location.href = "login.html"
				}else{
					alert("Could not register");
				}
			}
		}
	};

  }

		
	
