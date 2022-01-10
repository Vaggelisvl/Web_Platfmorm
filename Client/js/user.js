var user = null;

var likes = [];

like = function(user_id, article_id){
	var obj = {"user_id": user_id, "article_id":article_id};
	
	var url = "http://localhost:8081/like";
	req = new XMLHttpRequest();
	req.open("POST", url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));	
	req.onreadystatechange = reload;		
};

submit_comment = function(article_id){
	var txt = document.getElementById('mycomment').value;
	var dt = new Date();
	var dtstring = dt.getFullYear()
	+ '-' + pad2(dt.getMonth()+1)
	+ '-' + pad2(dt.getDate())
	+ ' ' + pad2(dt.getHours())
	+ ':' + pad2(dt.getMinutes())
	+ ':' + pad2(dt.getSeconds());

	var obj = {article_id: article_id, user_id: current_user.id, created: dtstring, text:txt}
	console.log(obj);
	var url = "http://localhost:8081/comment";
	req = new XMLHttpRequest();
	req.open("POST", url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));	
	req.onreadystatechange = reload;		
};

submit_article = function(){
	var txt = document.getElementById('myarticle').value;
	var dt = new Date();
	var dtstring = dt.getFullYear()
	+ '-' + pad2(dt.getMonth()+1)
	+ '-' + pad2(dt.getDate())
	+ ' ' + pad2(dt.getHours())
	+ ':' + pad2(dt.getMinutes())
	+ ':' + pad2(dt.getSeconds());

	var obj = {user_id: current_user.id, created: dtstring, text:txt}
	console.log(obj);
	var url = "http://localhost:8081/article";
	req = new XMLHttpRequest();
	req.open("POST", url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(obj));	
	req.onreadystatechange = reload;		
};

function pad2(number) {   
	var str = '' + number;
	while (str.length < 2) {
		str = '0' + str;
	}
   
	return str;
};

function reload(article_id){
	location.reload();
};

get_likes = function(id){
		const xhr = new XMLHttpRequest();
			xhr.open('GET','http://localhost:8081/likes/byarticle/' + id);
			xhr.send();
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4){
					if (xhr.status == 200){
						const results = JSON.parse(xhr.responseText);
						//console.log(results);
						likes = results;
						
						liked = false;
						for(var i=0; i< likes.length;i++){
							if (likes[i].user_id == current_user.id){
								liked = true;
								break;
							}
						}
						
						const divElem = document.getElementById('likes' + id);
						if(liked){
							divElem.innerHTML = likes.length + " Likes (You like this)";
						}
						else{
							divElem.innerHTML = likes.length + " Likes <button onclick='like(" + current_user.id + ","+ id +")'>Like</button>";
						}
					}
				}
			};
	};
	
get_comments = function(id){
	const xhr = new XMLHttpRequest();
		xhr.open('GET','http://localhost:8081/comment/byarticle/' + id);
		xhr.send();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status == 200){
					const results = JSON.parse(xhr.responseText);
					console.log(results);
					comments = results;
					
					var divElem = document.getElementById('comments' + id);
					for(var i=0; i< comments.length;i++){
						var data = document.createElement('div');
						data.classList.add("comment");
						data.innerHTML = comments[i].text;
						divElem.appendChild(data);
					}
					
					var data = document.createElement('div');
					data.classList.add("comment");
					data.innerHTML = "New Comment:<br><textarea id='mycomment' cols='50'></textarea><br>"+
					"<button onclick='submit_comment(" + id +")'>Submit</button>";
					divElem.appendChild(data);
					
				}
			}
		};
};

print_article = function(article){
		const divElem = document.getElementById('result');
		var data = document.createElement('div');
		data.classList.add("article");
		data.innerHTML = "<div><div class='date'>"+article.created + "</div><div class='article-text'>" + article.text + "</div><div class='likes' id='likes" + article.id +"'></div></div><div id='comments" + article.id +"'></div>";
		divElem.appendChild(data);

};

get_cv = function(id){
	const xhr = new XMLHttpRequest();
		xhr.open('GET','http://localhost:8081/cv/byuser/' + id);
		xhr.send();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4){
				if (xhr.status == 200){
					const results = JSON.parse(xhr.responseText);
					console.log(results);
					cv = results;
					
					var cv_div = document.getElementById('cv');
					
						
					for(var i=0; i< cv.length;i++){
						var data = document.createElement('div');
						data.classList.add("cv-item");
						data.innerHTML = cv[i].category + ": " + cv[i].title + "<br>" + cv[i].description + "<br>"+ cv[i].year_start + "-" + + cv[i].year_end;
						cv_div.appendChild(data);
					}
					
					//if current user, show add link
					if(id == current_user.id){
						var data = document.createElement('div');
						data.innerHTML = '<a href="cv.html">Add</a>'
						cv_div.appendChild(data);
					}
					
				}
			}
		};
};

create_page = function(){
	queryString = window.location.search
		urlParams = new URLSearchParams(queryString);
		var id = urlParams.get('id');
		console.log(id);
		
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
							
							var cv = document.getElementById('cv');
							var img = document.createElement('div');
							img.innerHTML = '<img src="http://localhost:8081/images/' + user.profile_photo+'" height="100" style="padding: 10px 0"></a>';
							
							if(id == current_user.id){
								img.innerHTML = img.innerHTML + ' <br><a href="profile_photo.html">Change Profile Picture</a><br><br>';
							}
							
							cv.appendChild(img);
							
							if(id != current_user.id){ //do not show link to message to self
								const msg = document.getElementById('message');
								msg.innerHTML = "<a href='message.html?id=" + id +"'>Message</a>";
							}
						}
			}
		};


		get_cv(id);

		const xhr2 = new XMLHttpRequest();
		xhr2.open('GET','http://localhost:8081/article/byuser/' + id);
		xhr2.send();
		xhr2.onreadystatechange = function(){
		
			if (xhr2.readyState == 4){
				if (xhr2.status == 200){
					const results = JSON.parse(xhr2.responseText);
					//console.log(results);
					
					//new article form
					if(id==current_user.id){
						const divElem = document.getElementById('result');
						var data = document.createElement('div');
						data.classList.add("article");
						data.innerHTML = "<div class='article-text'>New Article:<br><textarea id='myarticle' cols='50'></textarea><br>"+
						"<button onclick='submit_article()'>Submit</button></div>";
						divElem.appendChild(data);
					}
					for (var i=0; i < results.length; i++) {
						var article = results[i];
													
						print_article(article);
						
						likes = [];
						get_likes(article.id);
						
						comments = [];
						get_comments(article.id);
						
					}
					
					
					
				}
			}
		};
};

window.addEventListener( "load", function () {
	check_login(create_page);
});
