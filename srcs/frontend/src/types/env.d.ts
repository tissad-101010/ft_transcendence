export {};

declare global {
  interface Window {
    __ENV__: {
      BACKEND_URL: string;
    };
  }
}
