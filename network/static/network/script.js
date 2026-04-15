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

    // Load and append posts
    fetch(`load_posts/${posts}?page=${page}`)
    .then(response => response.json())
    .then(data => {
        
        render_posts(data.posts);
        pagination(data.pagination, posts);

        // Push page to history and url
        history.pushState({posts: posts, page:page}, "", `${posts}?page=${page}`);
    });

    // Push page to history and url
    history.pushState({posts: posts, page:page}, "", `${posts}?page=${page}`);
}


// Render Posts
function render_posts(posts) {
    const posts_container = document.querySelector('#posts');

    // Create containers and append posts
    posts.forEach(data => {
        // Create containers
        const post = document.createElement('div');
        const user = document.createElement('div');
        const body = document.createElement('div');

        // Append User
        const user_pic = document.createElement('img');
        user_pic.src = data.pic_url;
        user_pic.classList.add('user-pic', 'mb-1');

        const username = document.createElement('div');
        username.innerHTML = data.poster;
        username.classList.add('mb-1', 'pointer', 'text-center');

        const timestamp = document.createElement('div');
        timestamp.innerHTML = 'On: ' + data.timestamp.replace(',', ',<br>');
        timestamp.style.fontSize = '9pt';

        user.classList.add('post-user', 'd-flex', 'flex-column', 'justify-content-center', 'align-items-center');
        user.append(user_pic, username, timestamp);

        // Append posts
        const content = document.createElement('div');
        content.innerHTML = data.content;
        content.classList.add('mb-3');

        const like = document.createElement('div');
        like.innerHTML = `${data.likes} <i class="bi bi-hand-thumbs-up-fill"></i>`;
        like.classList.add('white-space', 'like', 'pointer');

        like.addEventListener('click', () => like_post(data.post_id));

        body.classList.add('d-flex', 'flex-column', 'justify-content-center');
        body.append(content, like);

        post.classList.add('d-flex', 'post', 'mb-3', 'align-content-center');
        post.append(user, body);

        posts_container.append(post);
    });
}

// handles pagination
function pagination(pagination, posts) {
    // Get buttons
    let previous_button = document.querySelector('#previous');
    let previous_number = document.querySelector('#previous_number');
    let current = document.querySelector('#current');
    let next_number = document.querySelector('#next_number');
    let next_button = document.querySelector('#next');
    let total_pages = document.querySelector('#total_pages');

    // Erase previous event listeners and add fresh one if not disabled and has a function
    const new_event = (target, event, disabled) => {
        const newTarget = target.cloneNode(true);
        target.parentNode.replaceChild(newTarget, target);

        if (!disabled && event) {
            newTarget.addEventListener("click", event);
        }

        return newTarget;
    };

    // Previous Button
    previous_button = new_event(previous_button, () => load_posts(posts, pagination.previous), !pagination.has_previous);
    previous_button.classList.toggle("disabled", !pagination.has_previous);

    // Previous Number
    previous_number.innerHTML = pagination.has_previous ? pagination.previous : pagination.current;
    previous_number.classList.toggle("active", !pagination.has_previous);
    previous_number = new_event(previous_number, pagination.has_previous ? () => load_posts(posts, pagination.previous) : null,
        !pagination.has_previous
    );

    // Current
    current.innerHTML = pagination.current;
    current.classList.add("active");
    current = new_event(current, () => load_posts(posts, pagination.current), false);

    // Next Number
    next_number.innerHTML = pagination.has_next ? pagination.next : pagination.current;
    next_number.classList.toggle("active", !pagination.has_next);
    next_number = new_event(next_number, pagination.has_next ? () => load_posts(posts, pagination.next) : null,
        !pagination.has_next
    );

    // Next Button
    next_button = new_event(next_button, () => load_posts(posts, pagination.next), !pagination.has_next);
    next_button.classList.toggle("disabled", !pagination.has_next);

    // Total Pages
    total_pages.innerHTML = pagination.total_pages;
}

// Likes Function
function like_post(post) {
    PUT()
}