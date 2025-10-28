"use client";

import { useState } from "react";
import ManagerSection from "./ManagerSection";
import FlashcardSection from "./FlashSection";
import QuizSection from "./QuizSection";

type Mode = "list" | "flashcards" | "quiz";

export default function ManagerPage() {
  const [mode, setMode] = useState<Mode>("list");
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleSelectQuestionnaire(id: string) {
    setActiveId(id);
    setMode("flashcards");
  }

  function handleDeletedQuestionnaire(deletedId: string) {
    if (activeId === deletedId) {
      setActiveId(null);
      setMode("list");
    }
  }

  function handleBackToList() {
    setActiveId(null);
    setMode("list");
  }

  function handleStartQuiz() {
    setMode("quiz");
  }

  function handleBackToFlashcards() {
    setMode("flashcards");
  }

  return (
    <>
      {mode === "list" && (
        <ManagerSection
          onSelect={handleSelectQuestionnaire}
          onDeleted={handleDeletedQuestionnaire}
        />
      )}

      {mode === "flashcards" && activeId && (
        <FlashcardSection
          questionnaireId={activeId}
          onBack={handleBackToList}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {mode === "quiz" && activeId && (
        <QuizSection
          questionnaireId={activeId}
          onBack={handleBackToFlashcards}
        />
      )}
    </>
  );
}
