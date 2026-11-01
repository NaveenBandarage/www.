import type { ReactNode } from "react";
import { Main } from "../Layouts";

export default function PhotoLayout({ children }: { children: ReactNode }) {
  return <Main>{children}</Main>;
}
