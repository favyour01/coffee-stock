"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormStack } from "@/components/ui/field";
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
        <FormStack onSubmit={handleSubmit}>
          <Field label="Email">
            <Input value={profile.email} disabled />
          </Field>
          <Field label="Role">
            <Badge className="w-fit">{ROLES[profile.role]}</Badge>
          </Field>
          <Field label="Nama">
            <Input value={nama} onChange={(e) => setNama(e.target.value)} required />
          </Field>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </FormStack>
      </CardContent>
    </Card>
  );
}
