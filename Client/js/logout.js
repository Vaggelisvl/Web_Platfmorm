window.addEventListener( "load", function () {
  	const xhr = new XMLHttpRequest();
	xhr.open('GET','http://localhost:8081/logout/');
	xhr.send();
} );
		
	
