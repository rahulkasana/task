import { createFileRoute } from "@tanstack/react-router";
import SurveyTypeformPage from "@/components/surveyForm.tsx";

export const Route = createFileRoute("/(app)/survey")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-3xl h-full p-4">
          <SurveyTypeformPage surveyId={2} />
        </div>
      </div>
    </div>
  );
}
