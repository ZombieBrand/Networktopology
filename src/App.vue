<template>
  <div id="app">
    <TopologyContainer />
  </div>
</template>

<script>
import TopologyContainer from './components/TopologyContainer.vue'

export default {
  name: 'App',
  components: {
    TopologyContainer
  }
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}
* {
  margin: 0;
}
html, body {
  height: 100%;
}
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}
input, button, textarea, select {
  font: inherit;
}
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
a {
  text-decoration:none
}
ul,ol{
  list-style:none
}
</style>
