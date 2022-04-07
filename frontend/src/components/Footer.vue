<template>
  <v-footer padless>
    <v-card
      rounded
      color="#2c57c0"
      class="lighten-1 white--text text-center"
      style="width: 100%"
    >
      <v-card-text>
        <v-btn icon class="mx-4 white--text" @click="redirectGithub()">
          <v-icon size="24px"> mdi-github</v-icon>
        </v-btn>
      </v-card-text>

      <v-card-text class="white--text pt-0">
        PAP - Projeto de Aptidão Profissional
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class="white--text">
        <strong>Copyright</strong> ©
        <strong>{{ new Date().getFullYear() }} by Roberto Petrisoru</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  name: "Footer.vue",
  data() {
    return {};
  },
  methods: {
    redirectGithub() {
      window.location.replace("https://github.com/awyxx/pap_carsgallery");
    }
  }
};
</script>
