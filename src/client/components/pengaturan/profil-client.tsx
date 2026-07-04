import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormStack } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { userApi, authApi } from "@/lib/api";
import { toast } from "sonner";
import { ROLES } from "@/lib/auth/roles";
import type { User } from "@/types";

export function ProfilClient({ profile }: { profile: User }) {
  const [nama, setNama] = useState(profile.nama);
  const [email, setEmail] = useState(profile.email);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.updateProfile({ nama, email });
      toast.success("Profil diperbarui");
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await authApi.changePassword(currentPwd, newPwd);
      toast.success("Password berhasil diubah");
      setCurrentPwd(""); setNewPwd("");
    } catch (e) { toast.error((e as Error).message); }
    finally { setPwdLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-md">
      <Card>
        <CardHeader><CardTitle>Profil Saya</CardTitle></CardHeader>
        <CardContent>
          <FormStack onSubmit={handleSubmit}>
            <Field label="Role"><Badge className="w-fit">{ROLES[profile.role]}</Badge></Field>
            <Field label="Nama"><Input value={nama} onChange={(e) => setNama(e.target.value)} required /></Field>
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </FormStack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ubah Password</CardTitle></CardHeader>
        <CardContent>
          <FormStack onSubmit={handlePasswordChange}>
            <Field label="Password Lama"><Input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required /></Field>
            <Field label="Password Baru"><Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={6} /></Field>
            <Button type="submit" disabled={pwdLoading} className="w-full sm:w-auto">
              {pwdLoading ? "Memproses..." : "Ubah Password"}
            </Button>
          </FormStack>
        </CardContent>
      </Card>
    </div>
  );
}
