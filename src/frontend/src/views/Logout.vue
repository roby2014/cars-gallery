<template></template>

<script>
export default {
  mounted() {
    this.$swal
      .fire({
        title: this.$t("logout_question"),
        icon: "question",
        confirmButtonText: this.$t("yes"),
        cancelButtonText: this.$t("no"),
        showCancelButton: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.$store.dispatch("logout");
        }
      });
  },
};
</script>