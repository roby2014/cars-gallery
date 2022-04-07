<template>
  <div style="height: 100%">
    <Loading
      :active.sync="loadingStatus"
      :color="isDarkTheme ? '#3e3fa6' : '#ffffff'"
      :background-color="this.$vuetify.theme.dark ? '#292939' : '#3e3fa6'"
      :opacity="1"
      blur
      :can-cancel="false"
      :is-full-page="true"
    />

    <div v-if="isAuthenticated && posts.length > 0">
      <v-container fill-height>
        <v-row justify="center" align="center">
          <v-col cols="12" md="5" sm="8" v-if="posts.length > 0">
            <template v-for="(post, index) in posts">
              <PostFeed :key="index" :post="post" />
            </template>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <div v-else>
      <!-- DESKTOP HOME FOR NON AUTHENTICATED -->
      <v-main style="height: 150vh" v-if="$vuetify.breakpoint.width >= 615">
        <v-row class="mt-4">
          <!-- title with image logo -->
          <v-col>
            <v-img
              width="400px"
              class="mx-auto"
              alt="home button with logo image"
              :lazy-src="
                isDarkTheme
                  ? require('@/assets/logo2-banner-dark.png')
                  : require('@/assets/logo2-banner.png')
              "
              :src="
                isDarkTheme
                  ? require('@/assets/logo2-banner-dark.png')
                  : require('@/assets/logo2-banner.png')
              "
            />
          </v-col>
        </v-row>
        <v-row class="mt-12">
          <v-col cols="5" class="pa-15 mt-5">
            <v-card class="mx-auto" max-width="344">
              <v-card-text>
                <p class="text-h4 text--primary">{{ $t('what_is') }}</p>
                <p>{{ $t('rsocial') }}</p>
                <div class="text--primary">
                  {{ $t('desc') }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="teal accent-4" @click="reveal = true">
                  {{ $t('learn_more') }}
                </v-btn>
              </v-card-actions>

              <v-expand-transition>
                <v-card
                  v-if="reveal"
                  class="transition-fast-in-fast-out v-card--reveal"
                  style="height: 100%"
                >
                  <v-card-text class="pb-0">
                    <p class="text-h4 text--primary">Info</p>
                    <p></p>
                  </v-card-text>
                  <div class="pl-8 pt-4 pb-4">
                    <v-row class="pb-5"> <v-btn to="/login" depressed color="primary" > Login </v-btn> </v-row>
                    <v-row class="pb-5"> <v-btn to="/register" depressed color="primary" > {{ $t('register.register') }} </v-btn> </v-row>
                    <v-row class="pb-5"> <v-btn href="https://github.com/awyxx/pap_carsgallery"  depressed color="primary"> {{ $t('scode') }}</v-btn> </v-row>
                  </div>
                  <v-card-actions class="pt-0">
                    <v-btn text color="teal accent-4" @click="reveal = false">
                      Close
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-expand-transition>
            </v-card>
          </v-col>
          <v-col v-if="posts.length > 0" class="pt-5">
            <v-card elevation="24" max-width="40vw" class="mx-auto">
              <v-carousel
                :continuous="false"
                hide-delimiters
                cycle
                hide-delimiter-background
                delimiter-icon="mdi-minus"
                height="550px"
              >
                <v-carousel-item v-for="(post, index) in posts" :key="index">
                  <v-img height="100%" :src="getImage($event, post)" />
                </v-carousel-item>
              </v-carousel>
            </v-card>
          </v-col>
        </v-row>
      </v-main>
      <!-- mobile -->
      <v-main style="height: 155vh" v-else>
        <v-row class="mt-4">
          <!-- title with image logo -->
          <v-col>
            <v-img
              width="400px"
              class="mx-auto"
              alt="home button with logo image"
              :lazy-src="
                isDarkTheme
                  ? require('@/assets/logo2-banner-dark.png')
                  : require('@/assets/logo2-banner.png')
              "
              :src="
                isDarkTheme
                  ? require('@/assets/logo2-banner-dark.png')
                  : require('@/assets/logo2-banner.png')
              "
            />
          </v-col>
        </v-row>
        <v-row class="mt-12">
          <v-col class="pa-5">
            <v-card class="mx-auto" max-width="344">
              <v-card-text>
                <p class="text-h4 text--primary">{{ $t('what_is') }}</p>
                <p>{{ $t('rsocial') }}</p>
                <div class="text--primary">
                  {{ $t('desc') }}
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="teal accent-4" @click="reveal = true">
                  {{ $t('learn_more') }}
                </v-btn>
              </v-card-actions>

              <v-expand-transition>
                <v-card
                  v-if="reveal"
                  class="transition-fast-in-fast-out v-card--reveal"
                  style="height: 100%"
                >
                  <v-card-text class="pb-0">
                    <p class="text-h4 text--primary">Info</p>
                    <p></p>
                  </v-card-text>
                  <div class="pl-8 pt-4 pb-4">
                    <v-row class="pb-5"> <v-btn to="/login" depressed color="primary" > Login </v-btn> </v-row>
                    <v-row class="pb-5"> <v-btn to="/register" depressed color="primary" > {{ $t('register.register') }} </v-btn> </v-row>
                    <v-row class="pb-5"> <v-btn href="https://github.com/awyxx/pap_carsgallery"  depressed color="primary"> {{ $t('scode') }}</v-btn> </v-row>
                  </div>
                  <v-card-actions class="pt-0">
                    <v-btn text color="teal accent-4" @click="reveal = false">
                      Close
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-expand-transition>
            </v-card>
          </v-col>
          <v-col v-if="posts.length > 0" class="pt-5">
            <v-card elevation="24" max-width="95%" class="mx-auto">
              <v-carousel
                :continuous="false"
                hide-delimiters
                cycle
                hide-delimiter-background
                delimiter-icon="mdi-minus"
                height="550px"
              >
                <v-carousel-item v-for="(post, index) in posts" :key="index">
                  <v-img height="100%" :src="getImage($event, post)" />
                </v-carousel-item>
              </v-carousel>
            </v-card>
          </v-col>
        </v-row>
      </v-main>
    </div>
  </div>
</template>

<script>
import PostFeed from "../components/PostFeed.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";

import api from "../plugins/api";

export default {
  name: "Home",
  components: {
    PostFeed,
    Loading,
  },
  async mounted() {
    try {
      const data = await this.$store.dispatch("getPostsFeed");
      this.posts = data.posts;
    } catch (error) {
      console.error(error);
    }
  },
  data() {
    return {
      posts: [],

      reveal: false,
    };
  },
  methods: {
    getImage(e, p) {
      const { fileId } = p;
      return `${api.defaults.baseURL}/file/${fileId}`;
    },
  },
  computed: {
    loadingStatus() {
      return this.$store.getters.loadingStatus;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },
    isAuthenticated() {
      return this.$store.getters.isLogged;
    },
  },
};
</script>

<style>
.white-label label {
  color: rgba(255, 255, 255) !important;
}

.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}
</style>
