// When site is loaded create event listener and load all posts
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#all').addEventListener('click', () => load_posts('all', 1));
    if (document.querySelector('#following')) {
        document.querySelector('#following').addEventListener('click', () => load_posts('following', 1));
    }
    if (document.querySelector('#username')) {
        username = document.querySelector('#username').value;
        document.querySelector('#username').addEventListener('click', () => load_user(username));
    }

    // If requesting from following page load following posts, else load all posts
    const path = window.location.pathname.split('/');
    if (path[0] === "/posts" && path[1] === "following") {
        load_posts('following', '1');
    }
    else {
        load_posts('all', '1');
    }
});


// Load posts based on link clicked
function load_posts(posts, page) {
    if (document.querySelector('#new_post')) {
        document.querySelector('#new_post').style.display = 'block';
    }
    // Clear posts before reloading
    document.querySelector('#posts').innerHTML = '';

    // load pagination buttons
    let previous = document.querySelector('#previous');
    let previous_number = document.querySelector('#previous_number');
    let current = document.querySelector('#current');
    let next_number = document.querySelector('#next_number');
    let total_pages = document.querySelector('#total_pages');
    let next = document.querySelector('#next');

    // Load and append posts
    fetch(`load_posts/${posts}?page=${page}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        // Create and append posts
        data.posts.forEach(element => {
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
            username.classList.add('mb-1', 'pointer','text-center');
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

            like.addEventListener('click', () => like_post(element.post_id));
        });

        // Set pagination innerHTML and eventlistener
        if (!data.pagination.has_previous) {
            previous.classList.add("disabled");
            previous.classList.remove("active");
            previous.removeEventListener('click', () => load_posts(posts, data.pagination.previous));

            previous_number.innerHTML = data.pagination.current;
            previous_number.classList.add("active");
            previous_number.removeEventListener("click", () => load_posts(posts, data.pagination.previous));

            current.innerHTML = data.pagination.next;
            current.classList.remove("active");
            current.addEventListener("click", () => load_posts(posts, data.pagination.next));

            next_number.innerHTML = (data.pagination.next + 1);
            next_number.classList.remove("active");
            next_number.addEventListener("click", () => load_posts(posts, (data.pagination.next + 1)));

            next.classList.remove("disabled");
            next.addEventListener('click', () => load_posts(posts, (data.pagination.next + 1)));
        }
        else if (!data.pagination.has_next) {
            previous.classList.remove("disabled");
            previous.addEventListener('click', () => load_posts(posts, data.pagination.previous));

            previous_number.innerHTML = (data.pagination.previous - 1);
            previous_number.classList.remove("active");
            previous_number.addEventListener("click", () => load_posts(posts, (data.pagination.previous - 1)));

            current.innerHTML = data.pagination.previous;
            current.classList.remove("active");
            current.addEventListener("click", () => load_posts(posts, data.pagination.previous));

            next_number.innerHTML = data.pagination.current;
            next_number.classList.add("active");
            next_number.addEventListener("click", () => load_posts(posts, data.pagination.current));

            next.classList.add("disabled");
            next.classList.remove("active");
            next.removeEventListener('click', () => load_posts(posts, data.pagination.previous));
        }
        else {
            previous.classList.remove("disabled");
            previous.classList.remove("active");
            previous.addEventListener('click', () => load_posts(posts, data.pagination.previous));

            previous_number.innerHTML = data.pagination.previous;
            previous_number.classList.remove("active");
            previous_number.addEventListener("click", () => load_posts(posts, data.pagination.previous));

            current.innerHTML = data.pagination.current;
            current.classList.add("active");
            current.addEventListener("click", () => load_posts(posts, data.pagination.current));

            next_number.innerHTML = data.pagination.next;
            next_number.classList.remove("active");
            next_number.addEventListener("click", () => load_posts(posts, data.pagination.next));

            next.classList.remove("disabled");
            next.classList.remove("active");
            next.addEventListener("click", () => load_posts(posts, data.pagination.next));
        }

        total_pages.innerHTML = data.pagination.total_pages;
    });

    // Push page to history and url
    history.pushState({posts: posts, page:page}, "", `${posts}?page=${page}`);
}


// Handles pagination

function pagination(posts, page) {
    
}

// Likes Function
function like_post(post) {
    PUT()
}