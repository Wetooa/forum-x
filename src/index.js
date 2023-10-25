$(function () {
  // contants
  const DOMAIN_NAME = "http://hyeumine.com";
  const POSTS_PER_PAGE = 20;
  const MAX_CHARACTERS_ON_CREDENTIALS = 30;
  const MAX_CHARACTERS_ON_TEXT = 300;

  let currentPage = 0;
  let posts;
  let user;

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

  async function getPosts() {
    try {
      $.ajax({
        method: "GET",
        url: `${DOMAIN_NAME}/forumGetPosts.php`,
        success: (data) => {
          posts = JSON.parse(data);
          posts.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          const postsContainer = $("#posts-container");

          const start = POSTS_PER_PAGE * currentPage;
          const end = Math.min(posts.length, start + POSTS_PER_PAGE);
          let html = "";

          for (let i = start; i < end; ++i) {
            html += `
              <div class="px-2 py-4 border-t border-white/20 hover:bg-black/20 transition-all">
                <h3 class="text-xl font-bold">${posts[i].user}</h3>
                <p class="text-sm">${posts[i].date}</p>
                <p class="">${posts[i].post}</p>
              </div>
            `;
          }

          postsContainer.html(html);
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
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

      const text = $("#text").val();
      const id = user.id;

      if (text.length === 0) throw new Error("Post must not be empty!");
      if (text.length > MAX_CHARACTERS_ON_TEXT)
        throw new Error(
          `Post's character length must not exceed ${MAX_CHARACTERS_ON_TEXT}!`
        );

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumCreateUser.php`,
        data: { text, id },
        success: (data) => {
          if (!data) throw new Error("Post failed somehow...");
          else showToast("Post created successfully!");
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function deletePost() {}

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
});
