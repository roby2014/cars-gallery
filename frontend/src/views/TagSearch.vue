<template>
  <div :class="[ $vuetify.breakpoint.width < 615 ? 'DivMobile': 'DivDesktop']">
    <div>
      <Loading
        :active.sync="loadingStatus"
        :color="isDarkTheme ? '#3e3fa6' : '#ffffff'"
        :background-color="this.$vuetify.theme.dark ? '#292939' : '#3e3fa6'"
        :opacity="1"
        blur
        :can-cancel="false"
        :is-full-page="true"
      />
    </div>
    <div>
      <!-- CONTAINER WITH PICTURES -->
      <v-container fill-height>
        <v-toolbar color="indigo" dark>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>

          <v-toolbar-title>
            {{ $t("posts_tagged") }} {{ tags.join(", ") }}
          </v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn @click="dialogTags = true" icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-toolbar>

        <v-row>
          <v-toolbar-title class="white--text mr-5"> </v-toolbar-title>

          <!-- DIALOG FOR SEARCH MORE TAGS -->
          <v-dialog v-model="dialogTags" :width="widthFnComments">
            <v-card :loading="loadingStatus" height="auto">
              <v-toolbar color="primary lighten-1">
                <v-toolbar-title class="white--text"
                  >{{ this.$t("search") }} tags
                </v-toolbar-title>
              </v-toolbar>

              <v-card-actions class="pt-6">
                <v-selectize
                  multiple
                  placeholder="Tags"
                  label="Tags"
                  v-model="tags"
                  :options="tags.length ? tags : []"
                />
              </v-card-actions>

              <div class="pa-4">
                <v-btn @click="searchForTags" color="success">
                  {{ $t("search") }}
                </v-btn>
              </div>
            </v-card>
          </v-dialog>
        </v-row>

        <!-- POSTS WITH TAG -->
        <v-container class="pa-4 mt-8" v-if="posts.length > 0">
          <v-row wrap>
            <template v-for="(post, index) in posts">
              <v-col :key="'post' + index">
                <PostViewer :post="post" />
              </v-col>
            </template>
          </v-row>
        </v-container>
      </v-container>
    </div>
  </div>
</template>

<script>
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

import "selectize/dist/css/selectize.default.css";
import VSelectize from "@isneezy/vue-selectize";

import PostViewer from "../components/PostViewer";

export default {
  name: "TagSearch",
  components: {
    Loading,
    PostViewer,
    VSelectize,
  },

  data() {
    return {
      tags: [],
      posts: [],
      dialogTags: false,
    };
  },

  async mounted() {
    this.tags = this.$route.params.tags.split(",");
    this.posts = await this.$store.dispatch("getPostsFromTag", this.tags);
    if (!this.posts.length) {
      this.$swal(this.$t("error"), this.$t("no_results"), "error");
      this.$router.push("/home");
    }
  },

  async beforeRouteUpdate(to, from, next) {
    this.dialogTags = false
    this.tags = to.params.tags.split(",");
    this.posts = await this.$store.dispatch("getPostsFromTag", this.tags);

    if (!this.posts.length) {
      this.$swal(this.$t("error"), this.$t("no_results"), "error");
      return this.$router.push("/home");
    }

    next()
  },

  methods: {
    searchForTags() {
      this.$router.push(`/tagsearch/${this.tags.join(",")}`); // TODO ele n sai do dialog?
    },
  },

  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },
    widthFnComments() {
      switch (this.$vuetify.breakpoint.name) {
        case "xs":
          return "100vw";
        case "sm":
          return "55vw";
        case "md":
          return "45vw";
        case "lg":
          return "35vw";
        case "xl":
          return "20vw";
      }
    },
  },
};
</script>

<style>
.DivMobile {
  height: 100%
}

.DivDesktop {
  height: 100vh;
}
</style>
