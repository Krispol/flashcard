"use client";

import { useState } from "react";
import Manager from "./ManagerSection";
import FlashcardSection from "./FlashSection";

export default function ManagerPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  function handleSelectQuestionnaire(id: string) {
    setActiveId(id);
  }

  function handleBackToList() {
    setActiveId(null);
  }

  function handleDeletedQuestionnaire(deletedId: string) {
    if (activeId === deletedId) {
      setActiveId(null);
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      {!activeId ? (
        <Manager
          onSelect={handleSelectQuestionnaire}
          onDeleted={handleDeletedQuestionnaire}
        />
      ) : (
        <FlashcardSection
          questionnaireId={activeId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}
