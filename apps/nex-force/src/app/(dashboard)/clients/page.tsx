import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function ClientsRedirect() {
    redirect(ROUTES.clientPage);
}
