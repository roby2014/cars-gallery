<template>
  <div>
    <!-- POST CARD -->
    <div>
      <!-- IMAGE CARD -->
      <v-card
        :loading="loadingStatus"
        class="mx-auto elevation-12"
        max-width="344"
      >
        <!-- IMAGE WITH HOVER EFFECT -->
        <v-hover v-slot="{ hover }">
          <div>
            <template v-if="isVideo()">
              <video width="100%" @click="handlePostClick($event, post)">
                <source :src="getVideo" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </template>
            <template v-else>
              <v-img
                height="235px"
                :src="getImage"
                @click="handlePostClick($event, post)"
                :class="{ 'on-hover': hover }"
              />
              <a
                v-if="hover"
                class="hover-text"
                @click="
                  handlePostClick($event, { id: post.id, image: getImage })
                "
                style="color: white"
              >
                {{ click2see(dialog) }}
              </a>
            </template>
          </div>
        </v-hover>
        <v-card-title> {{ post.title }}</v-card-title>
        <v-card-subtitle class="pt-1"> {{ post.content }}</v-card-subtitle>

        <!-- MORE BUTTON + ICON -->
        <v-card-actions>
          <v-btn color="buttons" text> {{ this.$t("more") }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click="showMore = !showMore">
            <v-icon>{{
              showMore ? "mdi-chevron-up" : "mdi-chevron-down"
            }}</v-icon>
          </v-btn>
        </v-card-actions>

        <!-- TAGS AND DATE -->
        <v-expand-transition>
          <div v-show="showMore">
            <v-divider></v-divider>
            <v-card-text>
              <PostTags :tags="post.tags" />
            </v-card-text>
            <div class="caption grey--text pa-2">
              {{ $t("new.posted_at") }} {{ formattedDate(post.createdAt) }}
            </div>
          </div>
        </v-expand-transition>
      </v-card>
    </div>

    <!-- DIALOG ON IMAGE/VID CLICK -->
    <div>
      <v-dialog v-model="dialog" width="auto ">
        <v-card :width="widthFn" height="auto">
          <template v-if="isVideo()">
            <video width="100%" height="auto" controls>
              <source :src="getVideo" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </template>
          <template v-else>
            <v-img
              width="auto"
              height="auto"
              alt="test"
              :src="dialogImg"
              :lazy-src="dialogImg"
            ></v-img>
          </template>
        </v-card>

        <!-- USER CARD -->
        <v-card width="100%" height="auto">
          <v-list-item>
            <v-list-item-avatar>
              <router-link :to="'/profile/'+post.author.id">
              <v-img :src="getUserAvatar(post.author.id)"></v-img>
              </router-link>
            </v-list-item-avatar>

            <v-list-item-content class="pb-2 mb-4">
              <div class="text-overline">{{ post.author.username }}</div>
              <v-list-item-title class="text-h5">{{
                post.title
              }}</v-list-item-title>
              <v-list-item-subtitle>{{ post.content }}</v-list-item-subtitle>
              <!-- TODO: if long description, it should break line! -->
            </v-list-item-content>
          </v-list-item>
        </v-card>

        <!-- LIKE OR COMMENT -->
        <v-card>
          <v-toolbar color="primary lighten-1">
            <Like :postid="post.id" :likes.sync="post._count.likes" />

            <v-btn @click="dialogComments = true" icon color="white">
              <v-icon>
                {{
                  hasComments
                    ? "mdi-comment"
                    : "mdi-comment-outline"
                }}
              </v-icon>
            </v-btn>
            <span class="subheading mr-2 white--text">
              {{ post._count.comments }}
            </span>
            <v-spacer></v-spacer>

            <template v-if="mySelf(post.author.id)">
              <v-btn @click="handleDeletePost" icon color="white">
                <v-icon> mdi-delete </v-icon>
              </v-btn>
            </template>
          </v-toolbar>

          <!--- COMMENTS DIALOG -->
          <Comments
            :dialogC.sync="dialogComments"
            :comments="comments"
            :postid="post.id"
            :count.sync="post._count.comments"
          />
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import api from "../plugins/api";
import Comments from "./Comments.vue";
import Like from "./Like.vue";
import dateFormat from "dateformat";
import PostTags from "./PostTags.vue";

export default {
  name: "PostViewer",
  components: { Comments, Like, PostTags },

  props: {
    post: Object,
  },

  data() {
    return {
      dialog: false,
      dialogImg: "",

      dialogComments: false,
      comments: [],

      showMore: false,
    };
  },

  methods: {
    async handlePostClick(e, { id: postid, image: postimg }) {
      try {
        this.$store.commit("SET_LOADING_STATUS", true);
        const { data } = await api.get(`/post/${postid}/comments`);
        this.comments = data;
        this.$store.commit("SET_LOADING_STATUS", false);
      } catch (error) {
        console.error(error);
      } finally {
        this.dialog = true;
        this.dialogImg = postimg;
        if (postid === null) {
          this.dialog = false;
          this.dialogImg = "";
        }
      }

      this.$store.commit("SET_LOADING_STATUS", false);
    },
    getUserAvatar(userId) {
      return `${api.defaults.baseURL}/user/${userId}/avatar`;
    },
    formattedDate(postdate) {
      var now = new Date(postdate);
      return dateFormat(now, "d mmmm yyyy");
    },
    click2see(dialog) {
      return dialog ? " " : this.$t("click_to_see_comments");
    },
    mySelf(authorid) {
      return !!this.$store.state.user && authorid === this.$store.state.user.id;
    },
    handleDeletePost() {
      this.$swal
        .fire({
          title: this.$t("delete_post"),
          icon: "question",
          confirmButtonText: this.$t("yes"),
          cancelButtonText: this.$t("no"),
          showCancelButton: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.$store.dispatch("deletePost", this.post.id);
          }
        });
    },
    isVideo() {
      return this.post.file.fileType === 'video/mp4'
    },
  },

  computed: {
    getImage() {
      const { fileId } = this.post;
      return `${api.defaults.baseURL}/file/${fileId}`;
    },
    getVideo() {
      const { fileId } = this.post;
      return `${api.defaults.baseURL}/file/${fileId}`;
    },
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },
    hasComments() {
      return this.post._count.comments
    },
    widthFn() {
      switch (this.$vuetify.breakpoint.name) {
        case "xs":
          return "100vw";
        case "sm":
          return "85vw";
        case "md":
          return "65vw";
        case "lg":
          return "55vw";
        case "xl":
          return "40vw";
      }
    },
  },
};
</script>

<style>
.on-hover {
  transition: 0.5s ease;
  -webkit-filter: blur(5px);
  -moz-filter: blur(5px);
  -o-filter: blur(5px);
  -ms-filter: blur(5px);
  filter: blur(5px);
  transform: scale(1.001);
  position: relative;
}

.hover-text {
  z-index: 1000;
  font-size: 20px;
  position: absolute;
  color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -150%);
  text-align: center;
  transition: 0.5s ease;
}

.hover-text:hover {
  font-size: 21px;
}
</style>
