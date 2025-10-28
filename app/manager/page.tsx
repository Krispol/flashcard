"use client";

import { useState } from "react";
import ManagerSection from "./ManagerSection";
import FlashcardSection from "./FlashSection";

export default function managerPage() {
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
        <ManagerSection
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
