"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/actions/users";
import { toast } from "sonner";
import { ROLES } from "@/lib/auth/roles";
import type { Profile } from "@/types";

export function ProfilClient({ profile }: { profile: Profile }) {
  const [nama, setNama] = useState(profile.nama);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(nama);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Profil diperbarui");
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Profil Saya</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={profile.email} disabled />
          </div>
          <div>
            <Label>Role</Label>
            <div className="mt-1"><Badge>{ROLES[profile.role]}</Badge></div>
          </div>
          <div>
            <Label>Nama</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
