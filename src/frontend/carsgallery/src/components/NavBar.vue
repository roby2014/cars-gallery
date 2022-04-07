<template>
  <div class="header">
    <!-- FOR DESKTOP RESOLUTION -->
    <v-toolbar rounded v-if="$vuetify.breakpoint.width >= 615">
      <!-- HOME -->
      <div class="logo">
        <router-link to="/home">
          <button>
            <v-img
              width="250px"
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
          </button>
        </router-link>
      </div>

      <v-spacer></v-spacer>

      <!-- SEARCH TEXT BOX -->
      <div class="hidden-sm-and-down search-bar" v-if="isAuthenticated">
        <SearchUsers />
      </div>

      <v-spacer></v-spacer>

      <!-- USER STUFF (RIGHT) IF AUTHENTICATED -->
      <template v-if="isAuthenticated">
        <div class="d-flex align-center">
          <!-- NEW PICTURE BUTTON -->
          <div class="newPicButton">
            <v-btn
              depressed
              color="#2c57c0"
              to="/uploadpost"
              class="text-none white--text mr-5"
            >
              <span>
                <v-icon>mdi-plus</v-icon>
                {{ $t("navbar.new_picture") }}
              </span>
            </v-btn>
          </div>

          <!-- PROFILE DROPDOWN -->
          <v-menu
            open-on-hover
            offset-y
            rounded="lg"
            transition="slide-y-transition"
          >
            <template v-slot:activator="{ on, attrs }">
              <div class="profileDropdownDesktop ml-5">
                <v-btn icon min-width="31" v-bind="attrs" v-on="on">
                  <v-avatar size="30"
                    ><v-img
                      :src="getUserAvatar()"
                      :lazy-src="getUserAvatar()"
                      alt="user profile picture"
                    ></v-img
                  ></v-avatar>
                  <v-icon> mdi-menu-down</v-icon>
                </v-btn>
              </div>
            </template>

            <!-- TABS -->
            <v-list flat>
              <template v-for="(tab, index) in menuDropdownDesktop">
                <v-list-item
                  class="desktopTabs"
                  :to="tab.path"
                  :key="'desktoptab' + index"
                  @click="handleTab($event, tab.path)"
                >
                  <v-list-item-action>
                    <v-icon> {{ tab.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title> {{ tab.name }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
          <v-spacer></v-spacer>
        </div>
      </template>
      <template v-else-if="!isAuthenticated">
        <!-- LOGIN BUTTON (RIGHT) IF NOT AUTHENTICATED -->
        <router-link to="/login">
          <v-btn depressed class="mr-5 white--text" color="#2c57c0"
            >Login
          </v-btn>
        </router-link>
      </template>
    </v-toolbar>

    <!-- FOR MOBILE RESOLUTION -->
    <v-toolbar rounded v-else>
      <!-- HOME -->
      <div class="logo">
        <router-link to="/home">
          <button>
            <v-img
              width="220px"
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
          </button>
        </router-link>
      </div>

      <v-spacer></v-spacer>

      <template v-if="isAuthenticated">
        <!-- MENU OPTIONS -->
        <v-menu offset-y rounded="b-xl">
          <template v-slot:activator="{ on, attrs }">
            <v-btn dark color="primary" v-bind="attrs" v-on="on">
              <v-icon>mdi-menu</v-icon>
            </v-btn>
          </template>

          <!-- PROFILE -->
          <v-card>
            <v-list flat>
              <v-list-item to="/profile">
                <v-list-item-avatar>
                  <v-img :src="getUserAvatar()"> </v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    @{{ $store.state.user.username }}</v-list-item-title
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <!-- TABS -->
            <v-list flat>
              <template v-for="(tab, index) in menuDropdownMobile">
                <v-list-item
                  @click="handleTab($event, tab.path)"
                  class="mobileTabs"
                  :to="tab.path"
                  :key="'mobiletab' + index"
                >
                  <v-list-item-action>
                    <v-icon> {{ tab.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-title> {{ tab.name }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>

            <v-divider></v-divider>

            <!-- SEARCH FIELD + BUTTON -->
            <v-list flat>
              <template style="width: 10%">
                <SearchUsers />
              </template>
            </v-list>
          </v-card>
        </v-menu>
      </template>
      <template v-else>
        <!-- LOGIN BUTTON (RIGHT) IF NOT AUTHENTICATED -->
        <router-link to="/login">
          <v-btn depressed class="text-none mr-5 white--text" color="#2c57c0"
            >Login
          </v-btn>
        </router-link>
      </template>
    </v-toolbar>
  </div>
</template>


<script>
import SearchUsers from "./SearchUsers.vue";
import api from "../plugins/api";

export default {
  name: "NavBar",
  components: { SearchUsers },
  data() {
    return {
      searchInput: "",

      menuDropdownDesktop: [
        {
          name: this.$t("navbar.profile"),
          path: this.$store.state.user
            ? `/profile/${this.$store.state.user.id}`
            : "/profile", // if its null, site will bug
          icon: "mdi-account-box",
        },
        {
          name: this.$t("navbar.settings"),
          path: "/profilesettings",
          icon: "mdi-account-cog",
        },
        { name: "Log Out", path: "/logout", icon: "mdi-logout" },
      ],

      menuDropdownMobile: [
        {
          name: this.$t("navbar.new_picture"),
          path: "/uploadpost",
          icon: "mdi-plus",
        },
        {
          name: this.$t("navbar.settings"),
          path: "/profilesettings",
          icon: "mdi-cog",
        },
        { name: "Log Out", path: "/logout", icon: "mdi-logout" },
      ],

      rules: {
        maxsize: (value) => (value && value.length <= 48) || "",
      },
    };
  },

  methods: {
    handleSearchTextInput(e) {
      this.searchInput = e;
    },
    handleTab(e, tab) {
      if (
        tab === "/profile" ||
        tab === `/profile/${this.$store.state.user.id}`
      ) {
        this.$router.push(tab);
        return;
      }
    },
    onSearchEnter() {
      // redirect to /search and show results from api!
      this.$router.push({
        path: "/search",
        query: { text: this.searchInput },
      });
    },
    getUserAvatar() {
      let userId = this.$store.state.user.id;
      return `${api.defaults.baseURL}/user/${userId}/avatar`;
    },
  },

  computed: {
    isAuthenticated() {
      return this.$store.getters.isLogged;
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark;
    },
  },
};
</script>


<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Montserrat:500");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Montserrat", sans-serif;
}

.desktopTabs:hover {
  transform: scale(1.06);
  background-color: #eeeeee;
}

.mobileTabs:hover {
  transform: scale(1.01);
  background-color: #eeeeee;
}

.mobileSearch:hover {
  transform: scale(1.01);
  background-color: transparent;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 3%;
}

.logo img {
  cursor: pointer;
  width: 200px;
}

.logo button {
  padding-top: 7px;
}

.logo button:hover {
  transform: scale(1.1);
  background-color: transparent;
}

.search-bar {
  list-style: none;
  display: inline-block;
  text-decoration: none;
  border-radius: 7px;
  height: 40px;
  width: 34%;
  margin-left: 42px;
}

.v-btn {
  padding: 16px 35px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease 0s;
  font-family: "Montserrat", sans-serif;
}

.newPicButton .v-btn:hover {
  text-decoration: none;
  transform: scale(1.07);
}

.userButtons .v-btn:hover {
  background-color: #eeeeee;
  transform: scale(1.1);
}

.profileDropdownDesktop .v-btn:hover {
  transform: scale(1.08);
}

.v-btn:before {
  opacity: 0 !important;
  background-color: transparent;
}
</style>
