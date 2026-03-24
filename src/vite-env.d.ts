/// <reference types="vite/client" />

// Declare module for importing files as raw strings
declare module '*?raw' {
  const content: string;
  export default content;
}
