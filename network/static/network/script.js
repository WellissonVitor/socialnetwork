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
            post.classList.add("mb-3");
            post.innerHTML = `
                <div class="post align-content-center">
                    <div class="mb-3">${element.poster}<br>On: ${element.timestamp}</div>
                    <div>${element.content}</div>
                </div>
            `;
            document.querySelector('#posts').append(post);
        });
    });

    // Push page to history and url
    history.pushState({posts: posts}, "", `${posts}`);
}