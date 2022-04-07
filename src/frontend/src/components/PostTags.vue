<template>
  <div>
    <span> Tags: </span>
    <v-btn
      v-for="tag in tags"
      :key="tag.id"
      :value="tag"
      @click="handleTagClick($event, tag.name)"
      style="font-size: 13px"
      class="ma-1 pa-3"
    >
      {{ tag.name }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "PostTags",
  props: {
    tags: Array,
  },
  methods: {
    handleTagClick(e, tagName) {
      this.$swal
        .fire({
          title: this.$t("search_tag") + tagName + " ?",
          icon: "question",
          confirmButtonText: this.$t("yes"),
          cancelButtonText: this.$t("no"),
          showCancelButton: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            // redirect to /tagsearch/${tagName}
            this.$router.push(`/tagsearch/${tagName}`)
          }
        });
    },
  },
  mounted() {},
};
</script>

<style>
</style>