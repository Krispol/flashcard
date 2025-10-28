"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Questionnaire } from "@/types/objects";

interface ManagerSectionProps {
  onSelect: (id: string) => void;
  onDeleted: (id: string) => void;
}

export default function Manager({ onSelect, onDeleted }: ManagerSectionProps) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseBrowser
        .from("questionnaire")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load questionnaires:", error);
      } else {
        setQuestionnaires(data);
      }
    })();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const { data, error } = await supabaseBrowser
      .from("questionnaire")
      .insert([{ title: newTitle.trim(), description: newDesc.trim() || null }])
      .select("*")
      .single();

    if (error) {
      console.error("Create error:", error);
      return;
    }

    setQuestionnaires((prev) => [data, ...prev]);
    setNewTitle("");
    setNewDesc("");
  }

  function startEdit(q: Questionnaire) {
    setEditId(q.id);
    setEditTitle(q.title);
    setEditDesc(q.description ?? "");
  }

  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
    setEditDesc("");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;

    const { data, error } = await supabaseBrowser
      .from("questionnaire")
      .update({
        title: editTitle.trim(),
        description: editDesc.trim() || null,
      })
      .eq("id", editId)
      .select("*")
      .single();

    if (error) {
      console.error("Update error:", error);
      return;
    }

    setQuestionnaires((prev) => prev.map((q) => (q.id === editId ? data : q)));
    cancelEdit();
  }

  async function handleDelete(id: string) {
    const { error } = await supabaseBrowser
      .from("questionnaire")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      return;
    }

    setQuestionnaires((prev) => prev.filter((q) => q.id !== id));
    if (editId === id) cancelEdit();
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Questionnaires</h1>

      <section>
        <h2>Create</h2>
        <form onSubmit={handleCreate}>
          <div>
            <input
              required
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <button type="submit">Add</button>
        </form>
      </section>

      <section>
        <h2>Existing questionnaires:</h2>
        {questionnaires.length === 0 ? (
          <p>None yet.</p>
        ) : (
          <ul>
            {questionnaires.map((q) => (
              <li key={q.id}>
                {editId === q.id ? (
                  <form onSubmit={handleSaveEdit}>
                    <input
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <button type="submit">Save</button>
                    <button type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div>
                    <strong>{q.title}</strong>{" "}
                    {q.description && <span>— {q.description}</span>}
                    <div>
                      <button onClick={() => startEdit(q)}>Edit</button>
                      <button onClick={() => handleDelete(q.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
