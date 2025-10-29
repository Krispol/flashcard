"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Questionnaire } from "@/types/objects";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

interface ManagerSectionProps {
  onSelect: (id: string) => void;
  onDeleted: (id: string) => void;
}

export default function ManagerSection({
  onSelect,
  onDeleted,
}: ManagerSectionProps) {
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

  async function handleCreateQuestionnaire(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const { data, error } = await supabaseBrowser
      .from("questionnaire")
      .insert([
        {
          title: newTitle.trim(),
          description: newDesc.trim() || null,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("Create Questionnaire error:", error);
      return;
    }

    setQuestionnaires((prev) => [data, ...prev]);
    setNewTitle("");
    setNewDesc("");
  }

  function startEditQuestionnaire(q: Questionnaire) {
    setEditId(q.id);
    setEditTitle(q.title);
    setEditDesc(q.description ?? "");
  }

  function cancelEditQuestionnaire() {
    setEditId(null);
    setEditTitle("");
    setEditDesc("");
  }

  async function handleSaveEditQuestionnaire(e: React.FormEvent) {
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
      console.error("Update Questionnaire error:", error);
      return;
    }

    setQuestionnaires((prev) => prev.map((q) => (q.id === editId ? data : q)));

    cancelEditQuestionnaire();
  }

  async function handleDeleteQuestionnaire(id: string) {
    const { error } = await supabaseBrowser
      .from("questionnaire")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete Questionnaire error:", error);
      return;
    }

    setQuestionnaires((prev) => prev.filter((q) => q.id !== id));

    onDeleted(id);

    if (editId === id) cancelEditQuestionnaire();
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Questionnaires
      </Typography>

      <Box component="form" onSubmit={handleCreateQuestionnaire} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create new
        </Typography>

        <Stack spacing={2} maxWidth={400}>
          <TextField
            required
            label="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            size="small"
          />

          <TextField
            label="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            size="small"
            multiline
            maxRows={15}
            minRows={3}
          />

          <Button type="submit" variant="contained">
            Add
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" gutterBottom>
        Existing questionnaires
      </Typography>

      {questionnaires.length === 0 ? (
        <Typography color="text.secondary">None yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {questionnaires.map((q) => {
            const isEditing = editId === q.id;

            return (
              <Card key={q.id} variant="outlined">
                <CardContent>
                  {isEditing ? (
                    <Box
                      component="form"
                      onSubmit={handleSaveEditQuestionnaire}
                    >
                      <Stack spacing={2}>
                        <TextField
                          required
                          label="Title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          size="small"
                        />

                        <TextField
                          label="Description"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          size="small"
                          multiline
                          minRows={3}
                        />

                        <Stack direction="row" spacing={1}>
                          <Button type="submit" variant="contained">
                            Save
                          </Button>
                          <Button
                            variant="text"
                            onClick={cancelEditQuestionnaire}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {q.title}
                        </Typography>
                        {q.description && (
                          <Typography variant="body2" color="text.secondary">
                            {q.description}
                          </Typography>
                        )}
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => onSelect(q.id)}
                        >
                          Select
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => startEditQuestionnaire(q)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteQuestionnaire(q.id)}
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
