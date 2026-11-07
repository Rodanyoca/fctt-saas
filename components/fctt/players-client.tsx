"use client"
import { useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import { DataTable, type Column } from '@/components/dashboard/data-table'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { formatDateForDisplay } from '@/lib/compact-date'
import type { Player, PlayerDetail } from '@/lib/fctt/players-domain'
const date = (value: string) => formatDateForDisplay(value) || 'Non renseignée'
export function PlayersClient({ players }: { players: Player[] }) {
  const [selected, setSelected] = useState<Player | null>(null)
  const [detail, setDetail] = useState<PlayerDetail | null>(null), [error, setError] = useState(''), [retry, setRetry] = useState(0)
  const id = selected?.id || ''
  useEffect(() => {
    if (!id) return
    const controller = new AbortController(); let active = true
    setDetail(null); setError('')
    void fetch(`/api/athletes/${encodeURIComponent(id)}`, { cache: 'no-store', credentials: 'same-origin', signal: controller.signal }).then(async response => {
      const body = await response.json()
      if (!response.ok) throw new Error(body.error?.message || 'Lecture de la fiche impossible.')
      if (active) setDetail(body.player)
    }).catch(error => { if (active) setError(error instanceof Error ? error.message : 'Lecture impossible.') })
    return () => { active = false; controller.abort() }
  }, [id, retry])
  const items = useMemo(() => [...players].sort((a, b) => a.name.localeCompare(b.name, 'fr')), [players])
  const field = (label: string, value: string) => <div key={label}><dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{value || 'Non renseigné'}</dd></div>
  const columns: Column<Player>[] = [
    { key: 'id', header: 'ID fédéral', className: 'font-mono text-sm' },
    { key: 'name', header: 'Joueur', className: 'font-medium' },
    { key: 'ittf', header: 'ID ITTF' }, { key: 'sex', header: 'Sexe' },
    { key: 'nationality', header: 'Nationalité' }, { key: 'affiliation', header: 'Affiliation directe', render: player => date(player.affiliation) },
    { key: 'status', header: 'Statut', render: player => <StatusBadge status={player.status || 'Non renseigné'} /> },
  ]
  const filters = [{ key: 'sex', label: 'Sexe' }, { key: 'status', label: 'Statut' }].map(filter => ({ ...filter, options: [...new Set(players.map(player => player[filter.key as 'sex' | 'status']).filter(Boolean))].sort().map(label => ({ value: label, label })) }))
  const viewing = detail?.id === id ? detail : null
  return <div className="space-y-5">
    <p className="text-sm text-muted-foreground">Affiliation directe à la FCTT. L’identifiant fédéral permanent est distinct d’un numéro de licence. Création et modification non activées dans ce point de contrôle.</p>
    {players.length ? <DataTable data={items} columns={columns} filters={filters} idKey="id" searchPlaceholder="Nom, ID fédéral ou ID ITTF…"
      renderActions={player => <Button variant="ghost" size="icon" onClick={() => setSelected(player)} aria-label={`Voir ${player.name || player.id}`}><Eye className="size-4" /></Button>}
      renderMobileCard={player => <div className="space-y-3 rounded-xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{player.name || player.id}</p><p className="break-all font-mono text-xs text-muted-foreground">{player.id}</p></div><StatusBadge status={player.status || 'Non renseigné'} /></div><p className="text-sm">{player.sex || 'Sexe non renseigné'} · {player.nationality || 'Nationalité non renseignée'}</p><p className="text-sm">Affiliation : {date(player.affiliation)}</p><div className="flex justify-end"><Button variant="outline" onClick={() => setSelected(player)}>Voir la fiche</Button></div></div>} />
      : <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun joueur enregistré</p>}
    <Sheet open={selected !== null} onOpenChange={open => { if (!open) setSelected(null) }}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>{selected?.name || 'Fiche Joueur'}</SheetTitle><SheetDescription>Fiche fédérale FCTT · {selected?.id}</SheetDescription></SheetHeader>{selected && <div className="space-y-6 p-4">
      {error ? <section role="alert" className="space-y-3 rounded-xl border border-destructive/40 p-4"><p>{error}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Réessayer</Button></section> : !viewing ? <p role="status">Chargement de la fiche…</p> : <>
        <section className="space-y-4 rounded-xl border p-4"><h2 className="font-semibold">Général</h2><dl className="grid gap-4 sm:grid-cols-2">{field('ID fédéral permanent', viewing.id)}{field('ID ITTF (facultatif)', viewing.ittf)}{field('Nom complet', viewing.name)}{field('Sexe', viewing.sex)}{field('Date de naissance', date(viewing.birth))}{field('Nationalité', viewing.nationality)}</dl><StatusBadge status={viewing.status || 'Non renseigné'} /></section>
        <section className="space-y-4 rounded-xl border p-4"><h2 className="font-semibold">Coordonnées</h2><dl className="grid gap-4 sm:grid-cols-2">{field('Lieu de naissance', viewing.birthplace)}{field('Téléphone', viewing.telephone)}{field('Email', viewing.email)}{field('Adresse', viewing.address)}</dl></section>
        <section className="space-y-4 rounded-xl border p-4"><h2 className="font-semibold">Affiliation directe à la fédération</h2><dl>{field('Date d’affiliation', date(viewing.affiliation))}</dl><p className="text-sm text-muted-foreground">Aucun club, transfert ou historique d’affiliations dans ce parcours.</p></section>
      </>}
    </div>}</SheetContent></Sheet>
  </div>
}
