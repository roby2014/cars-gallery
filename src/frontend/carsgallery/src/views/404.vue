<template>
    <div id="main">
        <div class="fof">
            <img class="box" id="truckVid" src="https://cdn.dribbble.com/users/889322/screenshots/7776561/media/c79a7ef8cfae42e45647d25d42dc934d.gif">
            <h1> {{ $t('404.not_found') }} </h1>
        </div>

    </div>
</template>


<script>
export default {
  name: "NotFound",
  data() {
    return {

    }
  },
};
</script>


<style>

h1 {
  color: white;
}

#truckVid {
  width: 50%;
  height: 50%;
}

* { transition: all 0.6s; }
html { height: 100%; }

#main{
  display: table;
  width: 100%;
  height: 100%;
  text-align: center;
  background-image: linear-gradient(to top right, #4b22c9 30%, #4949db 60%);
  background-image: linear-gradient(to right , #4b22c9 50%, #4949db 90%);
}

.fof{
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fof h1{
  font-size: 50px;
  display: inline-block;
  padding-right: 12px;
  animation: type .5s alternate infinite;
}

@keyframes type{
  from{box-shadow: inset -3px 0px 0px #888;}
  to{box-shadow: inset -3px 0px 0px transparent;}
}

</style>
