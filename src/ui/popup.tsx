import { createRoot } from "react-dom/client";
import "../../public/globals.css";

const Popup = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Taoxyz Wallet</h1>
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<Popup />);
}
