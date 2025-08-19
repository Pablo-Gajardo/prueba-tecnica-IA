<script setup>
import ChatCopiloto from './components/ChatCopiloto.vue';
</script>

<template>
  <div class="app-container">
    <ChatCopiloto/>
  </div>
</template>

<style scoped>

.app-container {
  display: flex;
  justify-content: center;  
  align-items: center;      
  width: 100vw;             
  height: 100vh;   
   margin: 0;         
  overflow: hidden;            
}
</style>
