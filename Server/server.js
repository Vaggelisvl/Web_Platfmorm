var express = require('express');
var bodyParser = require("body-parser");
var session = require('express-session');
var cookieParser = require("cookie-parser");
var app = express();
var mysql = require('mysql');
var mf = require('matrix-factorization');
var cors = require('cors');
var formidable = require('formidable');
var fs = require('fs');


app.use(cors())


const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
	secret: 'secret',
	resave: true,
	cookie: { maxAge: oneDay },
	saveUninitialized: true
}));

app.use(cookieParser());

var session;

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

//mysql connection
var con = mysql.createConnection({
  host: "localhost",
  port:3306,
  user: "root",
  password: "root",
  database: "professional_network"
});

//connect to mysql
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

//get all likes (user-article pairs)
all_likes = function(){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM likes";
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	

}

//get recommended articles for a user
app.get('/recommend/:user_id', function (req, res) {
   user_id = req.params.user_id;
   
   all_likes().then(function(results){
		maxU = 0;
		maxA = 0;
		for(var i=0; i < results.length; i++){
			tmp = results[i];
			if(tmp.user_id > maxU){
				maxU = tmp.user_id;
			}
			if(tmp.article_id > maxA){
				maxA = tmp.article_id;
			}
		}

	   var arr = Array.from(Array(maxU), () => new Array(maxA).fill(0));
		
		//ids in databas are 1-based, array is 0-based
	   for(var i=0; i < results.length; i++){
		   tmp = results[i];
		   arr[tmp.user_id-1][tmp.article_id-1] = 1;
	   }
	   //console.log(arr);
	   
	   //Matrix Factorization
	   var latentFeatureCount = 2
		var factors = mf.factorizeMatrix(arr, latentFeatureCount)
		var completeMatrix = mf.buildCompletedMatrix(factors)
	   //console.log(completeMatrix);
	   
	   score = completeMatrix[user_id-1];
	   //console.log(score);
	   
	   //in already liked articles set 0
	   for(var i=0; i < results.length; i++){
		   if(tmp.user_id == user_id){
			 score[tmp.article_id-1] = 0;  
		   }
	   }
	   //console.log(score);
	   
	   //get article with max score
	   recommend = 0;
	   max_score = 0;
	   for(var i=0; i < score.length; i++){
		   if(score[i] > max_score){
			   max_score = score[i];
			   recommend = i+1;
		   }
	   }
	   
	  get_article(recommend).then(function(results){
		   //console.log(results);
		   res.send(results);
	   });
   
   });
	   
	  
});
 
app.post('/register', function (req, res) {
	user = req.body;
	
	//console.log(user);
	create_user(user).then(function(results){
	   console.log(results);
	   res.send(results);
   });

})


login_user = function(user){
	return new Promise(function(resolve, reject){
		var query = "SELECT * FROM users WHERE email ='" + user.email + "' AND password='" + user.password + "'";
		//console.log( query);
		  con.query(query, function (err, result) {
				if (err) {
					return reject("Error");
				}else{
					
					resolve(result);
				}	
		  });
	  });
}

app.post('/login', function (req, res) {
	console.log('LOGIN');
	user = req.body;	
	//console.log(user);
	
	login_user(user).then(function(results){
		if(results.length>0){
			req.session.loggedin = true;
			req.session.user_id	= results[0].id;
			req.session.user_name	= results[0].name;
			req.session.user_surname	= results[0].surname;
			req.session.user_tel	= results[0].tel;
			req.session.user_email	= results[0].email;
			req.session.user_password	= results[0].password;
			session=req.session;			
		}
	   res.send(results);
   });
})
 

app.get('/check_login', function (req, res) {
	//console.log(session);	
	if(session.loggedin){
		results = '{"id":' + session.user_id + ', "name":"' + session.user_name + '", "surname":"' + session.user_surname + '", "tel":"' + session.user_tel + '", "email":"' + session.user_email + '", "password":"' + session.user_password + '"}';
		res.send(results);
	}else{
		results = "{\"id\": -1}";
		res.send(results);
	}
})

app.get('/logout',(req,res) => {
	req.session.destroy();
	session = null;
	results="{}";
    res.send(results);
});

get_user = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM users WHERE id=" + id ;
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
	});	
}

get_users = function(){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM users";
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
}


app.get('/users', function (req, res) {
   
   get_users().then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})


app.get('/users/:id', function (req, res) {
   id = req.params.id;
   
   get_user(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})


get_friends = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM users WHERE id IN (SELECT id1 AS id from network WHERE id2="+id+ " AND accepted=1 UNION SELECT id2 AS id from network WHERE id1="+id+ " AND accepted=1)";
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
}

app.get('/friends/:id', function (req, res) {
   id = req.params.id;
   
   get_friends(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})

get_friend_reqs = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM users WHERE id IN (SELECT id1 AS id from network WHERE id2="+id+ " AND accepted=0)";
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
}

app.get('/get_friend_reqs/:id', function (req, res) {
   id = req.params.id;
   
   get_friend_reqs(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})


friend_req = function(id, other_id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "INSERT INTO network(id1, id2, accepted) VALUES ("+id+ "," + other_id + ",0)";
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
}


app.post('/friend_req/:id/:other_id', function (req, res) {
	id = req.params.id;
	other_id = req.params.other_id;
	
	
	friend_req(id, other_id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})


friend_req_accept = function(id, other_id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "UPDATE network SET accepted=1 WHERE id1=" + other_id + " AND id2=" + id;
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
}


app.post('/friend_req_accept/:id/:other_id', function (req, res) {
	id = req.params.id;
	other_id = req.params.other_id;
	
	
	friend_req_accept(id, other_id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})

friend_req_delete = function(id, other_id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "DELETE FROM network WHERE id1=" + other_id + " AND id2=" + id;
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
}


app.post('/friend_req_delete/:id/:other_id', function (req, res) {
	id = req.params.id;
	other_id = req.params.other_id;
	
	
	friend_req_delete(id, other_id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})

check_unique = function(user){
	return new Promise(function(resolve, reject){
		var query = "SELECT COUNT(*) FROM users WHERE email='" + user.email + "'";
		
		  con.query(query, function (err, result) {
				if (err) {
					return reject("Error");
				}else{
					resolve("Success");
				}	
		  });
	  });
}

create_user = function(user){
	return new Promise(function(resolve, reject){
		var query = "INSERT INTO users (name, surname, email, password, tel, profile_photo) VALUES ('" + user.name +"', '" + user.surname + "', '" + user.email + "', '" + user.password + "', '" + user.tel + "', '" + user.profile_photo + "')";
		
		con.query(query, function (err, result) {
			if (err) {
				return reject("Error");
			}else{
				resolve("Success");
			}	
		});
	});
}

update_user = function(user){
	return new Promise(function(resolve, reject){
		var query = "UPDATE users SET name='" + user.name +"', surname='" + user.surname + "', email='" + user.email + "', password='" + user.password + "', tel='" + user.tel + "' WHERE id=" + user.id;			
		
		con.query(query, function (err, result) {
			if (err) {
				return reject("Error");
			}else{
				session.user_name	= user.name;
				session.user_surname	= user.surname;
				session.user_tel	= user.tel;
				session.user_email	= user.email;
				session.user_password	= user.password;
				resolve("Success");
			}	
		});
	});
}


app.post('/update_user', function (req, res) {
	user = req.body;
	
	//console.log(user);
	update_user(user).then(function(results){
	   res.send(results);
   });

})

create_article = function(article){
	return new Promise(function(resolve, reject){
		var query = "INSERT INTO articles (`user_id`, `created`, `text`) VALUES ('" + article.user_id +"', '" + article.created + "', '" + article.text + "')";
		//console.log( query);
		con.query(query, function (err, result) {
			if (err) {
				return reject("Error");
			}else{
				resolve("Success");
			}	
		});
	});
}

app.post('/article', function (req, res) {
	data = req.body;
	//console.log(data);
	
	create_article(data).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})

get_article = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		var query = "SELECT * FROM articles WHERE id=" + id ;
		//console.log(query);
		con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		});
	});	
}

app.get('/article/:id', function (req, res) {
   id = req.params.id;
   
   get_article(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})

get_article_by_user = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		var query = "SELECT * FROM articles WHERE user_id=" + id + " ORDER BY created DESC";
		//console.log(query);
		con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		});
	});	
}

app.get('/article/byuser/:id', function (req, res) {
   id = req.params.id;
   
   get_article_by_user(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})

create_comment = function(comment){
	return new Promise(function(resolve, reject){
		var query = "INSERT INTO comments (`article_id`, `user_id`, `created`, `text`) VALUES ('" + comment.article_id +"', '" + comment.user_id +"', '" + comment.created + "', '" + comment.text + "')";
		//console.log( query);
		  con.query(query, function (err, result) {
				if (err) {
					return reject("Error");
				}else{
					resolve("Success");
				}	
		  });
	  });
}

app.post('/comment', function (req, res) {
	data = req.body;
	//console.log(data);
	
	create_comment(data).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
})

get_comments_by_article = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM comments WHERE article_id=" + id ;
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
}

app.get('/comment/byarticle/:id', function (req, res) {
   id = req.params.id;
   
   get_comments_by_article(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});


create_cv = function(cv){
	return new Promise(function(resolve, reject){
		var query = "INSERT INTO cv (`user_id`, `category`, `title`, `description`, `year_start`, `year_end`, `isPublic`) VALUES ('" + cv.user_id +"', '" + cv.category + "', '" + cv.title + "', '" + cv.description + "', '" + cv.year_start + "', '" + cv.year_end + "', '" + cv.isPublic + "')";
		//console.log( query);
		  con.query(query, function (err, result) {
				if (err) {
					return reject("Error");
				}else{
					resolve("Success");
				}	
		  });
	  });
};

app.post('/cv', function (req, res) {
	data = req.body;
	//console.log(data);
	
	create_cv(data).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});

get_cv_by_user = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM cv WHERE user_id=" + id ;
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
};

app.get('/cv/byuser/:id', function (req, res) {
   id = req.params.id;
   
   get_cv_by_user(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});

create_like = function(like){
	return new Promise(function(resolve, reject){
		var query = "INSERT INTO likes (article_id, user_id) VALUES (" + like.article_id +", " + like.user_id + ")";
		//console.log( query);
		  con.query(query, function (err, result) {
				if (err) {
					return reject("Error");
				}else{
					resolve("Success");
				}	
		  });
	  });
};

app.post('/like', function (req, res) {
	data = req.body;
	//console.log(data);
	
	create_like(data).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});


get_likes_by_article = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM likes WHERE article_id=" + id ;
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
};

app.get('/likes/byarticle/:id', function (req, res) {
   id = req.params.id;
   
   get_likes_by_article(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});

create_message = function(message){
	return new Promise(function(resolve, reject){
		var query = "INSERT INTO messages (`from_id`, `to_id`, `created`, `text`, `isRead`) VALUES ('" + + message.from_id +"', '" + message.to_id +"', '" + message.created + "', '" + message.text + "', '" + message.isRead +   "')";
		//console.log( query);
		  con.query(query, function (err, result) {
				if (err) {
					return reject("Error");
				}else{
					resolve("Success");
				}	
		  });
	  });
};

app.post('/message', function (req, res) {
	data = req.body;
	//console.log(data);
	
	create_message(data).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});

get_messages_by_users = function(id1, id2){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM messages WHERE (from_id=" + id1 + " OR from_id=" + id2 + ") AND (to_id=" + id2 + " OR to_id=" + id1 + ") ORDER BY created";
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
};

app.get('/messages/:id1/:id2', function (req, res) {
   id1 = req.params.id1;
   id2 = req.params.id2;
   
   get_messages_by_users(id1, id2).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});


create_network = function(network){
	return new Promise(function(resolve, reject){
		var query = "INSERT INTO network (`id1`, `id2`, `accepted`) VALUES ('" + + network.id1 +"', '" + network.id2 +"', '" + network.accepted + "')";
		//console.log( query);
		  con.query(query, function (err, result) {
				if (err) {
					return reject("Error");
				}else{
					resolve("Success");
				}	
		  });
	  });
};

app.post('/network', function (req, res) {
	data = req.body;
	//console.log(data);
	
	create_network(data).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});

get_network_by_user = function(id){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "SELECT * FROM network WHERE id1=" + id + " OR id2=" + id;
		  //console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve(results);
			}		
		  });
		});	
};

app.get('/network/byuser/:id', function (req, res) {
   id = req.params.id;
   
   get_network_by_user(id).then(function(results){
	   //console.log(results);
	   res.send(results);
   });
});


update_photo = function(id, file){
	return new Promise(function(resolve, reject){
	   //read user
		  var query = "UPDATE users SET profile_photo='" + file + "' WHERE id=" + id;
		  console.log(query);
		  con.query(query, function (err, results) {
			if (err) {
				return reject(err);
			}else{
				resolve('Success');
			}		
		  });
		});
}

app.post('/profile_image_upload/:id', function (req, res) {
	id = req.params.id;
	
	var fname = '';
	var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
		console.log(files);
      var oldpath = files.photo.path;
	  fname = 'user' + id + '_' + files.photo.name;
	  var newpath = 'images/' + fname
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        
		update_photo(id, fname).then(function(results){
		   //console.log(results);
		   res.send('Success! Go back to <a href="user.html?id=' + session.user_id +'">Profile</a>');
		});
		
      });
	});
	
	
});

//to server static files, i.e., images
app.use(express.static(__dirname));

var server = app.listen(8081, function () {
   var host = "https://127.0.0.1";//server.address().address
   var port = server.address().port
   console.log("App listening at https://%s:%s", host, port)
})