import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SubmissionsProvider } from "@/components/SubmissionsProvider";
import Backdrop from "@/components/Backdrop";

export const metadata = {
  title: "GDG Recruitment Portal | Google Developer Groups",
  description:
    "Join Google Developer Groups on campus — explore our 12 departments and apply to up to two teams.",
  icons: { icon: "/gdg.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Backdrop />
        <SubmissionsProvider>{children}</SubmissionsProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
