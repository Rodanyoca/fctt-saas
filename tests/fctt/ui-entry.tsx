import React from 'react'
import { createRoot } from 'react-dom/client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Header } from '@/components/dashboard/header'
import { PlayersClient } from '@/components/fctt/players-client'
import type { Player } from '@/lib/fctt/players-domain'
const simulated: Player[] = Array.from({ length: 26 }, (_, i) => ({ id: `TTB-ATH-${String(i + 1).padStart(6, '0')}`, name: `Joueur Test ${String(i + 1).padStart(2, '0')}`, ittf: i === 0 ? 'ITTF-TEST' : '', sex: i % 2 ? 'FEMININ' : 'MASCULIN', nationality: 'RDC', affiliation: i === 0 ? '' : '2026-01-02', status: i === 0 ? '' : 'ACTIF' }))
const root = createRoot(document.getElementById('root')!)
function render(mode: 'empty' | 'simulated') {
  root.render(<DashboardLayout><Header title="Joueurs" subtitle="Contrôle UI isolé FCTT" /><div className="space-y-5 p-4 sm:p-6"><PlayersClient key={mode} players={mode === 'empty' ? [] : simulated} /></div></DashboardLayout>)
}
Object.assign(window, { fcttRender: render })
render('empty')
