// Node tests use the public Node entry, which loads the package's local WASM.
// Vite aliases this module to tokenizer-runtime.browser.js for the application.
export async function getTiktoken(){
  return (await import("tiktoken/lite")).Tiktoken;
}
