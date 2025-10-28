"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Flashcard } from "@/types/objects";

interface FlashcardSectionProps {
  questionnaireId: string;
  onBack: () => void;
}

export default function FlashcardSection({
  questionnaireId,
  onBack,
}: FlashcardSectionProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newNote, setNewNote] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseBrowser
        .from("flash")
        .select("*")
        .eq("questionnaire_id", questionnaireId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load flashcards:", error);
        return;
      }

      setFlashcards(data);
    })();
  }, [questionnaireId]);

  async function handleCreateFlashcard(e: React.FormEvent) {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) return;

    const { data, error } = await supabaseBrowser
      .from("flash")
      .insert([
        {
          questionnaire_id: questionnaireId,
          question: newQ.trim(),
          answer: newA.trim(),
          note: newNote.trim() || null,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Create flashcard error:", error);
      return;
    }

    setFlashcards((prev) => [...prev, data]);

    setNewQ("");
    setNewA("");
    setNewNote("");
  }

  function startEdit(card: Flashcard) {
    setEditId(card.id);
    setEditQ(card.question);
    setEditA(card.answer);
    setEditNote(card.note ?? "");
  }

  function cancelEdit() {
    setEditId(null);
    setEditQ("");
    setEditA("");
    setEditNote("");
  }

  async function handleSaveFlashcard(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;

    const { data, error } = await supabaseBrowser
      .from("flash")
      .update({
        question: editQ.trim(),
        answer: editA.trim(),
        note: editNote.trim() || null,
      })
      .eq("id", editId)
      .select("*")
      .single();

    if (error) {
      console.error("Update flashcard error:", error);
      return;
    }

    setFlashcards((prev) =>
      prev.map((card) => (card.id === editId ? data : card))
    );

    cancelEdit();
  }

  async function handleDeleteFlashcard(id: string) {
    const { error } = await supabaseBrowser.from("flash").delete().eq("id", id);

    if (error) {
      console.error("Delete flashcard error:", error);
      return;
    }

    setFlashcards((prev) => prev.filter((card) => card.id !== id));

    if (editId === id) {
      cancelEdit();
    }
  }

  return (
    <section>
      <button onClick={onBack}>← Back to questionnaires</button>

      <h1>Flashcards</h1>

      <form onSubmit={handleCreateFlashcard}>
        <div>
          <input
            required
            placeholder="Question"
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
          />
        </div>

        <div>
          <input
            required
            placeholder="Answer"
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
          />
        </div>

        <div>
          <input
            placeholder="Note (optional)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </div>

        <button type="submit">Add flashcard</button>
      </form>

      <h2>Existing cards</h2>

      {flashcards.length === 0 ? (
        <p>No flashcards yet for this questionnaire.</p>
      ) : (
        <ul>
          {flashcards.map((card) => (
            <li
              key={card.id}
              style={{
                marginBottom: "1rem",
                border: "1px solid gray",
                padding: "0.5rem",
              }}
            >
              {editId === card.id ? (
                <form onSubmit={handleSaveFlashcard}>
                  <div>
                    <input
                      required
                      value={editQ}
                      onChange={(e) => setEditQ(e.target.value)}
                    />
                  </div>

                  <div>
                    <input
                      required
                      value={editA}
                      onChange={(e) => setEditA(e.target.value)}
                    />
                  </div>

                  <div>
                    <input
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                  </div>

                  <button type="submit">Save</button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <div>
                    <strong>Q:</strong> {card.question}
                  </div>
                  <div>
                    <strong>A:</strong> {card.answer}
                  </div>
                  {card.note ? (
                    <div>
                      <strong>Note:</strong> {card.note}
                    </div>
                  ) : null}

                  <div>
                    <button onClick={() => startEdit(card)}>Edit</button>
                    <button onClick={() => handleDeleteFlashcard(card.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
