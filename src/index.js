$(function () {
  // contants
  const DOMAIN_NAME = "http://hyeumine.com";
  const POSTS_PER_PAGE = 20;
  const MAX_CHARACTERS_ON_CREDENTIALS = 30;
  const MAX_CHARACTERS_ON_TEXT = 300;

  let currentPage = 0;
  let posts;
  let user = JSON.parse(localStorage.getItem("user"));

  async function showToast(message, isError = false) {
    const toastId = `#toast`;
    $(`${toastId}-message`).html(`
      <p class="${isError && "text-red-300"} px-1">${message}</p>
    `);
    $(toastId).slideToggle("fast");

    setTimeout(() => {
      $(toastId).slideToggle("fast");
    }, 1000);
  }

  async function deletePost(id) {
    try {
      if (!user) throw new Error("You must be authenticated to delete a post!");

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumDeletePost.php?id=${id}`,
        success: (data) => {
          data = JSON.parse(data);
          if (!data && !data.success)
            throw new Error("Post deletion failed somehow...");

          posts = posts.filter((post) => post.id !== id);
          displayPosts();
          showToast("Post deleted successfully!");
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function displayPosts() {
    try {
      const postsContainer = $("#posts-container");
      const start = POSTS_PER_PAGE * currentPage;
      const end = Math.min(posts.length, start + POSTS_PER_PAGE);
      let html = "";

      for (let i = start; i < end; ++i) {
        html += `
            <div
              class="px-2 w-full break-words overflow-hidden py-4 border-t border-white/20 hover:bg-black/20 transition-all flex justify-between"
            >
              <div class="w-[90%]">
                <h3 class="text-xl font-bold">${posts[i].user}</h3>
                <p class="text-xs">${posts[i].date}</p>
                <p class="mt-2">${posts[i].post}</p>
              </div>
              <button
                class="delete-button p-1 transition-all hover:bg-white/20 rounded-lg mx-auto w-fit h-fit hover:text-red-300"
                value="${posts[i].id}"
              >⌫
              </button>
            </div>
            `;
      }

      postsContainer.html(html);
      $(".delete-button").on("click", (e) => {
        deletePost($(e.target).attr("value"));
      });
    } catch (error) {
      showToast(`${error.message}`);
    }
  }

  async function getPosts() {
    try {
      $.ajax({
        method: "GET",
        url: `${DOMAIN_NAME}/forumGetPosts.php`,
        success: (data) => {
          posts = JSON.parse(data);
          posts = posts.reverse();
          displayPosts();
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function setUser(newUser = undefined) {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      user = newUser;
    }

    $("#username-header").text(`${user.username}`);
  }

  async function createUser() {
    try {
      const inputFields = $("#auth-form > div > input");

      const inputData = {};
      for (const element of inputFields) {
        let value = $(`#${element.id}`).val();

        if (value.length === 0)
          throw new Error("Input fields must not be empty!");
        if (value.length > MAX_CHARACTERS_ON_CREDENTIALS)
          throw new Error(
            `Input field's character length must not exceed ${MAX_CHARACTERS}!`
          );
        inputData[element.id] = value;
      }

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumCreateUser.php`,
        data: inputData,
        success: (data) => {
          user = JSON.parse(data);

          setUser(user);
          showToast(`User created successfully!
          Welcome ${user.username}`);
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function loginUser() {}

  async function createPost() {
    try {
      if (!user) throw new Error("You must be authenticated to create a post!");

      const post = $("#text").val();
      const id = JSON.stringify(user.id);

      if (post.length === 0) throw new Error("Post must not be empty!");
      if (post.length > MAX_CHARACTERS_ON_TEXT)
        throw new Error(
          `Post's character length must not exceed ${MAX_CHARACTERS_ON_TEXT}!`
        );

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumNewPost.php`,
        data: { post, id },
        success: (data) => {
          data = JSON.parse(data);

          if (!data && !data.success)
            throw new Error("Post creation failed somehow...");
          else showToast("Post created successfully!");

          getPosts();
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function replyPost() {}

  async function deleteReply() {}

  function handleToggleClass() {
    $("#auth-form").toggleClass("hidden");
  }

  // on load
  $("#toast").hide();
  $("#auth-form").addClass("hidden");
  $("#create-user").on("click", createUser);
  $("#create-post").on("click", createPost);
  $("#toggle-auth-form").on("click", handleToggleClass);
  getPosts();

  if (user) setUser();
});
