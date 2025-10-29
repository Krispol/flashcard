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
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";

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
  const [quizDone, setQuizDone] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

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
      setQuizDone(false);

      setUserAnswer("");
      setChecked(false);
      setIsCorrect(null);

      setCorrectCount(0);
      setWrongCount(0);
    })();
  }, [questionnaireId]);

  function normalizeAnswer(s: string) {
    return s.trim().toLowerCase();
  }

  function handleCheck() {
    if (checked || !cards[currentIndex]) return;

    const current = cards[currentIndex];
    const correct =
      normalizeAnswer(current.answer) === normalizeAnswer(userAnswer);

    setChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((w) => w + 1);
    }
  }

  function handleNext() {
    if (currentIndex === cards.length - 1) {
      setQuizDone(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    setUserAnswer("");
    setChecked(false);
    setIsCorrect(null);
  }

  function handleRestart() {
    if (cards.length === 0) return;

    setCurrentIndex(0);
    setQuizDone(false);

    setUserAnswer("");
    setChecked(false);
    setIsCorrect(null);

    setCorrectCount(0);
    setWrongCount(0);
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

  if (quizDone) {
    const total = cards.length;
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
        <Stack spacing={3} sx={{ maxWidth: 500, width: "100%" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="text" onClick={onBack}>
              ← Back
            </Button>

            <Typography variant="h4">Quiz results</Typography>
          </Stack>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={600}>
                  Finished!
                </Typography>

                <Typography variant="body1">
                  You answered {correctCount} correctly out of {total}.
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Correct: {correctCount}
                  <br />
                  Wrong: {wrongCount}
                  <br />
                  Score:{" "}
                  {total > 0 ? Math.round((correctCount / total) * 100) : 0}%
                </Typography>

                <Divider />

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleRestart}
                  >
                    Restart quiz
                  </Button>

                  <Button variant="outlined" size="small" onClick={onBack}>
                    Back to cards
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    );
  }

  const current = cards[currentIndex];
  const autoReveal = checked;

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
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="text" onClick={onBack}>
            ← Back
          </Button>

          <Typography variant="h4">Quiz mode</Typography>

          <Stack spacing={0.5} sx={{ marginLeft: "auto", textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary">
              Card {currentIndex + 1} / {cards.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Correct {correctCount} / Incorrect {wrongCount}
            </Typography>
          </Stack>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Question:
                </Typography>
                <Typography variant="body1">{current.question}</Typography>
              </Box>

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
                    disabled={checked}
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleCheck}
                      disabled={checked}
                    >
                      Check
                    </Button>
                  </Stack>

                  {checked && isCorrect === true && (
                    <Alert severity="success" variant="filled">
                      Correct !
                    </Alert>
                  )}

                  {checked && isCorrect === false && (
                    <Alert severity="error" variant="filled">
                      Incorrect, the correct answer can be seen below:
                    </Alert>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Answer:
                </Typography>

                {autoReveal ? (
                  <Typography variant="body1">{current.answer}</Typography>
                ) : (
                  <Typography variant="body1">
                    [ hidden until checked ]
                  </Typography>
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
                  {currentIndex === cards.length - 1 ? "Finish" : "Next"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
