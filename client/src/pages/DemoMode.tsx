// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, AlertTriangle } from "lucide-react";

export default function DemoMode() {
  const [demoActive, setDemoActive] = useState(false);

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Demo Mode</h1><p className="text-muted-foreground">Preview the platform with sample data</p></div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Demo Mode {demoActive ? "Active" : "Inactive"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {demoActive ? "Demo mode is active. Sample data is being shown. Disable to return to your real workspace." : "Enable demo mode to explore the platform with pre-populated sample data. Your real data will not be affected."}
              </p>
              <Button variant={demoActive ? "destructive" : "default"} onClick={() => setDemoActive(!demoActive)}>
                <Play className="h-4 w-4 mr-2" />{demoActive ? "Disable Demo Mode" : "Enable Demo Mode"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
