// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, FileText } from "lucide-react";

export default function Handbook() {
  const [sections] = useState([
    { id: 1, title: "Company Overview", status: "complete" },
    { id: 2, title: "Compliance Requirements", status: "in-progress" },
    { id: 3, title: "Quality Management", status: "draft" },
    { id: 4, title: "Security Procedures", status: "draft" },
    { id: 5, title: "Subcontractor Management", status: "not-started" },
  ]);

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Compliance Handbook</h1><p className="text-muted-foreground">Build and maintain your compliance handbook</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Section</Button>
      </div>
      <div className="space-y-3">
        {sections.map(s => (
          <Card key={s.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-primary" /><span className="font-medium">{s.title}</span></div>
              <span className={"px-2 py-1 rounded text-xs " + (s.status === "complete" ? "bg-green-100 text-green-800" : s.status === "in-progress" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600")}>{s.status}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
