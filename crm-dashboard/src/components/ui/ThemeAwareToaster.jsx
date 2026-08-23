import { Toaster } from "sonner";
import { useTheme } from "../../theme/ThemeContext.jsx";

export function ThemeAwareToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} richColors closeButton position="bottom-right" />;
}
