document.addEventListener('DOMContentLoaded', function() {
    const like_buttons = document.querySelectorAll(".post-like");

    like_buttons.forEach(button => {
        button.addEventListener("click", () => like(button.dataset.id))
    })
})

function like(post_id) {
    fetch(`like_post/${post_id}`, {
        method: "PUT",
        body: JSON.stringify({
            like:true
        })
    })
}