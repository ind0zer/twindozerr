import { Auth } from "./auth.js";
import { API } from "./api.js";
import { UI } from "./ui.js";

window.handleLogin = async (event) => {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    if (await Auth.login(username, password)) {
      window.location.href = "/";
    } else {
      alert("Неправильний юзернейм чи пароль");
    }
  } catch (error) {
    alert("Помилка входу: " + error.message);
  }
};

window.handleRegister = async (event) => {
  event.preventDefault();
  const username = document.getElementById("reg-username").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  try {
    await Auth.register(username, password, email);
    window.location.href = "/";
  } catch (error) {
    alert("Помилка реєстрації: " + error.message);
  }
};

window.handleCreatePost = async () => {
  const content = document.getElementById("upload-content");
  if (content && Auth.isAuthenticated()) {
    try {
      await API.createPost({
        content: content.value,
        authorId: Auth.getCurrentUser().id,
        createdAt: new Date().toISOString(),
        authorName: Auth.getCurrentUser().username,
        likesCount: 0,
      });
      content.value = "";
      await UI.updateFeed();
    } catch (error) {
      alert("Помилка при створенні посту: " + error.message);
    }
  }
};

window.handleLikePost = async (postId) => {
  if (!Auth.isAuthenticated()) {
    alert("Для лайків треба ввійти в систему");
    window.location.href = "/login.html";
    return;
  }

  try {
    const updatedPost = await API.likePost(postId);
    const postElement = document.querySelector(
      `.post[data-post-id="${postId}"]`
    );
    if (postElement) {
      const likeButton = postElement.querySelector(".like-btn");
      likeButton.innerHTML = `❤️ ${updatedPost.likesCount}`;

      if (updatedPost.likedBy.includes(Auth.getCurrentUser().id)) {
        likeButton.classList.add("liked");
      } else {
        likeButton.classList.remove("liked");
      }
    }
  } catch (error) {
    console.error("Помилка при лайці посту:", error);
    alert("Не вдалось поставити лайк: " + error.message);
  }
};

window.handleDeletePost = async (postId) => {
  try {
    const success = await API.deletePost(postId);
    if (success) {
      if (window.location.pathname === "/profile") {
        await UI.renderProfile();
      } else {
        await UI.updateFeed();
      }
    }
  } catch (error) {
    alert("Помилка при видалені посту: " + error.message);
  }
};

window.handleLogout = () => {
  Auth.logout();
};

// const IMGUR_CLIENT_ID = 'f5cc65403baa7df';

// async function uploadToImgur(file) {
//     try {
//         const formData = new FormData();
//         formData.append('image', file);

//         const response = await fetch('https://api.imgur.com/3/image', {
//             method: 'POST',
//             headers: {
//                 Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
//             },
//             body: formData
//         });

//         const data = await response.json();
//         if (!data.success) throw new Error(data.data.error);
        
//         return data.data.link;
//     } catch (error) {
//         console.error('Помилка завантаження на Imgur:', error);
//         throw error;
//     }
// }

// const avatarInput = document.getElementById('avatar-input');
// if (avatarInput) { 
//     avatarInput.addEventListener('change', async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//         const imageUrl = await uploadToImgur(file);
        
//         const updatedUser = await API.updateUserProfile({
//             avatarUrl: imageUrl
//         });
        
//         document.getElementById('profile-avatar').src = imageUrl;
//         Auth.currentUser.avatarUrl = imageUrl;
//         localStorage.setItem('user', JSON.stringify(Auth.currentUser));
        
//     } catch (error) {
//         alert('Помилка: ' + error.message);
//     }
// })};

document.addEventListener("DOMContentLoaded", async () => {
  await Auth.checkAuth();
  UI.updateAuthUI();
  
  if (window.location.pathname.includes('profile.html')) {
      await UI.renderProfile();
  } else {
      await UI.updateFeed();
  }
});