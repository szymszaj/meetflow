import { dashboardContent } from "@/content/dashboard";
import { EventTypeForm } from "@/components/host/EventTypeForm";

export default function NewEventTypePage() {
  return <EventTypeForm content={dashboardContent.eventTypeForm} />;
}
