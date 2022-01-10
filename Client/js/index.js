print_article = function(article){
		const divElem = document.getElementById('result');
		var data = document.createElement('div');
		data.classList.add("article");
		data.innerHTML = "<div><div class='article-text'><i>Recommended Article</i></div><div class='date'>"+article.created + "</div><div class='article-text'>" + article.text + "</div><div id='likes" + article.id +"'></div></div><div id='comments" + article.id +"'></div>";
		divElem.appendChild(data);

};
		
get_rec_article = function(user_id){
		const xhr2 = new XMLHttpRequest();
		xhr2.open('GET','http://localhost:8081/recommend/' + user_id);
		xhr2.send();
		xhr2.onreadystatechange = function(){
		
			if (xhr2.readyState == 4){
				if (xhr2.status == 200){
					const results = JSON.parse(xhr2.responseText);
					//console.log(results);
					
					for (var i=0; i < results.length; i++) {
						var article = results[i];	
						print_article(article);
					}
				}
			}
		};
		
	};

create_page = function(){
	
	get_rec_article(current_user.id);
	
}

window.addEventListener( "load", function () {
		check_login(create_page);
});
	
