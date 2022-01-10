var user = null;
var likes = [];

submit_message = function(to_id){
	var txt = document.getElementById('mymsg').value;
	var dt = new Date();
	var dtstring = dt.getFullYear()
	+ '-' + pad2(dt.getMonth()+1)
	+ '-' + pad2(dt.getDate())
	+ ' ' + pad2(dt.getHours())
	+ ':' + pad2(dt.getMinutes())
	+ ':' + pad2(dt.getSeconds());

	var obj = {from_id: current_user.id, to_id: to_id, created: dtstring, text:txt, isRead: 0};
	console.log(obj);
	var url = "http://localhost:8081/message";
	req = new XMLHttpRequest();
	req.open("POST", url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));	
	req.onreadystatechange = reload;		
}

function pad2(number) {   
	var str = '' + number;
	while (str.length < 2) {
		str = '0' + str;
	}
   
	return str;
}

function reload(article_id){
	location.reload();
}

get_messages = function(id1, id2){
	const xhr = new XMLHttpRequest();
	xhr.open('GET','http://localhost:8081/messages/' + id1 + '/' + id2);
	xhr.send();
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4){
			if (xhr.status == 200){
				const results = JSON.parse(xhr.responseText);
				//console.log(results);
				messages = results;
					
				const divElem = document.getElementById('result');
				var data = document.createElement('div');
				data.classList.add("messages");
				
				for (var i=0; i < messages.length; i++) {
					message = messages[i];
					
					var msg = document.createElement('div');
					var msg_class = 'msg-their';
					if (message.from_id == id1){
						msg_class = 'msg-mine';
					}
					msg.innerHTML = "<div class='" + msg_class + "'><div class='date'>"+message.created + "</div><div class='msg-text'>" + message.text + "</div></div>";
					
					data.appendChild(msg);
				}

				//new messge form
				var msg_form = document.createElement('div');
				msg_form.classList.add("msg-form");
				msg_form.innerHTML = "<div class='msg-text'>New Message:<br><textarea id='mymsg' cols='50'></textarea><br>"+
				"<button onclick='submit_message(" + id2 +")'>Submit</button></div>";
				
				data.appendChild(msg_form);

				divElem.appendChild(data);
			}
		}
	};
};
	
	
create_page = function(){	
	queryString = window.location.search
	urlParams = new URLSearchParams(queryString);
	var id = urlParams.get('id');
//	console.log(id);
		
	const xhr = new XMLHttpRequest();
	xhr.open('GET','http://localhost:8081/users/' + id);
	xhr.send();
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4){
					if (xhr.status == 200){
						const results = JSON.parse(xhr.responseText);
						//console.log(results);
						user = results[0];
						
						const title = document.getElementById('fullname');
						title.innerHTML = user.name + " " + user.surname;
					}
		}
	};

	get_messages(current_user.id, id);
}

window.addEventListener( "load", function () {
	check_login(create_page);
});
