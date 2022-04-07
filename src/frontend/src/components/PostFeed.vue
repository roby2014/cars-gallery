<template>
  <v-card
    dark
    color="primary"
    class="elevation-12 mb-16"
    :loading="loadingStatus"
  >

  <!-- img or video -->
    <template v-if="isVideo()">
      <video width="100%" controls>
        <source :src="getVideo" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </template>
    <template v-else>
      <img width="100%" :src="getImage" />
    </template>

    <v-card-title>
      <v-icon large left> mdi-car </v-icon>
      <span class="text-h6 mt-1">{{ post.title }}</span>
    </v-card-title>

    <v-card-actions>
      <v-list-item class="grow">
        <!-- AVATAR AND USERNAME -->
        <router-link :to="'/profile/'+post.authorId">
        <v-list-item-avatar color="grey darken-3">
          <v-img class="elevation-6" alt="" :src="authorAvatar"></v-img>
        </v-list-item-avatar>
        </router-link>

        <v-list-item-content>
          <v-list-item-title>
            @{{ post.author.username }}
          </v-list-item-title>
        </v-list-item-content>

        <!-- LIKES + COMMENTS + SHOWMORE BUTTON -->
        <v-row align="center" justify="end">
          <!-- LIKES -->
          <Like :postid="post.id" :likes.sync="post._count.likes" />

          <span class="mr-1">·</span>

          <!-- COMMENTS -->

          <v-btn @click="dialogComments = true" icon color="white">
            <v-icon>
              {{ comments && comments.length ? "mdi-comment" : "mdi-comment-outline" }}
            </v-icon>
          </v-btn>
          <span class="subheading mr-2">{{
            !!comments ? comments.length : "0"
          }}</span>

          <!-- SHOW MORE -->
          <v-btn icon @click="showMore = !showMore">
            <v-icon>{{
              showMore ? "mdi-chevron-up" : "mdi-chevron-down"
            }}</v-icon>
          </v-btn>
        </v-row>
      </v-list-item>
    </v-card-actions>

    <template v-if="comments">
      <Comments
        :dialogC.sync="dialogComments"
        :comments="comments"
        :postid="post.id"
      />
    </template>

    <!-- SHOW MORE (DESCRIPTION TAGS AND DATE) -->
    <v-expand-transition>
      <div v-show="showMore">
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col v-if="post.description">
              <div class="d-inline-flex pr-2" style="font-size: 15px">
                Description:
              </div>
              <span class="text-h6">{{ post.content }}</span>
            </v-col>
          </v-row>

          <v-row no-gutters class="pt-5">
            <v-col>
              <PostTags :tags="post.tags" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-row>
          <div class="caption grey--text pa-3 ml-5">
            {{ $t("new.posted_at") }} {{ formattedDate(post.createdAt) }}
          </div>
        </v-row>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import Comments from "./Comments.vue";
import Like from "./Like.vue";
import api from "../plugins/api.js";
import dateFormat from "dateformat";
import PostTags from "./PostTags";

export default {
  name: "PostFeed",
  components: {
    Comments,
    Like,
    PostTags,
  },
  props: {
    post: Object,
  },
  async mounted() {
    // GET ALL COMMENTS FROM POST
    this.authorAvatar = await this.$store.dispatch(
      "getUserAvatar",
      this.post.author.id
    );

    this.comments = await this.$store.dispatch("getComments", this.post.id);
  },
  data() {
    return {
      showMore: false,
      authorAvatar: "",
      dialogComments: false,
      comments: null,
    };
  },

  methods: {
    handleUserClick(e, userId) {
      console.dir(userId)
      console.log("user pressed on " + userId);
    },
    formattedDate(postdate) {
      var now = new Date(postdate);
      return dateFormat(now, "d mmmm yyyy");
    },
    isVideo() {
      return this.post.file.fileType === 'video/mp4'
    },
  },

  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },
    liked() {
      return this.like;
    },
    getVideo() {
      const { fileId } = this.post;
      return `${api.defaults.baseURL}/file/${fileId}`;
    },
    getImage() {
      const { fileId } = this.post;
      return `${api.defaults.baseURL}/file/${fileId}`;
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Montserrat:500");

.v-card {
  font-family: "Montserrat", sans-serif;
}
</style>
