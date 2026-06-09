import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, LogIn, Users } from "lucide-react";
import { getLoginUrl, navigateToLogin } from "@/const";

export default function InviteAccept() {
  const [, params] = useRoute("/invite/accept/:token");
  const [, navigate] = useLocation();
  const token = params?.token || "";
  const { user, loading: authLoading } = useAuth();
  const [accepting, setAccepting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  // Validate the token
  const { data: validation, isLoading: validating } = trpc.inviteWorkflow.validateToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const acceptMutation = trpc.inviteWorkflow.accept.useMutation({
    onSuccess: (data: any) => {
      setResult({ success: true });
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/app/dashboard");
      }, 2000);
    },
    onError: (err: any) => {
      setResult({ error: err.message });
    },
  });

  async function handleAccept() {
    if (!token || accepting) return;
    setAccepting(true);
    try {
      await acceptMutation.mutateAsync({ token });
    } finally {
      setAccepting(false);
    }
  }

  function handleLogin() {
    // Store the invite token in sessionStorage so we can redirect back after login
    sessionStorage.setItem("pendingInviteToken", token);
    navigateToLogin();
  }

  // Auto-accept if user is already logged in and came back from login
  useEffect(() => {
    const pendingToken = sessionStorage.getItem("pendingInviteToken");
    if (user && pendingToken && pendingToken === token && validation?.valid && !result) {
      sessionStorage.removeItem("pendingInviteToken");
      handleAccept();
    }
  }, [user, token, validation]);

  if (validating || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground animate-pulse mb-4" />
            <p className="text-muted-foreground">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validation?.valid) {
    const reason = validation?.reason || "not_found";
    const messages: Record<string, string> = {
      not_found: "This invitation link is invalid or does not exist.",
      expired: "This invitation has expired. Please request a new invite from the workspace admin.",
      accepted: "This invitation has already been accepted.",
      revoked: "This invitation has been revoked by the workspace admin.",
    };
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-2" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{messages[reason] || messages.not_found}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <CardTitle>Welcome to the team!</CardTitle>
            <CardDescription>
              You have joined <strong>{validation.workspaceName}</strong> as{" "}
              <Badge variant="outline" className="ml-1">{validation.role}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Redirecting to dashboard...</p>
            <Button onClick={() => navigate("/app/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result?.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-2" />
            <CardTitle>Could not accept invite</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
          <CardTitle>Workspace Invitation</CardTitle>
          <CardDescription>
            You have been invited to join <strong>{validation.workspaceName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Invited as</p>
            <Badge variant="outline" className="text-sm">{validation.role}</Badge>
          </div>

          {user ? (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Signed in as <strong>{user.email || user.name}</strong>
              </p>
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting ? "Accepting..." : "Accept Invitation"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Please sign in to accept this invitation.
              </p>
              <Button className="w-full" onClick={handleLogin}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Accept
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
