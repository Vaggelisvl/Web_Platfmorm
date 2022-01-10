window.addEventListener( "load", function () {
  function sendData() {
    const XHR = new XMLHttpRequest();

	const email = document.getElementById( "email" ).value;
	const password = document.getElementById( "password" ).value;
	
	const user = {email: email, password: password};
	
    // Define what happens on successful data submission
	
    // Define what happens in case of error
    XHR.addEventListener( "error", function( event ) {
      alert( 'Oops! Something went wrong.' );
    } );

    // Set up our request
    XHR.open( "POST", "http://127.0.0.1:8081/login" );
	
	
    // The data sent is what the user provided in the form
	const myJSON = JSON.stringify(user); 
	//console.log(myJSON);
	
	XHR.setRequestHeader("Content-Type", "application/json");
    XHR.send(myJSON);
	
	XHR.onreadystatechange = function(){
					if (XHR.readyState == 4){
						if (XHR.status == 200){
							const result = JSON.parse(XHR.responseText);
							console.log(result);
							if(result.length>0){
								//go to index

								window.location.href = "index.html"
								
								
							}else{
								alert("Could not login");
							}
						}
					}
				};
			
  }

  // Access the form element...
  const form = document.getElementById( "myForm" );

  // ...and take over its submit event.
  form.addEventListener( "submit", function ( event ) {
    event.preventDefault();

    sendData();
  } );
} );
		
	
