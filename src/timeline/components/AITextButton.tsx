import { useState } from "react";
import { invoke } from "./firebaseFunctions.ts";

interface AITextButtonProps {
  originalText: string;
  onRewrite: (rewrittenText: string) => void;
}

const AITextButton = ({ originalText, onRewrite }: AITextButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    setLoading(true);
    try {
      const data = await invoke("retext", { text: originalText });
      onRewrite(data.rewritten);
    } catch (error) {
      console.error("Error rewriting text:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleRewrite} disabled={loading}>
        {loading ? "משכתב..." : "שכתב לי"}
      </button>
    </div>
  );
};
export default AITextButton;
