"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Field } from "@/components/ui/field";
import { resetAllBusinessData } from "@/actions/data";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

const CONFIRM_TEXT = "HAPUS SEMUA";

export function DataManagementClient() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const result = await resetAllBusinessData(confirmation);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Semua data berhasil dihapus. Data user tetap aman.");
    setConfirmation("");
    setOpen(false);
  };

  return (
    <Card className="max-w-2xl border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Reset Data
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Hapus seluruh data barang, transaksi, supplier, kategori, satuan, resep,
          penjualan, dan audit log. Data user dan profil <strong>tidak</strong> dihapus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Semua Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Yakin hapus semua data?</AlertDialogTitle>
              <AlertDialogDescription className="leading-relaxed">
                Tindakan ini tidak bisa dibatalkan. Semua barang, stok, transaksi,
                supplier, kategori, resep, dan laporan akan dihapus permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Field
              label={`Ketik "${CONFIRM_TEXT}" untuk konfirmasi`}
              hint="Pastikan Anda sudah backup data jika diperlukan."
            >
              <Input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={CONFIRM_TEXT}
                autoComplete="off"
              />
            </Field>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmation("")}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleReset();
                }}
                disabled={loading || confirmation !== CONFIRM_TEXT}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {loading ? "Menghapus..." : "Ya, Hapus Semua"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
