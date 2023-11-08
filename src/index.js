import { DOMAIN_NAME, ON_PROD, POSTS_PER_PAGE } from "./lib/constants.js";
import { isLoggedIn, showToast, validateInputFields } from "./lib/helper.js";

let currentPage = 1;
let posts;
let user = JSON.parse(localStorage.getItem("user"));
let postsTemplate;
let postFocusTemplate;

$(function () {
  $.ajax({
    method: "GET",
    url: "./templates/post.hbs",
    dataType: "html",
    success: (data) => {
      postsTemplate = data;
    },
  });

  $.ajax({
    method: "GET",
    url: "./templates/postFocus.hbs",
    dataType: "html",
    success: (data) => {
      postFocusTemplate = data;
    },
  });

  $.ajax({
    method: "GET",
    url: "./templates/toast.hbs",
    dataType: "html",
    success: (data) => {
      $("body").prepend(data);
      $("#toast").hide();
    },
  });

  async function deletePost(id) {
    try {
      isLoggedIn(user);

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumDeletePost.php?id=${id}`,
        success: (data) => {
          data = JSON.parse(data);
          if (!data && !data.success)
            throw new Error("Post deletion failed somehow...");

          getPosts();
          showToast("Post deleted successfully!");
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function renderPosts() {
    try {
      let htmlTemplate = Handlebars.compile(postsTemplate);

      const end = Math.min(posts.length, POSTS_PER_PAGE * currentPage);
      const postsWithOwner = posts.splice(0, end).map((post) => {
        if (post.reply) {
          post.reply = post.reply.map((r) => {
            return {
              ...r,
              isOwner: r.uid == user.id,
            };
          });
        } else {
          post.reply = [];
        }

        return {
          ...post,
          isOwner: post.uid == user.id,
        };
      });

      const postsContainer = $("#posts-container");
      const context = { data: postsWithOwner };
      postsContainer.html(htmlTemplate(context));

      $(".delete-button").on("click", (e) => {
        deletePost($(e.target).attr("value"));
      });

      $(".reply-button").on("keydown", (e) => {
        if (e.keyCode !== 13) return;
        replyPost($(e.target).attr("id").split("-")[2]);
      });

      $(".delete-reply-button").on("click", (e) => {
        deleteReply($(e.target).attr("value"));
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
          renderPosts();
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
      const inputData = validateInputFields(inputFields);

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

  async function loginUser() {
    try {
      const inputFields = $("#auth-form > div > input");
      const inputData = validateInputFields(inputFields);

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumLogin.php`,
        data: inputData,
        success: (data) => {
          data = JSON.parse(data);

          if (!data && !data.success)
            throw new Error("User login failed somehow...");

          setUser(user);
          showToast(`User logged in successfully!
          Welcome ${user.username}`);
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function createPost() {
    try {
      isLoggedIn(user);

      const post = $("#postInput").val();
      const id = JSON.stringify(user.id);
      const inputData = { post, id };

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumNewPost.php`,
        data: inputData,
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

  async function replyPost(postId) {
    try {
      isLoggedIn(user);

      const replyInput = $(`#reply-input-${postId}`).val();
      const inputData = {
        reply: replyInput,
        post_id: postId,
        user_id: user.id,
      };

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumReplyPost.php`,
        data: inputData,
        success: (data) => {
          data = JSON.parse(data);

          if (!data && !data.success)
            throw new Error("Reply creation failed somehow...");
          else showToast("Reply created successfully!");

          getPosts();
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  async function deleteReply(id) {
    try {
      isLoggedIn(user);

      $.ajax({
        method: "POST",
        url: `${DOMAIN_NAME}/forumDeleteReply.php?id=${id}`,
        success: (data) => {
          data = JSON.parse(data);

          if (!data && !data.success)
            throw new Error("Reply deletion failed somehow...");
          else showToast("Reply deletion successfully!");

          getPosts();
        },
      });
    } catch (err) {
      showToast(`${err.message}`, true);
    }
  }

  function handleToggleClass() {
    $("#auth-form").toggleClass("hidden");
  }

  // on load
  $("#auth-form").addClass("hidden");
  $("#create-user").on("click", createUser);
  $("#login-user").on("click", loginUser);
  $("#create-post").on("click", createPost);
  $("#toggle-auth-form").on("click", handleToggleClass);

  getPosts();

  if (user) setUser();
});
