import { API } from "./api.js";
import { Auth } from "./auth.js";

export const UI = {
  updateAuthUI() {
    const isAuth = Auth.isAuthenticated();
    const loginLink = document.getElementById("login-link");
    const profileLink = document.getElementById("profile-link");
    const logoutBtn = document.getElementById("logout-btn");

    if (loginLink) loginLink.style.display = isAuth ? "none" : "block";
    if (profileLink) profileLink.style.display = isAuth ? "block" : "none";
    if (logoutBtn) logoutBtn.style.display = isAuth ? "block" : "none";
  },

  async updateFeed() {
    try {
      const posts = await API.getPosts();
      const currentUserId = Auth.isAuthenticated()
        ? Auth.getCurrentUser().id
        : null;
      const container = document.getElementById("postsList");

      if (container) {
        container.innerHTML = posts
          .map(
            (post) => `
              <li class="post" data-post-id="${post.id}">
                <div class="post__details">
                  <a href="/profile.html?user=${post.authorId}" class="post__author">${post.authorName}</a>
                  <small class="post__date">${new Date(
                    post.createdAt
                  ).toLocaleDateString()}</small>
                </div>
                <p class="post__content">${post.content}</p>
                <div class="post__interactions">
                  <button class="like-btn" onclick="handleLikePost('${
                    post.id
                  }')">
                    ❤️ ${post.likesCount}
                  </button>
                  ${
                    currentUserId === post.authorId
                      ? `<button class="delete__btn" onclick="handleDeletePost('${post.id}')">
                    🗑️
                  </button>`
                      : ""
                  }
                </div>
              </li>
            `
          )
          .join("");
      }
    } catch (error) {
      console.error("Error updating feed:", error);
    }
  },

  async renderProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || Auth.getCurrentUser()?.id;
    
    if (!userId) {
        window.location.href = '/';
        return;
    }

    const user = await API.getUser(userId);
    const posts = await API.getUserPosts(userId);
    
    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('profile-email').textContent = user.email;
    
    const postsContainer = document.getElementById('user-posts');
    postsContainer.innerHTML = posts.map(post => `
              <li class="post" data-post-id="${post.id}">
                <div class="post__details">
                  <p class="post__author">${user.username}</p>
                  <small class="post__date">${new Date(
                    post.createdAt
                  ).toLocaleDateString()}</small>
                </div>
                <p class="post__content">${post.content}</p>
                <div class="post__interaction">
                  <button class="delete__btn" onclick="handleDeletePost('${
                    post.id
                  }')">
                    🗑️
                  </button>
                </div>
              </li>
            `
          )
          .join("");
      }
    };
