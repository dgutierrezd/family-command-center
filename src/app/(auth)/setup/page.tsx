"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFamily, joinFamily } from "@/actions/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function SetupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", familyName);

    startTransition(async () => {
      const result = (await createFamily(fd)) as {
        success?: boolean;
        error?: string;
      };
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Family created!");
      router.push("/dashboard");
    });
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("inviteCode", inviteCode);

    startTransition(async () => {
      const result = (await joinFamily(fd)) as {
        success?: boolean;
        error?: string;
      };
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Joined family!");
      router.push("/dashboard");
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold">
            Welcome to Family Command Center
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Create a new family or join an existing one to get started.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="w-full">
              <TabsTrigger value="create" className="flex-1 gap-2">
                <Users className="size-4" />
                Create Family
              </TabsTrigger>
              <TabsTrigger value="join" className="flex-1 gap-2">
                <UserPlus className="size-4" />
                Join Family
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="family-name" className="text-sm font-medium">
                    Family Name
                  </label>
                  <Input
                    id="family-name"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="The Smith Family"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending || !familyName.trim()}
                >
                  {isPending ? "Creating..." : "Create Family"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join" className="mt-4">
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="invite-code" className="text-sm font-medium">
                    Invite Code
                  </label>
                  <Input
                    id="invite-code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invite code"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  variant="outline"
                  disabled={isPending || !inviteCode.trim()}
                >
                  {isPending ? "Joining..." : "Join Family"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
