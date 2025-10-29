import { supabaseServer } from "@/lib/supabase-server";
import FlashcardSectionClient from "./FlashSectionClient";

export default async function FlashcardSectionServer({
  questionnaireId,
  onBack,
  onStartQuiz,
}: {
  questionnaireId: string;
  onBack: () => void;
  onStartQuiz: () => void;
}) {
  const supabase = supabaseServer();

  const { data: flashcards, error } = await supabase
    .from("flash")
    .select("*")
    .eq("questionnaire_id", questionnaireId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load flashcards (server):", error);
  }

  return (
    <FlashcardSectionClient
      questionnaireId={questionnaireId}
      initialFlashcards={flashcards ?? []}
      onBack={onBack}
      onStartQuiz={onStartQuiz}
    />
  );
}
