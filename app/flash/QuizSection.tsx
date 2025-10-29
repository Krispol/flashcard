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
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";

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
  const [userAnswer, setUserAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
      setUserAnswer("");
      setChecked(false);
      setIsCorrect(null);
    })();
  }, [questionnaireId]);

  function normalizeAnswer(s: string) {
    return s.trim().toLowerCase();
  }

  function handleCheck() {
    const current = cards[currentIndex];
    const correct =
      normalizeAnswer(current.answer) === normalizeAnswer(userAnswer);

    setChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setShowAnswer(true);
    }
  }

  function handleNext() {
    if (cards.length === 0) return;
    const next = (currentIndex + 1) % cards.length;
    setCurrentIndex(next);
    setShowAnswer(false);
  }

  if (cards.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 500, width: "100%" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="text" onClick={onBack}>
              ← Back
            </Button>

            <Typography variant="h4">Quiz mode</Typography>
          </Stack>

          <Typography color="text.secondary">
            No flashcards available in this questionnaire.
          </Typography>
        </Stack>
      </Box>
    );
  }

  const current = cards[currentIndex];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 600, width: "100%" }}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="text" onClick={onBack}>
            ← Back
          </Button>

          <Typography variant="h4">Quiz mode</Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ marginLeft: "auto" }}
          >
            Card {currentIndex + 1} / {cards.length}
          </Typography>
        </Stack>

        {/* The quiz card */}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              {/* Question */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Q:
                </Typography>
                <Typography variant="body1">{current.question}</Typography>
              </Box>

              {/* Your answer pane */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Your answer:
                </Typography>

                <Stack spacing={1}>
                  <TextField
                    multiline
                    minRows={2}
                    maxRows={6}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    size="small"
                    placeholder="Type your answer here…"
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleCheck}
                      disabled={checked && isCorrect === true} // if already correct, no need to re-check
                    >
                      Check
                    </Button>

                    {!showAnswer && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAnswer(true)}
                      >
                        Reveal answer
                      </Button>
                    )}
                  </Stack>

                  {/* Feedback after check */}
                  {checked && isCorrect === true && (
                    <Alert severity="success" variant="filled">
                      Correct 🎉
                    </Alert>
                  )}

                  {checked && isCorrect === false && (
                    <Alert severity="error" variant="filled">
                      Not quite. Compare with the official answer below.
                    </Alert>
                  )}
                </Stack>
              </Box>

              {/* Official answer / explanation */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  A:
                </Typography>

                {showAnswer ? (
                  <Typography variant="body1">{current.answer}</Typography>
                ) : (
                  <Typography variant="body1">[ hidden ]</Typography>
                )}
              </Box>

              {/* Optional note */}
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

              {/* Bottom row: next, progress */}
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
                  {checked
                    ? isCorrect
                      ? "Marked correct"
                      : "Review and continue"
                    : "Answer then check"}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
