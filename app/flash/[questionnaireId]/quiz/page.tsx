import QuizSection from "./QuizSection";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme } from "@/src/theme";

interface QuizPageProps {
  params: { questionnaireId: string };
}

export default function QuizPage({ params }: QuizPageProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <QuizSection questionnaireId={params.questionnaireId} />
    </ThemeProvider>
  );
}
