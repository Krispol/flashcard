"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Flashcard } from "@/types/objects";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface QuizSectionProps {
  questionnaireId: string;
  onBack: () => void;
}

export default function QuizSection({
  questionnaireId,
  onBack,
}: QuizSectionProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseBrowser
        .from("flash")
        .select("*")
        .eq("questionnaire_id", questionnaireId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load quiz cards:", error);
        return;
      }

      setCards(data);
      setCurrentIndex(0);
      setShowAnswer(false);
    })();
  }, [questionnaireId]);

  function handleNext() {
    if (cards.length === 0) return;
    const next = (currentIndex + 1) % cards.length;
    setCurrentIndex(next);
    setShowAnswer(false);
  }

  if (cards.length === 0) {
    return (
      <Box p={2}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button variant="text" onClick={onBack}>
            ← Back
          </Button>

          <Typography variant="h4">Quiz mode</Typography>
        </Stack>

        <Typography color="text.secondary">
          No flashcards available in this questionnaire.
        </Typography>
      </Box>
    );
  }

  const current = cards[currentIndex];

  return (
    <Box p={2}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="text" onClick={onBack}>
          ← Back
        </Button>

        <Typography variant="h4">Quiz mode</Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Q:
              </Typography>
              <Typography variant="body1">{current.question}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                A:
              </Typography>

              {showAnswer ? (
                <Typography variant="body1">{current.answer}</Typography>
              ) : (
                <Typography variant="body1">[ hidden ]</Typography>
              )}

              {!showAnswer && (
                <Button
                  sx={{ mt: 1 }}
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAnswer(true)}
                >
                  Show answer
                </Button>
              )}
            </Box>

            {current.note ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Note:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {current.note}
                </Typography>
              </Box>
            ) : null}

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Button variant="contained" size="small" onClick={handleNext}>
                Next →
              </Button>

              <Typography variant="caption" color="text.secondary">
                Card {currentIndex + 1} / {cards.length}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
