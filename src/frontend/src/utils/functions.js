import Vue from "vue"
import i18n from "../plugins/i18n"
import api from "../plugins/api"
import store from "../plugins/vuex"

function handleError(error) {
  console.dir(error)
  if (error.response) {
    // chamada feita e resposta
    Vue.swal(i18n.t("error"), error.response.data.message, "error")
    console.log(error.response.data.message)
  } else if (error.request) {
    // chamada feita mas sem resposta
    Vue.swal(error.message, i18n.t("api_no_response"), "error")
  } else {
    Vue.swal(i18n.t("error"), i18n.t("smt_went_wrong"), "error")
    console.log(error.message)
  }
}

export { handleError }
