import { supabaseServer } from "@/lib/supabase-server";
import FlashSectionClient from "./FlashSectionClient";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme } from "@/src/theme";

interface FlashcardPageProps {
  params: { questionnaireId: string };
}

export default async function FlashcardPage(props: FlashcardPageProps) {
  const { params } = props;
  const { questionnaireId } = await params;

  const supabase = supabaseServer();

  const { data: flashcards, error } = await supabase
    .from("flash")
    .select("*")
    .eq("questionnaire_id", questionnaireId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load flashcards:", error);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <FlashSectionClient
        questionnaireId={questionnaireId}
        initialFlashcards={flashcards ?? []}
      />
    </ThemeProvider>
  );
}
