import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, ExternalLink, CheckCircle2, XCircle, Download } from 'lucide-react'
import * as workerDocumentApi from '../../api/workerDocumentApi'
import { useAuth } from '../../context/AuthContext'
import { exportPendingDocumentsPDF } from '../../lib/pdfExport'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { formatDate } from '@/lib/utils'


// ── Review dialog ──────────────────────────────────────────────────────────────
function ReviewDialog({ open, onOpenChange, doc, action, onSuccess }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const isApprove = action === "APPROVED";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workerDocumentApi.review(doc.id, {
        status: action,
        rejectionReason: isApprove ? null : reason,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Error al revisar");
    } finally {
      setSaving(false);
    }
  };

  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Aprobar documento" : "Rechazar documento"}
          </DialogTitle>
        </DialogHeader>

        <form id="rvf" onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm space-y-1">
            <p>
              <span className="font-medium">Trabajador:</span>{" "}
              {doc.workerName ?? "—"}
            </p>
            <p>
              <span className="font-medium">Documento:</span>{" "}
              {doc.documentTypeName ?? "—"}
            </p>
          </div>

          {isApprove ? (
            <p className="text-sm text-muted-foreground">
              ¿Confirmas que el documento es válido y cumple todos los
              requisitos?
            </p>
          ) : (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Motivo del rechazo</label>
              <textarea
                required
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Indica el motivo por el que se rechaza el documento..."
              />
            </div>
          )}
        </form>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="rvf"
            disabled={saving}
            className={[
              "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-50",
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-destructive hover:bg-destructive/90",
            ].join(" ")}
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isApprove ? "Aprobar documento" : "Rechazar documento"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PendingDocumentsPage() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(null);

  const [reviewDoc, setReviewDoc] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);

  const load = async () => {
    try {
      setDocs(await workerDocumentApi.getPending());
    } catch {
      toast.error("Error al cargar documentos pendientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleView = async (doc) => {
    setViewLoading(doc.id);
    try {
      const full = await workerDocumentApi.getById(doc.id);
      if (full.downloadUrl) {
        window.open(full.downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No hay URL disponible para este documento");
      }
    } catch {
      toast.error("No se pudo obtener la URL del documento");
    } finally {
      setViewLoading(null);
    }
  };

  const openReview = (doc, action) => {
    setReviewDoc(doc);
    setReviewAction(action);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Documentos Pendientes de Revisión
            </h1>
            <p className="text-sm text-muted-foreground">
              Revisa y valida los documentos subidos por los trabajadores
            </p>
          </div>
          {!loading && (
            <span className="inline-flex h-6 items-center rounded-full bg-amber-100 px-2.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {docs.length} pendiente{docs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {!loading && docs.length > 0 && (
          <button
            onClick={() => exportPendingDocumentsPDF(docs, user?.companyName ?? user?.email ?? 'Empresa')}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-4 text-sm hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead>Tipo de documento</TableHead>
                <TableHead>Fecha subida</TableHead>
                <TableHead>Fecha caducidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay documentos pendientes de revisión.
                  </TableCell>
                </TableRow>
              ) : (
                docs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.workerName ?? "—"}
                    </TableCell>
                    <TableCell>{doc.documentTypeName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(doc.uploadedAt ?? doc.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(doc.expiryDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* View */}
                        <button
                          onClick={() => handleView(doc)}
                          disabled={viewLoading === doc.id}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-3 text-xs hover:bg-accent disabled:opacity-50"
                        >
                          {viewLoading === doc.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3 w-3" />
                          )}
                          Ver
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => openReview(doc, "APPROVED")}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-100 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Aprobar
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => openReview(doc, "REJECTED")}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 text-xs font-medium text-destructive hover:bg-destructive/20"
                        >
                          <XCircle className="h-3 w-3" />
                          Rechazar
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ReviewDialog
        open={!!reviewDoc}
        onOpenChange={(v) => {
          if (!v) {
            setReviewDoc(null);
            setReviewAction(null);
          }
        }}
        doc={reviewDoc}
        action={reviewAction}
        onSuccess={load}
      />
    </div>
  );
}
