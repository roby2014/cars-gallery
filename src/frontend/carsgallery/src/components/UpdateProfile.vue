<template>
    <v-dialog v-model="dialog">
        boas
    </v-dialog>
  
</template>

<script>
export default {
    name: 'UpdateProfile',

    props: {
        dialog: Boolean,
        field: String,
    }
}
</script>

<style>

</style>