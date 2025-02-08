import { Auth } from "./auth.js";

const API_BASE = "https://679fbd2024322f8329c4820f.mockapi.io/twitter";

export const API = {
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const users = await response.json();
      return users.find(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() &&
          u.password === password
      );
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const users = await response.json();

      const usernameExists = users.some(
        (u) => u.username.toLowerCase() === userData.username.toLowerCase()
      );

      if (usernameExists) {
        throw new Error("Ім`я користувача вже заняте");
      }

      const registerResponse = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      return await registerResponse.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async getPosts() {
    try {
      const response = await fetch(`${API_BASE}/posts`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  },

  async createPost(post) {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  async deletePost(postId) {
    try {
      await fetch(`${API_BASE}/posts/${postId}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  },

  async likePost(postId) {
    try {
      const user = Auth.getCurrentUser();
      if (!user) throw new Error("Користувач не авторизований");

      const postResponse = await fetch(`${API_BASE}/posts/${postId}`);
      const post = await postResponse.json();

      const hasLiked = post.likedBy.includes(user.id);

      const updatedLikedBy = hasLiked
        ? post.likedBy.filter((id) => id !== user.id)
        : [...post.likedBy, user.id];

      const updatedLikesCount = hasLiked
        ? post.likesCount - 1
        : post.likesCount + 1;

      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          likedBy: updatedLikedBy,
          likesCount: updatedLikesCount,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  },

  async updateUserAvatar(userId, avatarUrl) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl })
        });
        return await response.json();
    } catch (error) {
        console.error('Помилка оновлення аватара:', error);
        throw error;
    }
},

  async getUserPosts(userId) {
    try {
      const response = await fetch(`${API_BASE}/posts?authorId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }
  },

  async getUser(id) {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  async updateUserProfile(updateData) {
    try {
        const user = Auth.getCurrentUser();
        const response = await fetch(`${API_BASE}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...user,
                ...updateData
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Помилка оновлення профілю:', error);
        throw error;
    }
},
};
