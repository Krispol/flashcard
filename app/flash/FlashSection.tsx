"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Flashcard } from "@/types/objects";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

interface FlashcardSectionProps {
  questionnaireId: string;
  onBack: () => void;
  onStartQuiz: () => void;
}

export default function FlashcardSection({
  questionnaireId,
  onBack,
  onStartQuiz,
}: FlashcardSectionProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newNote, setNewNote] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editNote, setEditNote] = useState("");

  const [revealed, setRevealed] = useState<Set<string>>(new Set());

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
      setRevealed(new Set(data.map((c) => c.id)));
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

    setRevealed((prev) => {
      const copy = new Set(prev);
      copy.delete(data.id);
      return copy;
    });

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

    setRevealed((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });

    if (editId === id) {
      cancelEdit();
    }
  }

  function toggleReveal(cardId: string) {
    setRevealed((prev) => {
      const copy = new Set(prev);
      if (copy.has(cardId)) {
        copy.delete(cardId);
      } else {
        copy.add(cardId);
      }
      return copy;
    });
  }

  return (
    <Box p={2}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="text" onClick={onBack}>
          ← Back to questionnaires
        </Button>

        <Typography variant="h4">Flashcards</Typography>

        <Button variant="contained" size="small" onClick={onStartQuiz}>
          ▶ Quiz mode
        </Button>
      </Stack>

      <Box
        component="form"
        onSubmit={handleCreateFlashcard}
        sx={{ mb: 4, maxWidth: 500 }}
      >
        <Typography variant="h6" gutterBottom>
          Add new flashcard
        </Typography>

        <Stack spacing={2}>
          <TextField
            required
            label="Question"
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            size="small"
          />

          <TextField
            required
            label="Answer"
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
            size="small"
          />

          <TextField
            label="Note (optional)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            size="small"
          />

          <Button type="submit" variant="contained">
            Add card
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" gutterBottom>
        Existing cards
      </Typography>

      {flashcards.length === 0 ? (
        <Typography color="text.secondary">
          No flashcards yet for this questionnaire.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {flashcards.map((card) => {
            const isEditing = editId === card.id;
            const isRevealed = revealed.has(card.id);

            return (
              <Card key={card.id} variant="outlined">
                <CardContent>
                  {isEditing ? (
                    <Box
                      component="form"
                      onSubmit={handleSaveFlashcard}
                      sx={{ maxWidth: 600 }}
                    >
                      <Stack spacing={2}>
                        <TextField
                          required
                          label="Question"
                          value={editQ}
                          onChange={(e) => setEditQ(e.target.value)}
                          size="small"
                        />

                        <TextField
                          required
                          label="Answer"
                          value={editA}
                          onChange={(e) => setEditA(e.target.value)}
                          size="small"
                        />

                        <TextField
                          label="Note"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          size="small"
                        />

                        <Stack direction="row" spacing={1}>
                          <Button
                            type="submit"
                            variant="contained"
                            size="small"
                          >
                            Save
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Q:
                        </Typography>
                        <Typography variant="body1">{card.question}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          A:
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1">
                            {isRevealed ? card.answer : "[ hidden ]"}
                          </Typography>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => toggleReveal(card.id)}
                          >
                            {isRevealed ? "Hide" : "Show"}
                          </Button>
                        </Stack>
                      </Box>

                      {card.note ? (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Note:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.note}
                          </Typography>
                        </Box>
                      ) : null}

                      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => startEdit(card)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteFlashcard(card.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
