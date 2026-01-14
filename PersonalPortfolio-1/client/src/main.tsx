import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add additional tailwind styles for fonts
const style = document.createElement('style');
style.innerHTML = `
  @layer base {
    body {
      font-family: 'Inter', sans-serif;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Poppins', sans-serif;
    }
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
