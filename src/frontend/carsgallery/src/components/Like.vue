<template>
  <div style="display: inline">
    <v-btn icon color="white" @click="iLike">
      <v-icon> {{ like ? "mdi-heart" : "mdi-heart-outline" }} </v-icon>
    </v-btn>
    <span class="subheading mr-2 white--text"> {{ likes }} </span>
  </div>
</template>

<script>
export default {
  name: "Like",
  props: {
    postid: Number,
    likes: Number
  },
  data() {
    return {
      like: false
    };
  },
  async mounted() {
    this.like = await this.$store.dispatch("DoILikeThePost", this.postid)
  },
  methods: {
    iLike() {
      const amountOfLikes = this.likes;

      if (!this.like) {
        this.$emit("update:likes", amountOfLikes + 1);
        this.$store.dispatch("likePost", this.postid);
      } else {
        this.$emit("update:likes", amountOfLikes - 1);
        this.$store.dispatch("unlikePost", this.postid);
      }

      this.like = !this.like;
    }
  }
};
</script>

<style>
.v-btn:hover {
  transform: scale(1.1);
}
</style>
