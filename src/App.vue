<template>
  <div id="app">
    <header>
      <h1>AI Coding Sandbox</h1>
    </header>
    <main>
      <CodeEditor />
    </main>
  </div>
</template>

<script>
import CodeEditor from './components/CodeEditor.vue'

export default {
  name: 'App',
  components: {
    CodeEditor
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}

header {
  background: #42b883;
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  height: calc(100vh - 80px);
  padding: 1rem;
}
</style>
