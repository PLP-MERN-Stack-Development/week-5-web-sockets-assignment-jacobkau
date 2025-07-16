import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };
  return (
    <form action="" onSubmit={handleSubmit} className="flex mb-4">
      <input
        className="flex-1 p-2 border rounded-l"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New Task ......"
      />

      <button type="submit" className="p-2 bg-blue-500 text-white rounded-r">
        Add
      </button>
    </form>
  );
}
