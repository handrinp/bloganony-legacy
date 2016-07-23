function editJson() {
  $.get("https://api.myjson.com/bins/1cme3", function(obj, textStatus, jqXHR) {
    $.ajax({
      url:"https://api.myjson.com/bins/1cme3",
      type:"PUT",
      data: document.getElementById('editJson').value,
      contentType:"application/json; charset=utf-8",
      dataType:"json",
      success: function(data, textStatus, jqXHR){
        loadJsonAndPosts();
      }
    });
  });
}

function loadJsonAndPosts() {
  $.get("https://api.myjson.com/bins/1cme3", function(obj, textStatus, jqXHR) {
    document.getElementById("editJson").value = JSON.stringify(obj, null, 2);
    
    var inner = "";

    if (obj.posts.length == 0) {
      inner += "<hr><h2 align='center'>No posts yet. Add one!</h2><br>";
    } else {
      obj.posts.sort(function(a, b){return b.date - a.date});
    }

    for (i = 0; i < obj.posts.length; i++) {
      var post = obj.posts[i];
      var postDate = new Date(post.date);
      var prettyDate = postDate.toLocaleTimeString() + " - " + postDate.toLocaleDateString();
      var imgURL = (post.img.length > 0 ? "<a target='_blank' href='" + post.img + "'><img class='postImage' src='" +
          post.img + "'" + "></a><br>" : "");
      inner += "<hr><button onclick='deletePost(\"" + post.id + "\")' class='deletebtn'>X</button><br>";
      inner += "<h2 id='"+post.id+"'>"+post.title+"</h2><p>"+prettyDate+"</p>";
      if (post.body.length > 0) inner += "<p>"+post.body+"</p>";
      inner += "<br>"+imgURL;
      
      if (post.comments.length > 0) {
        inner += "<h4>Comments:</h4>";
        for (j = 0; j < post.comments.length; j++) {
          inner += "<p class='comment'>-- " + post.comments[j] + "</p>";
        } 
      }
      
    }
    
    document.getElementById("mainBody").innerHTML = inner;
  });
}

function deletePost(postid) {
  $.get("https://api.myjson.com/bins/1cme3", function(obj, textStatus, jqXHR) {
    var newPosts = [];

    for (i = 0; i < obj.posts.length; i++) {
      if (obj.posts[i].id != postid) {
        newPosts.push(obj.posts[i]);
      }
    }

    $.ajax({
      url: "https://api.myjson.com/bins/1cme3",
      type: "PUT",
      data: JSON.stringify({
        sticky: obj.sticky,
        posts: newPosts
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data, textStatus, jqXHR){
        loadJsonAndPosts();
      }
    });
  });
}

function failsafe() {
  var str = '{"sticky": "<br><h2>User contributed?</h2><p>That\'s right. Anyone can post on here anonymously. Use the' +
            ' button above to begin a post.</p><br>","posts": []}';
  
  $.get("https://api.myjson.com/bins/1cme3", function(obj, textStatus, jqXHR) {
    $.ajax({
      url:"https://api.myjson.com/bins/1cme3",
      type:"PUT",
      data: str,
      contentType:"application/json; charset=utf-8",
      dataType:"json",
      success: function(data, textStatus, jqXHR){
        loadJsonAndPosts();
      }
    });
  });
}

$("document").ready(function() {
  loadJsonAndPosts();
});
