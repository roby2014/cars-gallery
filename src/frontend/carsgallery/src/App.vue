<template>
  <v-app>
    <v-main>
      <NavBar />
      <v-container fluid>
        <router-view />
      </v-container>
      <Footer />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import Footer from "./components/Footer";

export default {
  name: "App",

  components: {
    NavBar,
    Footer
  },

  mounted() {
    this.$vuetify.theme.dark = this.$store.state.darkTheme;
  }
};
</script>
