// When site is loaded create event listener and load all posts
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#all').addEventListener('click', () => load_posts('all'));
    if (document.querySelector('#following')) {
        document.querySelector('#following').addEventListener('click', () => load_posts('following'));
    }
    if (document.querySelector('#username')) {
        username = document.querySelector('#username').value;
        document.querySelector('#username').addEventListener('click', () => load_user(username));
    }

    // If requesting from following page load following posts, else load all posts
    const path = window.location.pathname.split('/');
    if (path[0] === "/posts" && path[1] === "following") {
        load_posts('following')
    }
    else {
        load_posts('all')
    }
});


// Load posts based on link clicked
function load_posts(posts) {
    if (document.querySelector('#new_post')) {
        document.querySelector('#new_post').style.display = 'block';
    }
    // Clear posts before reloading
    document.querySelector('#posts').innerHTML = '';

    // Load and append posts
    fetch(`load_posts/${posts}`)
    .then(response => response.json())
    .then(data => {
        data.forEach(element => {
            let post = document.createElement('div');

            let user = document.createElement('div');
            let user_pic = document.createElement('img');
            let username = document.createElement('div');
            let timestamp = document.createElement('div');

            let body = document.createElement('div');
            let content = document.createElement('div');
            let like = document.createElement('div');
            
            post.classList.add('d-flex', 'post');

            user.classList.add('post-user', 'd-flex', 'flex-column',  'justify-content-center', 'align-items-center');
            user_pic.src = element.pic_url;
            user_pic.classList.add('user-pic', 'mb-1')
            username.innerHTML = element.poster;
            username.classList.add('mb-1', 'pointer')
            timestamp.innerHTML = 'On: ' + element.timestamp.replace(',', ',<br>');
            timestamp.style.fontSize = '9pt';
            timestamp.classList.add('text-center');

            user.append(user_pic, username, timestamp);

            body.classList.add('d-flex', 'flex-column', 'justify-content-center');
            content.classList.add('mb-3');
            content.innerHTML = element.content;
            like.classList.add('white-space', 'like', 'pointer');
            like.innerHTML = `${element.likes} <i class="bi bi-hand-thumbs-up-fill"></i>`;

            body.append(content, like);

            post.classList.add("mb-3", "post", "align-content-center");
            post.append(user, body)

            document.querySelector('#posts').append(post);

            like.addEventListener('click', () => {
                like_post(element.post_id)
            });
        });      
    });

    // Push page to history and url
    history.pushState({posts: posts}, "", `${posts}`);
}

function like_post(post) {
    PUT()
}