import Vue from "vue";
import Vuex from "vuex";
import router from "../router/index";
import i18n from "./i18n";
import api from "./api";
import { handleError } from "../utils/functions";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: null,
    token: localStorage.getItem("token") || "",
    darkTheme: localStorage.getItem("theme") || false, // 1 = dark, 0 = light
    loadingStatus: false,
  },

  plugins: [createPersistedState()],

  actions: {
    /* auth */

    login({ commit }, user) {
      commit("SET_LOADING_STATUS", true);

      return api
        .post("/login", user)
        .then((response) => {
          commit("SET_LOADING_STATUS", false);
          commit("SET_USER", response.data.user);

          setTimeout(() => {
            commit("SET_TOKEN", response.data.token);
            Vue.swal(i18n.t("success"), i18n.t("signed_in"), "success").then(
              (result) => {
                if (result.isConfirmed) {
                  router.go();
                }
                router.push("/home");
              }
            );
          }, 800);
        })
        .catch((error) => {
          commit("SET_LOADING_STATUS", false);
          setTimeout(() => {
            handleError(error);
          }, 800);
        });
    },

    logout({ commit }) {
      commit("LOGOUT");
      setTimeout(() => {
        commit("REMOVE_TOKEN");
        Vue.swal(i18n.t("success"), i18n.t("signed_out"), "success").then(
          (result) => {
            if (result.isConfirmed) {
              router.push("/home");
            }
          }
        );
      }, 500);
    },

    register({ commit }, newUser) {
      commit("SET_LOADING_STATUS", true);

      return api
        .post("/register", newUser)
        .then((response) => {
          commit("SET_LOADING_STATUS", false);
          commit("SET_USER", response.data.user);

          setTimeout(() => {
            commit("SET_TOKEN", response.data.token);
            Vue.swal(
              i18n.t("success"),
              i18n.t("register.account_created"),
              "success"
            ).then((result) => {
              if (result.isConfirmed) {
                router.push("/home");
              }
            });
          }, 800);
        })
        .catch((error) => {
          commit("SET_LOADING_STATUS", false);
          setTimeout(() => {
            handleError(error);
          }, 800);
        });
    },

    /* user */

    getUser({ commit }, userId) {
      // get /user/:id
      commit("SET_LOADING_STATUS", true);
      return new Promise((resolve, reject) => {
        api
          .get("/user/" + userId)
          .then((response) => {
            commit("SET_LOADING_STATUS", false);
            resolve(response.data);
          })
          .catch((error) => {
            commit("SET_LOADING_STATUS", false);
            setTimeout(() => {
              handleError(error);
            }, 900);
            reject(null);
          });
      });
    },

    getUserPosts({ commit }, userId) {
      // get /user/:id/posts
      commit("SET_LOADING_STATUS", true);
      return new Promise((resolve, reject) => {
        api
          .get("/user/" + userId + "/posts")
          .then((response) => {
            commit("SET_LOADING_STATUS", false);
            console.dir(response.data);
            resolve(response.data);
          })
          .catch((error) => {
            commit("SET_LOADING_STATUS", false);
            setTimeout(() => {
              handleError(error);
            }, 900);
            reject(null);
          });
      });
    },

    getUserAvatar({ commit }, userId) {
      return `${api.defaults.baseURL}/user/${userId}/avatar`;
    },

    updateUserAvatar({ commit }, avatar) {
      commit("SET_LOADING_STATUS", true);

      const formData = new FormData();
      formData.append("avatar", avatar);

      api
        .post("/avatar", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          commit("SET_LOADING_STATUS", false);
          Vue.swal
            .fire(i18n.t("success"), response.data.message, "success")
            .then((result) => {
              if (result.isConfirmed) {
                router.go();
              }
            });
        })
        .catch((error) => {
          commit("SET_LOADING_STATUS", false);
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    updateUserProfile({ commit }, data) {
      // PUT /user
      commit("SET_LOADING_STATUS", true);

      return new Promise((resolve, reject) => {
        api
          .put("/user", data, {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          })
          .then((response) => {
            commit("SET_LOADING_STATUS", false);
            commit("SET_USER", response.data.user);
            Vue.$toast.success(response.data.message);
            resolve(response.data.user);
          })
          .catch((error) => {
            commit("SET_LOADING_STATUS", false);
            setTimeout(() => {
              handleError(error);
            }, 900);
            reject(null);
          });
      });
    },

    deleteUser({ commit }) {
      // delete /user (+token)
      commit("SET_LOADING_STATUS", true);
      api
        .delete("/user", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          commit("SET_LOADING_STATUS", false);
          commit("LOGOUT");
          commit("REMOVE_TOKEN");
          Vue.swal.fire(i18n.t("success"), response.data.message, "success");
          router.push("/home");
        })
        .catch((error) => {
          commit("SET_LOADING_STATUS", false);
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    getAllUsers({ commit }) {
      commit("SET_LOADING_STATUS", true);

      return new Promise((resolve, reject) => {
        api
          .get("/users")
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            setTimeout(() => {
              handleError(error);
            }, 900);
            reject(null);
          })
          .finally(() => {
            commit("SET_LOADING_STATUS", false);
          });
      });
    },

    /* comments */

    getComments({ commit }, postId) {
      // get /post/:id/comments
      commit("SET_LOADING_STATUS", true);
      return new Promise((resolve, reject) => {
        api
          .get("/post/" + postId + "/comments")
          .then((response) => {
            commit("SET_LOADING_STATUS", false);
            resolve(response.data);
          })
          .catch((error) => {
            commit("SET_LOADING_STATUS", false);
            setTimeout(() => {
              handleError(error);
            }, 900);
            reject(null);
          });
      });
    },

    commentOnPost({ commit }, { post: postId, comment: content }) {
      // post /post/:id/comments
      api
        .post(
          `/post/${postId}/comments`,
          { content: content },
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        )
        .catch((error) => {
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    /* likes */

    likePost({ commit }, postId) {
      // post /post/:id/like

      api
        .put(`/post/${postId}/like`, undefined, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .catch((error) => {
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    unlikePost({ commit }, postId) {
      // delete /post/:id/like

      api
        .delete(`/post/${postId}/like`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .catch((error) => {
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    /**
     * Check if I (the user) like a specific post
     * @param {number} postid The post identifier
     * @returns {boolean} true if liked the post, false otherwise
     */
    DoILikeThePost({ commit }, postid) {
      // GET /post/:id/like
      commit("SET_LOADING_STATUS", true);

      return new Promise((resolve, reject) => {
        api
          .get(`/post/${postid}/like`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((res) => {
            commit("SET_LOADING_STATUS", false);
            resolve(res.data.liked);
          })
          .catch((error) => {
            commit("SET_LOADING_STATUS", false);

            setTimeout(() => {
              handleError(error);
            }, 900);

            reject(null);
          });
      });
    },

    /* posts */

    async createPost({ commit }, { title, file, content, tags }) {
      commit("SET_LOADING_STATUS", true);
      const formData = new FormData();
      formData.append("file", file);

      api
        .post(
          "/posts",
          { title, content, tags },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          const post = response.data;
          api
            .put("/post/" + post.id + "/file", formData, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "multipart/form-data",
              },
            })
            .then((res) => {
              Vue.swal(i18n.t("success"), res.data.message, "success");
              router.push("/profile");
            })
            .catch((error) => {
              setTimeout(() => {
                handleError(error);
              }, 900);
            });
        })
        .catch((error) => {
          setTimeout(() => {
            handleError(error);
          }, 900);
        })
        .finally(() => {
          commit("SET_LOADING_STATUS", false);
        });
    },

    deletePost({ commit }, postid) {
      // delete /post/:id
      commit("SET_LOADING_STATUS", true);
      api
        .delete("/post/" + postid, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          commit("SET_LOADING_STATUS", false);
          Vue.swal
            .fire(i18n.t("success"), response.data.message, "success")
            .then((result) => {
              if (result.isConfirmed) {
                router.go();
              }
            });
        })
        .catch((error) => {
          commit("SET_LOADING_STATUS", false);
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    async getPostsFeed({ commit }) {
      commit("SET_LOADING_STATUS", true);

      return new Promise((resolve, reject) => {
        api.get("/posts").then((res) => {
          commit("SET_LOADING_STATUS", false);
          resolve(res.data);
        });
      }).catch((error) => {
        commit("SET_LOADING_STATUS", false);

        setTimeout(() => {
          handleError(error);
        }, 900);

        reject(null);
      });
    },

    getPostFile({ commit }, fileId) {
      return `${api.defaults.baseURL}/file/${fileId}`;
    },

    /* follow */

    followUser({ commit }, userid) {
      // post /follow/:id

      api
        .post(`/follow/${userid}`, undefined, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .catch((error) => {
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    unfollowUser({ commit }, userid) {
      // delete /unfollow/:id

      api
        .delete(`/unfollow/${userid}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .catch((error) => {
          setTimeout(() => {
            handleError(error);
          }, 900);
        });
    },

    /**
     * Check if I (the user) follow a specific user
     * @param {number} userid The user identifier
     * @returns {boolean} true if I follow the user, false otherwise
     */
    doIFollowTheUser({ commit }, userId) {
      commit("SET_LOADING_STATUS", true);

      return new Promise((resolve, reject) => {
        api
          .get(`/user/${userId}/isFollowing`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((res) => {
            resolve(res.data.following);
          })
          .catch((error) => {
            setTimeout(() => {
              handleError(error);
            }, 900);

            reject(null);
          })
          .finally(() => commit("SET_LOADING_STATUS", false));
      });
    },

    /* tags */

    async getPostsFromTag({ commit }, tags) {
      commit("SET_LOADING_STATUS", true);

      return new Promise((resolve, reject) => {
        api
          .get("/posts", {
            params: {
              tags: tags.join(","),
            },
          })
          .then((res) => {
            commit("SET_LOADING_STATUS", false);
            resolve(res.data.posts);
          })
          .catch((error) => {
            commit("SET_LOADING_STATUS", false);
            setTimeout(() => {
              handleError(error);
            }, 900);

            reject(null);
          });
      });
    },
  },

  mutations: {
    SET_LOADING_STATUS(state, status) {
      state.loadingStatus = status;
    },

    SET_USER(state, user) {
      state.user = user;
    },

    SET_DARK_THEME(state, theme) {
      state.darkTheme = theme; // 1 = darkmode, 0 = lightmode
      localStorage.setItem("theme", theme);
    },

    LOGOUT(state) {
      state.user = null;
    },

    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },

    REMOVE_TOKEN(state) {
      state.token = null;
      localStorage.removeItem("token");
    },
  },

  getters: {
    loadingStatus: (state) => {
      return state.loadingStatus;
    },

    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },

    isLogged: (state) => {
      return !!state.token && state.user;
    },
  },
});

export default store;
