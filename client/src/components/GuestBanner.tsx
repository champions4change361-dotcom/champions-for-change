import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, User } from "lucide-react";
import { useDomain } from "@/hooks/useDomain";

export default function GuestBanner() {
  const { isSchoolSafe } = useDomain();
  
  if (!isSchoolSafe()) return null;
  
  return (
    <Alert className="border-blue-200 bg-blue-50 mb-4">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>District Guest Access:</strong> You're viewing tournaments without signing in. 
        All tournament information, brackets, and live updates are available. 
        To create tournaments, contact Champions for Change at{" "}
        <a 
          href="mailto:champions4change361@gmail.com" 
          className="underline hover:text-blue-900"
        >
          champions4change361@gmail.com
        </a>
      </AlertDescription>
    </Alert>
  );
}