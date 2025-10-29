import { supabaseServer } from "@/lib/supabase-server";
import ManagerSectionClient from "./ManagerSectionClient";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme } from "@/src/theme";

export default async function ManagerSectionServer() {
  const supabase = supabaseServer();

  const { data: questionnaires, error } = await supabase
    .from("questionnaire")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load questionnaires:", error);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ManagerSectionClient initialQuestionnaires={questionnaires ?? []} />
    </ThemeProvider>
  );
}
