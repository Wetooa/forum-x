$(function () {
  // contants
  const DOMAIN_NAME = "http://hyeumine.com";
  const POSTS_PER_PAGE = 20;
  const MAX_CHARACTERS_ON_CREDENTIALS = 30;
  const MAX_CHARACTERS_ON_TEXT = 300;

  let currentPage = 0;
  let posts;
  let user;
  let toastCount = 0;

  async function showToast(message, isError = false) {
    const currentCount = toastCount++;
    const toast = `
<div id="toast${currentCount}" class="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200">
        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.147 15.085a7.159 7.159 0 0 1-6.189 3.307A6.713 6.713 0 0 1 3.1 15.444c-2.679-4.513.287-8.737.888-9.548A4.373 4.373 0 0 0 5 1.608c1.287.953 6.445 3.218 5.537 10.5 1.5-1.122 2.706-3.01 2.853-6.14 1.433 1.049 3.993 5.395 1.757 9.117Z"/>
        </svg>
        <span class="sr-only">Fire icon</span>
    </div>
    <div class="ml-3 text-sm font-normal">${message}</div>
    <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-default" aria-label="Close">
        <span class="sr-only">Close</span>
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
    </button>
</div>

  `;

    let bodyElement = $("#body");
    bodyElement.html(toast + bodyElement.innerHtml);

    let timeout = setTimeout(() => {
      bodyElement.remove(`#toast${currentCount}`);
      clearTimeout(timeout);
    }, 5000);
  }

  async function getPosts() {
    try {
      $.ajax({
        method: "GET",
        url: `${DOMAIN_NAME}/forumGetPosts.php`,
        success: (data) => {
          posts = JSON.parse(data);
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
      alert(`${err.message}`);
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
      alert(`${err.message}`);
    }
  }

  async function loginUser() {}

  async function createPost() {
    try {
      const text = $("#text");
      const id = user.id;

      if (!id) throw new Error("You must be authenticated to create a post!");
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
          else alert("Post created successfully!");
        },
      });
    } catch (err) {
      alert(`${err.message}`);
    }
  }

  async function deletePost() {}

  async function replyPost() {}

  async function deletePost() {}

  function handleToggleClass() {
    $("#auth-form").toggleClass("hidden");
  }

  // on load
  $("#auth-form").addClass("hidden");
  $("#create-user").on("click", createUser);
  $("#create-post").on("click", createPost);
  $("#toggle-auth-form").on("click", handleToggleClass);
  getPosts();
});
