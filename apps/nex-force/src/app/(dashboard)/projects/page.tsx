import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function ProjectsIndexPage() {
    redirect(ROUTES.projectPage);
}
