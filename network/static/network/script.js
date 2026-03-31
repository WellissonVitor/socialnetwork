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
    document.querySelector('#user').style.display = 'none';
    document.querySelector('#posts').style.display = 'flex';
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
            let timestamp = document.createElement('div');
            let content = document.createElement('div');
            let like = document.createElement('div');

            user.classList.add('pointer');
            user.innerHTML = element.poster;

            timestamp.innerHTML = 'On: ' + element.timestamp;

            content.classList.add('mb-3', 'mt-3');
            content.innerHTML = element.content;

            like.classList.add('white-space', 'like', 'pointer');
            like.innerHTML = `${element.likes} <i class="bi bi-hand-thumbs-up-fill"></i>`;

            post.classList.add("mb-3", "post", "align-content-center");
            post.append(user, timestamp, content, like)

            document.querySelector('#posts').append(post);

            user.addEventListener('click', () => {
                load_user(element.poster_id)
            });

            like.addEventListener('click', () => {
                like_post(element.post_id)
            });
        });

        
    });

    // Push page to history and url
    history.pushState({posts: posts}, "", `${posts}`);
}

function load_user(user) {
    fetch(`load_user/${user}`)
    .then(response => response.json())
    .then(data => {
        document.querySelector('#user').style.display = 'block';
        document.querySelector('#posts').style.display = 'none';
        

    });
}

function like_post(post) {
    fetch()
}