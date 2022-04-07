<template>
  <!--- COMMENTS DIALOG -->
  <v-dialog
    v-model="dialogC"
    width="auto "
    @click:outside="$emit('update:dialogC', false)"
  >
    <v-card :loading="loadingStatus" :width="widthFnComments" height="auto">
      <v-toolbar color="primary lighten-1">
        <v-toolbar-title class="commentsTitle">{{
          this.$t("comments")
        }}</v-toolbar-title>
      </v-toolbar>

      <v-list two-line>
        <template v-for="(c, index) in comments">
          <v-list-item :key="index">
            <router-link :to="`/profile/${c.author.id}`"> 
            <v-list-item-avatar>
              <img :src="getUserAvatar(c.author.id)" />
            </v-list-item-avatar>
            </router-link>
            <v-list-item-content>
              <v-list-item-title>
                {{ c.author.username }}
              </v-list-item-title>
              <div
                :class="[
                  $vuetify.breakpoint.width < 600
                    ? 'commentDivMobile'
                    : 'commentDivDesktop',
                  isDarkTheme ? 'commentsDarkmode' : 'commentsLightmode',
                ]"
              >
                {{ c.content }}
              </div>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-list-item>
          <v-text-field
            outlined
            dense
            v-model="comment"
            :label="$t('write_comment')"
            class="mt-3"
            color="revert"
            append-icon="mdi-send"
            v-on:keyup.enter="onSendComment"
            :rules="[rules.maxsizeComment]"
            @click:append="onSendComment"
          >
          </v-text-field>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "../plugins/api";
import Loading from "vue-loading-overlay"
import "vue-loading-overlay/dist/vue-loading.css"

export default {
  name: "Comments",
  components: {
    Loading
  },
  data() {
    return {
      comment: "",

      rules: {
        maxsizeComment: (value) => value.length <= 48 || "",
      },
    };
  },
  props: {
    comments: null,
    dialogC: Boolean,
    postid: Number,
    count: Number
  },
  methods: {
    onSendComment() {
      if (this.comment) {
        this.$store.dispatch("commentOnPost", {
          post: this.postid,
          comment: this.comment,
        });

        this.comments.push({
          author: {
            id: this.$store.state.user.id,
            username: this.$store.state.user.username,
          },
          content: this.comment,
        });

        this.comment = "";

        document.activeElement.blur();

        if (this.count) {
          const { count } = this

          this.$emit('update:count', count + 1)
        }

        this.$toast.success(this.$t("comment_added"))
      }
    },
    getUserAvatar(userId) {
      return `${api.defaults.baseURL}/user/${userId}/avatar`;
    },
  },

  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
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
    sizeAvatarFn() {
      if (this.$vuetify.breakpoint.name === "xs") {
        return "70";
      } else {
        return "90";
      }
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
.commentDivMobile {
  font-size: 0.8rem;
}

.commentDivDesktop {
  font-size: 1rem;
}

.commentsTitle {
  color: white;
}

.commentsLightmode {
  color: #616161;
}

.commentsDarkmode {
  color: #bdbdbd;
}
</style>
