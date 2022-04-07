<template>
  <div style="height: 100%">
    <div v-if="!user || !posts">
      <Loading
        :active.sync="loadingStatus"
        :color="isDarkTheme ? '#3e3fa6' : '#ffffff'"
        :background-color="isDarkTheme ? '#292939' : '#3e3fa6'"
        :opacity="1"
        blur
        :can-cancel="false"
        :is-full-page="true"
      />
    </div>

    <div v-else>
      <!-- DESKTOP PROFILE HEADER; -->
      <v-container
        v-if="$vuetify.breakpoint.width >= 600"
        style="border-radius: 1%"
        class="elevation-5 mx-auto pa-3 ma-5"
      >
        <v-row style="height: 200px">
          <v-col cols="3" md="3" sm="4">
            <div class="centerSmtDesktop">
              <v-img
                class="white--text"
                style="border-radius: 50%; width: 100%; height: 100%"
                max-width="175"
                max-height="175"
                :src="avatar"
                :lazy-src="avatar"
              />
            </div>
          </v-col>
          <v-col cols="9" md="9" sm="8">
            <v-container>
              <v-row>
                <v-card-title style="font-size: 23px">
                  {{ this.user.name }} (@{{ this.user.username }})
                </v-card-title>
              </v-row>
              <v-row>
                <v-card-subtitle style="font-size: 17px" class="mt-1">
                  {{ this.user.bio ? this.user.bio : "..." }}
                </v-card-subtitle>
              </v-row>
              <v-row class="pt-4" style="font-size: 19px">
                <v-col
                  >{{ this.$t("profile.posts") }}:
                  {{ this.user.posts.length }}
                </v-col>
                <v-col
                  >{{ this.$t("profile.followers") }}:
                  {{ this.user._count.followedBy }}
                </v-col>
                <v-col
                  >{{ this.$t("profile.following") }}:
                  {{ this.user._count.following }}</v-col
                >
              </v-row>
            </v-container>
          </v-col>
        </v-row>

        <v-row v-if="!mySelfProfile">
          <div class="centerSmtDesktop pt-5">
            <v-btn
              @click="handleFollowClick"
              :disabled="mySelfProfile"
              class="pa-2"
              color="buttons"
              text
            >
              {{ doIFollow ? this.$t("unfollow") : this.$t("follow") }}
            </v-btn>
          </div>
        </v-row>
        <v-row v-else>
           <div class="pa-2"> </div>
        </v-row>
      </v-container>

      <!-- MOBILE PROFILE HEADER; -->
      <v-container
        v-else
        style="border-radius: 1%"
        class="elevation-12 mx-auto pa-3 ma-5"
      >
        <v-row style="height: 450px">
          <v-col>
            <div class="centerSmtMobile">
              <v-img
                class="white--text"
                style="border-radius: 50%; width: 100%; height: 100%"
                max-width="175"
                max-height="175"
                :src="avatar"
                :lazy-src="avatar"
              />
            </div>

            <v-container>
              <v-row class="centerSmtMobile">
                <v-row class="mobileTitleName">
                  <v-card-title> {{ this.user.name }} </v-card-title>
                </v-row>
                <v-row class="mobileTitleUsername pt-3">
                  <v-card-title>
                    (@{{ this.user.username }}) <br
                  /></v-card-title>
                </v-row>
              </v-row>

              <v-row>
                <v-card-subtitle
                  style="font-size: 17px"
                  class="centerSmtMobile mt-1"
                >
                  {{ this.user.bio ? this.user.bio : " " }}
                </v-card-subtitle>
              </v-row>
              <v-row style="font-size: 19px">
                <v-col
                  >{{ this.$t("profile.posts") }} <br />
                  {{ this.user.posts.length }}</v-col
                >
                <v-col
                  >{{ this.$t("profile.followers") }} <br />
                  {{ this.user._count.followedBy }}</v-col
                >
                <v-col
                  >{{ this.$t("profile.following") }} <br />
                  {{ this.user._count.following }}</v-col
                >
              </v-row>
            </v-container>
          </v-col>
        </v-row>

        <v-row v-if="!mySelfProfile">
          <div class="centerSmtMobile">
            <v-btn
              @click="handleFollowClick"
              class="pa-1"
              color="buttons"
              width="98%"
            >
              {{ doIFollow ? this.$t("unfollow") : this.$t("follow") }}
            </v-btn>
          </div>
        </v-row>
        <v-row v-else>
           <div class="pa-1"> </div>
        </v-row>
      </v-container>

      <!-- POSTS -->
      <v-container class="pa-4 mb-15" style="height: 100%">
        <v-row wrap>
          <template v-for="(post, index) in posts">
            <v-col :key="'post' + index">
              <PostViewer :post="post" />
            </v-col>
          </template>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import PostViewer from "../components/PostViewer";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import api from "../plugins/api";

export default {
  name: "Profile",

  components: {
    PostViewer,
    Loading,
  },

  data() {
    return {
      user: null,
      posts: null,
      avatar: "",
      doIfollowTheUser: false,
    };
  },

  async mounted() {
    // if no arguments, redirect to self profile
    let userid = !!this.$route.params.id
      ? this.$route.params.id
      : this.$store.state.user.id;

    // if invalid id (letter)
    if (isNaN(userid)) {
      this.$swal
        .fire({
          title: this.$t("smt_went_wrong"),
          icon: "error",
          confirmButtonText: "Ok",
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.$router.push({ path: "/profile" });
          }
        });
      return;
    }

    // get user info and posts
    this.user = await this.$store.dispatch("getUser", userid);
    this.posts = await this.$store.dispatch("getUserPosts", userid);
    this.avatar = this.getUserAvatar(userid);

    if (!this.mySelfProfile) { 
      this.doIfollowTheUser = await this.$store.dispatch(
        "doIFollowTheUser",
        userid
      );
    }
  },

  async beforeRouteUpdate(to, from, next) {
    // if no arguments, redirect to self profile
    let userid = !!to.params.id
      ? to.params.id
      : this.$store.state.user.id;

    // if invalid id (letter)
    if (isNaN(userid)) {
      this.$swal
        .fire({
          title: this.$t("smt_went_wrong"),
          icon: "error",
          confirmButtonText: "Ok",
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.$router.push({ path: "/profile" });
          }
        });
      return next();
    }

    // get user info and posts
    this.user = await this.$store.dispatch("getUser", userid);
    this.posts = await this.$store.dispatch("getUserPosts", userid);
    this.avatar = this.getUserAvatar(userid);

    if (!this.mySelfProfile) {
      this.doIfollowTheUser = await this.$store.dispatch(
        "doIFollowTheUser",
        userid
      );
    }

    next()
  },

  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },
    mySelfProfile() {
      return !!this.$store.state.user && this.user.id === this.$store.state.user.id;
    },
    doIFollow() {
      return this.doIfollowTheUser;
    },
  },

  methods: {
    handleFollowClick() {
      if (this.doIfollowTheUser) { // unfollow
        this.$store.dispatch("unfollowUser", this.user.id);
        this.user._count.followedBy = this.user._count.followedBy - 1;
        this.$toast.info(this.$t("you_unfollowed") + this.user.username)
      } else { // follow
        this.$store.dispatch("followUser", this.user.id);
        this.user._count.followedBy = this.user._count.followedBy + 1;
        this.$toast.success(this.$t("you_followed") + this.user.username)
      }

      this.doIfollowTheUser = !this.doIfollowTheUser;
    },
    handleTagClick(e, tag) {
      // search for tag
      console.log(tag);
      console.log(this.user);
    },
    getUserAvatar(userId) {
      return `${api.defaults.baseURL}/user/${userId}/avatar`;
    },
  },
};
</script>


<style lang="scss">
.centerSmtDesktop {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.centerSmtMobile {
  height: 50%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.mobileTitleName {
  width: 100%;
  height: 0;
  display: flex;
  justify-content: center;
}

.mobileTitleUsername {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
}

.centerSmtMobile .v-btn:hover {
  transform: scale(1.03);
}

.v-ripple__container {
    display:none !important;
}
</style>
