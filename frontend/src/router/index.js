import Vue from "vue"
import Router from "vue-router"

import { reAuthenticate } from "../utils/functions"
import store from "../plugins/vuex"

import Home from "../views/Home.vue"
import NotFound from "../views/404.vue"
import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import Profile from "../views/Profile.vue"
import ProfileSettings from "../views/ProfileSettings.vue"
import UploadPost from "../views/UploadPost.vue"
import Logout from "../views/Logout.vue"
import TagSearch from "../views/TagSearch.vue"

Vue.use(Router)

const routes = [
  { path: "*", component: NotFound },
  { path: "/", component: Home },
  { path: "/home", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/logout", component: Logout },
  {
    path: "/profile/:id?",
    component: Profile,
  },
  { path: "/profilesettings", component: ProfileSettings },
  { path: "/uploadpost", component: UploadPost },
  { path: "/tagsearch/:tags", component: TagSearch},
]

const router = new Router({
  mode: "history",
  routes,
})

router.beforeEach(async (to, from, next) => {
  try {
    const _token = window.localStorage.getItem("token")
    
    if (to.path === "/login" || to.path === "/register") {
      if (_token !== null) {
        router.push("/home")
      }
    } else if (
      to.path == "/profilesettings" ||
      to.path == "/uploadpost" ||
      to.path == "/profile"
    ) {
      if (_token === null || !store.state.user) {
        router.push("/home")
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    next()
  }
})

export default router
