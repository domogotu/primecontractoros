// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Scale } from "lucide-react";
import { Link } from "wouter";

export default function LegalPages() {
  const pages = [
    { title: "Terms of Service", icon: Scale, path: "/terms", description: "Platform usage terms and conditions" },
    { title: "Privacy Policy", icon: Shield, path: "/privacy", description: "How we handle your data" },
    { title: "Acceptable Use Policy", icon: FileText, path: "#", description: "Guidelines for platform usage" },
    { title: "Data Processing Agreement", icon: FileText, path: "#", description: "GDPR and data processing terms" },
  ];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Legal Documents</h1><p className="text-muted-foreground">Review platform legal documents and policies</p></div>
      <div className="grid grid-cols-2 gap-4">
        {pages.map(p => {
          const Icon = p.icon;
          return (
            <Link key={p.title} href={p.path}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
