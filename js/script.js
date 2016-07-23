// here is a valid comment
// also here is one
function showPostArea() {
  document.getElementById('postArea').style.maxHeight = '800px';
  document.getElementById('postButtonFull').style.visibility = 'hidden';
  document.getElementById('postButtonMobile').style.visibility = 'hidden';
  document.getElementById('postButtonMobile').style.maxHeight = '0';
}

// more valid comments
function hidePostArea() {
  document.getElementById('postTitle').value = "";
  document.getElementById('postBody').value = "";
  document.getElementById('postImage').value = "";
  document.getElementById('postArea').style.maxHeight = '0';
  document.getElementById('postButtonFull').style.visibility = 'visible';
  document.getElementById('postButtonMobile').style.visibility = 'visible';
  document.getElementById('postButtonMobile').style.maxHeight = '500px';
}

function validatePost() {
  postTitle = document.getElementById('postTitle');
  postBody = document.getElementById('postBody');
  
  if (postTitle.value === "") {
    alert("You must at least have a title.");
    postTitle.focus();
  } else {
    submitPost();
  }
}

function isValidPost(post, link) {
  if (link.length > 0) {
    if (!(link.match(/\.(jpeg|jpg|gif|png)$/) != null)) return false;
    if (link.includes('"') || link.includes(">") || link.includes("<")) return false;
  }
  
  if (post.includes('<') || post.includes('>')) return false;
  
  return true;
}

function submitPost() {
  if (!isValidPost(postBody.value+postTitle.value, postImage.value)) {
    alert("Something is wrong with your post. Avoid using quotes and angle braces, and make sure the URL is an image.");
    return;
  }
  
  D = new Date();
  
  if (postIsReply()) {
    replyId = document.getElementById("postTitle").value.substring(1, 7);
    
    $.get("https://api.myjson.com/bins/1cme3", function(obj, textStatus, jqXHR) {
      postLocation = -1;
      
      for (i = 0; i < obj.posts.length; i++) {
        if (obj.posts[i].id === replyId) postLocation = i;
      }
      
      if (postLocation == -1) {
        alert("Cannot find post. Please try again, or avoid using a 7-digit long Title beginning with @");
      } else {
        obj.posts[postLocation].date = D.getTime();
        obj.posts[postLocation].comments.push(document.getElementById("postBody").value);
      }
      
      $.ajax({
        url:"https://api.myjson.com/bins/1cme3",
        type:"PUT",
        data:JSON.stringify(obj),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data, textStatus, jqXHR){
          hidePostArea();
          numPosts = 5;
          document.getElementById('morePostsButton').style.visibility = "visible";
          loadPosts();
        }
      });
    });
  } else {
    $.get("https://api.myjson.com/bins/1cme3", function(obj, textStatus, jqXHR) {
      newPost = {
        id : Math.floor(Math.random()*15728639 + 1048576).toString(16),
        date : D.getTime(),
        title : postTitle.value,
        body : postBody.value,
        img : postImage.value,
        comments : []
      };
      
      obj.posts.push(newPost);
      
      $.ajax({
        url:"https://api.myjson.com/bins/1cme3",
        type:"PUT",
        data:JSON.stringify(obj),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(data, textStatus, jqXHR){
          hidePostArea();
          numPosts = 5;
          document.getElementById('morePostsButton').style.visibility = "visible";
          loadPosts();
        }
      });
    });
  }
}

function loadPosts() {
  $.get("https://api.myjson.com/bins/1cme3", function(obj, textStatus, jqXHR) {
    var inner = obj.sticky;

    if (obj.posts.length == 0) {
      inner += "<hr><h2 align='center'>No posts yet. Add one!</h2><br>";
    } else {
      obj.posts.sort(function(a, b){return b.date - a.date});
      
      if (numPosts >= obj.posts.length) {
        numPosts = obj.posts.length;
        document.getElementById('morePostsButton').style.visibility = 'hidden';
      }
  
      for (i = 0; i < numPosts; i++) {
        var post = obj.posts[i];
        var postDate = new Date(post.date);
        var prettyDate = postDate.toLocaleTimeString() + " - " + postDate.toLocaleDateString();
        var imgURL = (post.img.length > 0 ? "<a target='_blank' href='" + post.img + "'><img class='postImage' src='" +
            post.img + "'" + "></a><br>" : "");
        inner += "<hr><h2 id='"+post.id+"'>"+post.title+"</h2><p>"+prettyDate+"</p>";
        if (post.body.length > 0) inner += "<p>"+post.body+"</p>";
        inner += "<br>"+imgURL;
        
        if (post.comments.length > 0) {
          inner += "<h4>Comments:</h4>";
          for (j = 0; j < post.comments.length; j++) {
            inner += "<p class='comment'>-- " + post.comments[j] + "</p>";
          } 
        }
        
        inner += "<a class='postReply' onclick='beginReply(\"" + post.id + "\")'>Reply</a>";
      }
    }
    
    document.getElementById("mainBody").innerHTML = inner;
  });
}

function postIsReply() {
  var title = document.getElementById("postTitle").value;
  return (title.length == 7 && title.substring(0, 1) === "@");
}

function beginReply(id) {
  showPostArea();
  document.getElementById("postTitle").value = "@" + id;
  document.getElementById("postBody").focus();
}

function uploadFeedback(res) {
  if (res.success) {
    document.getElementById("postImage").value = res.data.link;
  } else {
    document.getElementById("postImage").value = "error uploading";
  }
}

function loadMorePosts() {
  numPosts += 5;
  loadPosts();
}

var numPosts = 5;

$("document").ready(function() {
  hidePostArea();
  loadPosts();
  
  new Imgur({
    clientid: 'bbc24d77abcf0b0',
    callback: uploadFeedback
  });
});
