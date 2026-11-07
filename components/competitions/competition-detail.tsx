"use client"
import { useCallback, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Competition, CompetitionClassement, CompetitionParticipant, CompetitionResult, CompetitionUnite } from "@/lib/types"
import {
  ArrowLeft,
  ClipboardList,
  ListOrdered,
  Shield,
  UserRound,
} from "lucide-react"
import { formatSheetDate } from "@/lib/date-utils"

function formatDate(value: string) {
  return formatSheetDate(value)
}

function isIndoor(discipline: string) {
  return discipline.trim().toUpperCase() === "INDOOR"
}

function getStatusClass(statut: string) {
  const value = statut.trim().toLowerCase()
  if (value === "qualifie" || value === "gagne" || value === "vainqueur" || value === "actif") {
    return "bg-success/10 text-success hover:bg-success/15"
  }
  if (value === "perdu" || value === "elimine" || value === "forfait") {
    return "bg-destructive/10 text-destructive hover:bg-destructive/15"
  }
  return "bg-muted text-muted-foreground hover:bg-muted"
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 min-w-0 break-words font-medium leading-relaxed text-foreground">
        {value || "Non renseigné"}
      </p>
    </div>
  )
}

function EmptyTableRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  )
}

type WinnerSide = "A" | "B" | null

type RankingRow = {
  id: string
  participant: string
  poule: string
  played: number
  won: number
  lost: number
  setsFor: number
  setsAgainst: number
  pointsFor: number
  pointsAgainst: number
  pointsClassement: number
}

type SheetRankingRow = {
  id: string
  participant: string
  played: number
  won: number
  lost: number
  pointsClassement: number
}

function withAutoRanks<T extends { pointsClassement: number; participant: string }>(rows: T[]) {
  const sortedRows = [...rows].sort((a, b) => {
    if (b.pointsClassement !== a.pointsClassement) return b.pointsClassement - a.pointsClassement
    return a.participant.localeCompare(b.participant)
  })

  return sortedRows.map((row, index) => {
    const previous = sortedRows[index - 1]
    const rank =
      previous && previous.pointsClassement === row.pointsClassement
        ? sortedRows
            .slice(0, index)
            .findIndex((item) => item.pointsClassement === row.pointsClassement) + 1
        : index + 1

    return { ...row, rank }
  })
}

const setKeys = [
  ["set1A", "set1B"],
  ["set2A", "set2B"],
  ["set3A", "set3B"],
  ["set4A", "set4B"],
  ["set5A", "set5B"],
] as const

function normalizeValue(value: string) {
  return value.trim().toLowerCase()
}

function getParticipantLabel(participant: CompetitionParticipant) {
  return (
    participant.nomClub ||
    participant.nomAthlete ||
    participant.idParticipation ||
    "-"
  )
}

function getScorePart(scoreGlobal: string, index: number) {
  return scoreGlobal.split("-")[index]?.trim() || "-"
}

function getUnitSetDetails(result: CompetitionResult, side: "A" | "B") {
  return setKeys
    .map(([keyA, keyB]) => {
      const score = side === "A" ? result[keyA] : result[keyB]
      if (score === null) return null
      return String(score)
    })
    .filter(Boolean)
}

function getSetStats(result: CompetitionResult) {
  return setKeys.reduce(
    (stats, [keyA, keyB]) => {
      const a = result[keyA]
      const b = result[keyB]
      if (a === null || b === null) return stats

      stats.pointsA += a
      stats.pointsB += b

      if (a > b) {
        stats.setsA += 1
      } else if (b > a) {
        stats.setsB += 1
      }

      return stats
    },
    { setsA: 0, setsB: 0, pointsA: 0, pointsB: 0 },
  )
}

function getWinnerSide(result: CompetitionResult): WinnerSide {
  const vainqueur = normalizeValue(result.idUniteVainqueur)
  if (vainqueur) {
    if (
      vainqueur === normalizeValue(result.idUniteA) ||
      vainqueur === normalizeValue(result.nomUniteA)
    ) {
      return "A"
    }

    if (
      vainqueur === normalizeValue(result.idUniteB) ||
      vainqueur === normalizeValue(result.nomUniteB)
    ) {
      return "B"
    }
  }

  const stats = getSetStats(result)
  if (stats.setsA > stats.setsB) return "A"
  if (stats.setsB > stats.setsA) return "B"

  return null
}

function isWinningUnit(result: CompetitionResult, side: WinnerSide) {
  return getWinnerSide(result) === side
}

function buildRanking(
  unites: CompetitionUnite[],
  results: CompetitionResult[],
): RankingRow[] {
  const rows = new Map<string, RankingRow>()

  const ensureRow = (id: string, participant: string, poule: string) => {
    const rowId = id || participant
    if (!rowId) return null

    const existing = rows.get(rowId)
    if (existing) {
      if (!existing.participant && participant) existing.participant = participant
      if (!existing.poule && poule) existing.poule = poule
      return existing
    }

    const row: RankingRow = {
      id: rowId,
      participant: participant || rowId,
      poule,
      played: 0,
      won: 0,
      lost: 0,
      setsFor: 0,
      setsAgainst: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointsClassement: 0,
    }

    rows.set(rowId, row)
    return row
  }

  unites.forEach((unite) => {
    ensureRow(unite.idUnite, unite.nomUnite, unite.poule)
  })

  results.forEach((result) => {
    const rowA = ensureRow(result.idUniteA, result.nomUniteA, result.poule)
    const rowB = ensureRow(result.idUniteB, result.nomUniteB, result.poule)
    if (!rowA || !rowB) return

    const winner = getWinnerSide(result)
    const stats = getSetStats(result)
    const pointsA = result.totalPointA ?? stats.pointsA
    const pointsB = result.totalPointB ?? stats.pointsB

    rowA.setsFor += stats.setsA
    rowA.setsAgainst += stats.setsB
    rowA.pointsFor += pointsA
    rowA.pointsAgainst += pointsB

    rowB.setsFor += stats.setsB
    rowB.setsAgainst += stats.setsA
    rowB.pointsFor += pointsB
    rowB.pointsAgainst += pointsA

    if (!winner) return

    rowA.played += 1
    rowB.played += 1

    if (winner === "A") {
      const closeMatch = stats.setsB > 0 && stats.setsA - stats.setsB === 1
      rowA.won += 1
      rowB.lost += 1
      rowA.pointsClassement += result.pointsClassementA ?? (closeMatch ? 2 : 3)
      rowB.pointsClassement += result.pointsClassementB ?? (closeMatch ? 1 : 0)
    } else {
      const closeMatch = stats.setsA > 0 && stats.setsB - stats.setsA === 1
      rowB.won += 1
      rowA.lost += 1
      rowB.pointsClassement += result.pointsClassementB ?? (closeMatch ? 2 : 3)
      rowA.pointsClassement += result.pointsClassementA ?? (closeMatch ? 1 : 0)
    }
  })

  return Array.from(rows.values()).sort((a, b) => {
    const pouleOrder = a.poule.localeCompare(b.poule)
    if (pouleOrder !== 0) return pouleOrder
    if (b.pointsClassement !== a.pointsClassement) return b.pointsClassement - a.pointsClassement
    if (b.won !== a.won) return b.won - a.won
    if (b.setsFor - b.setsAgainst !== a.setsFor - a.setsAgainst) {
      return b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst)
    }
    if (b.pointsFor - b.pointsAgainst !== a.pointsFor - a.pointsAgainst) {
      return b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst)
    }
    return a.participant.localeCompare(b.participant)
  })
}

export function CompetitionDetail({
  competition,
  participants,
  unites,
  results,
  classements,
  onBack,
}: {
  competition: Competition
  participants: CompetitionParticipant[]
  unites: CompetitionUnite[]
  results: CompetitionResult[]
  classements: CompetitionClassement[]
  onBack: () => void
}) {
  const [rankingPoule, setRankingPoule] = useState("all")
  const [rankingPhase, setRankingPhase] = useState("all")
  const indoor = isIndoor(competition.nomDiscipline)
  const competitionParticipants = participants.filter(
    (participant) => participant.idCompetition === competition.idCompetition,
  )
  const competitionUnites = unites.filter((unite) => unite.idCompetition === competition.idCompetition)
  const competitionResults = results
    .filter((result) => result.idCompetition === competition.idCompetition)
    .sort((a, b) => {
      const dateA = new Date(a.dateMatch).getTime()
      const dateB = new Date(b.dateMatch).getTime()
      if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
        return a.idResultat.localeCompare(b.idResultat)
      }
      return dateA - dateB
    })
  const isSameCompetitionClassement = useCallback(
    (row: CompetitionClassement) =>
      row.idCompetition === competition.idCompetition ||
      (!!row.nomCompetition && row.nomCompetition === competition.nomCompetition),
    [competition.idCompetition, competition.nomCompetition],
  )

  const rankingPoules = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...competitionUnites.map((unite) => unite.poule),
            ...competitionResults.map((result) => result.poule),
            ...classements.filter(isSameCompetitionClassement).map((row) => row.poule),
          ]
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [classements, competitionResults, competitionUnites, isSameCompetitionClassement],
  )
  const rankingPhases = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...competitionResults.map((result) => (result.classementPoule || result.phase).trim()),
            ...classements
              .filter(isSameCompetitionClassement)
              .map((row) => row.phase.trim()),
          ].filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [classements, competitionResults, isSameCompetitionClassement],
  )
  const rankingResults = competitionResults.filter((result) => {
    if (rankingPoule !== "all" && result.poule !== rankingPoule) return false
    if (rankingPhase !== "all" && (result.classementPoule || result.phase) !== rankingPhase) return false
    return true
  })
  const rankingResultUnitIds = new Set(
    rankingResults.flatMap((result) => [result.idUniteA, result.idUniteB]).filter(Boolean),
  )
  const rankingUnites = competitionUnites.filter((unite) => {
    if (rankingPoule !== "all" && unite.poule !== rankingPoule) return false
    if (rankingPhase !== "all" && !rankingResultUnitIds.has(unite.idUnite)) return false
    return true
  })
  const ranking = buildRanking(rankingUnites, rankingResults)
  const sheetRankingRows = classements
    .filter((row) => {
      if (!isSameCompetitionClassement(row)) return false
      if (rankingPoule !== "all" && row.poule !== rankingPoule) return false
      if (rankingPhase !== "all" && row.phase !== rankingPhase) return false
      return true
    })
  const sheetRanking = Array.from(
    sheetRankingRows
      .reduce((rows, row) => {
        const key = row.idUnite || row.nomUnite
        if (!key) return rows

        const existing = rows.get(key)
        if (existing) {
          existing.played = Math.max(existing.played, row.matchJoue ?? 0)
          existing.won = Math.max(existing.won, row.matchGagne ?? 0)
          existing.lost = Math.max(existing.lost, row.matchPerdu ?? 0)
          existing.pointsClassement = Math.max(existing.pointsClassement, row.pointsClassement ?? 0)
          if (!existing.participant && row.nomUnite) existing.participant = row.nomUnite
          return rows
        }

        rows.set(key, {
          id: key,
          participant: row.nomUnite || key,
          played: row.matchJoue ?? 0,
          won: row.matchGagne ?? 0,
          lost: row.matchPerdu ?? 0,
          pointsClassement: row.pointsClassement ?? 0,
        })

        return rows
      }, new Map<string, SheetRankingRow>())
      .values(),
  )
  const rankedSheetRanking = withAutoRanks(sheetRanking)
  const rankedFallbackRanking = withAutoRanks(ranking)
  const unitLabel = indoor ? "Clubs engages" : "Paires engagees"
  const unitCount = competitionUnites.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="size-4" /> Retour aux compétitions
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{competition.nomCompetition}</h1>
            <p className="text-muted-foreground">Détails de la compétition</p>
          </div>
        </div>
        <Badge variant="outline">{competition.nomDiscipline}</Badge>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="h-1.5 bg-primary" />
        <CardContent className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Informations générales</h2>
              <p className="text-sm text-muted-foreground">Identité, organisation et calendrier</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{unitCount}</p>
              <p className="text-xs text-muted-foreground">{unitLabel}</p>
            </div>
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-3">
            {[
              {
                title: "Compétition",
                fields: [
                  ["Type", competition.typeCompetition],
                  ["Format", competition.formatCompetition],
                  ["Discipline", competition.nomDiscipline],
                  ["Saison", competition.saison],
                ],
              },
              {
                title: "Organisation",
                fields: [
                  ["Niveau", competition.niveau],
                  ["Lieu", competition.lieu],
                  ["Structure organisatrice", competition.nomStructureOrganisatrice],
                  ["Statut", competition.statutCompetition],
                ],
              },
              {
                title: "Calendrier",
                fields: [
                  ["Date de début", formatDate(competition.dateDebut)],
                  ["Date de fin", formatDate(competition.dateFin)],
                  ["Observation", competition.observation],
                ],
              },
            ].map((section) => (
              <section key={section.title} className="overflow-hidden rounded-xl border bg-muted/10">
                <div className="border-b bg-muted/30 px-5 py-3">
                  <h3 className="text-sm font-semibold">{section.title}</h3>
                </div>
                <div className="divide-y px-5">
                  {section.fields.map(([label, value]) => (
                    <InfoField key={label} label={label} value={value} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="participation" className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="participation" className="justify-center text-center">
            Participants
          </TabsTrigger>
          <TabsTrigger value="unites" className="justify-center text-center">
            Unités
          </TabsTrigger>
          <TabsTrigger value="resultats" className="justify-center text-center">
            Résultats
          </TabsTrigger>
          <TabsTrigger value="classement" className="justify-center text-center">
            Classement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participation">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {indoor ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <UserRound className="h-5 w-5 text-primary" />
                )}
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Sexe</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead>Unité</TableHead>
                      <TableHead>Maillot</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitionParticipants.length === 0 ? (
                      <EmptyTableRow colSpan={7} label="Aucun participant disponible." />
                    ) : (
                      competitionParticipants.map((participant, index) => (
                        <TableRow key={`${participant.idParticipation || "participant"}-${participant.idAthlete || participant.nomClub || "sans-id"}-${index}`}>
                          <TableCell className="font-medium">
                            {participant.nomAthlete || getParticipantLabel(participant)}
                          </TableCell>
                          <TableCell>{participant.sexe || "-"}</TableCell>
                          <TableCell>{participant.nomPoste || "-"}</TableCell>
                          <TableCell>{participant.nomClub || "-"}</TableCell>
                          <TableCell>{participant.nomUnite || "-"}</TableCell>
                          <TableCell>{participant.numeroMaillot || "-"}</TableCell>
                          <TableCell>
                            {participant.statutParticipation ? (
                              <Badge className={getStatusClass(participant.statutParticipation)}>
                                {participant.statutParticipation}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="unites">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Unités engagées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unité</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Club</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Poule</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitionUnites.length === 0 ? (
                        <EmptyTableRow colSpan={6} label="Aucune unité disponible." />
                      ) : (
                        competitionUnites.map((unite, index) => (
                          <TableRow key={`${unite.idUnite || "unite"}-${index}`}>
                            <TableCell className="font-medium">{unite.nomUnite || "-"}</TableCell>
                            <TableCell>{unite.typeUnite || "-"}</TableCell>
                            <TableCell>{unite.nomClub || "-"}</TableCell>
                            <TableCell>{unite.version || "-"}</TableCell>
                            <TableCell>{unite.poule || "-"}</TableCell>
                            <TableCell>
                              {unite.statutUnite ? (
                                <Badge className={getStatusClass(unite.statutUnite)}>{unite.statutUnite}</Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="resultats">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Résultats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {competitionResults.length === 0 ? (
                <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">
                  Aucun resultat disponible.
                </div>
              ) : (
                <div className="space-y-2">
                  {competitionResults.map((result, index) => (
                    <div
                      key={`${result.idResultat || "resultat"}-${result.idUniteA || "a"}-${result.idUniteB || "b"}-${index}`}
                      className="grid gap-3 rounded-md border px-3 py-2.5 md:grid-cols-[minmax(7rem,0.75fr)_minmax(0,1.45fr)_minmax(12rem,0.8fr)] md:items-center"
                    >
                      <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground md:block md:space-y-0.5">
                        <p>{formatDate(result.dateMatch)}</p>
                        <p>{result.classementPoule || result.phase || "-"} / Poule {result.poule || "-"}</p>
                      </div>
                      <div className="min-w-0 space-y-1.5 md:col-span-2">
                        <div
                          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-2 py-1 md:grid-cols-[minmax(0,1.45fr)_minmax(12rem,0.8fr)] ${
                            isWinningUnit(result, "A") ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <span
                              className={`block truncate whitespace-nowrap text-sm ${
                                isWinningUnit(result, "A") ? "font-semibold text-foreground" : "font-medium"
                              }`}
                            >
                              {result.nomUniteA || result.idUniteA || "-"}
                            </span>
                          </div>
                          <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-2">
                            <span
                              className={`text-right font-mono text-2xl leading-none ${
                                isWinningUnit(result, "A") ? "font-bold text-primary" : "font-semibold"
                              }`}
                            >
                              {getScorePart(result.scoreGlobal, 0)}
                            </span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              {getUnitSetDetails(result, "A").map((detail, index) => (
                                <span
                                  key={`${detail}-${index}`}
                                  className="font-mono text-[11px] text-muted-foreground"
                                >
                                  {detail}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-2 py-1 md:grid-cols-[minmax(0,1.45fr)_minmax(12rem,0.8fr)] ${
                            isWinningUnit(result, "B") ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <span
                              className={`block truncate whitespace-nowrap text-sm ${
                                isWinningUnit(result, "B") ? "font-semibold text-foreground" : "font-medium"
                              }`}
                            >
                              {result.nomUniteB || result.idUniteB || "-"}
                            </span>
                          </div>
                          <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-2">
                            <span
                              className={`text-right font-mono text-2xl leading-none ${
                                isWinningUnit(result, "B") ? "font-bold text-primary" : "font-semibold"
                              }`}
                            >
                              {getScorePart(result.scoreGlobal, 1)}
                            </span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              {getUnitSetDetails(result, "B").map((detail, index) => (
                                <span
                                  key={`${detail}-${index}`}
                                  className="font-mono text-[11px] text-muted-foreground"
                                >
                                  {detail}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classement">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  Classement
                </CardTitle>

                <div className="grid grid-cols-2 gap-3 lg:w-[22rem]">
                  <Select value={rankingPoule} onValueChange={setRankingPoule}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Poule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les poules</SelectItem>
                      {rankingPoules.map((poule) => (
                        <SelectItem key={poule} value={poule}>
                          {poule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={rankingPhase} onValueChange={setRankingPhase}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les phases</SelectItem>
                      {rankingPhases.map((phase) => (
                        <SelectItem key={phase} value={phase}>
                          {phase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[72px] text-center">Rang</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead className="text-center">Match joue</TableHead>
                      <TableHead className="text-center">Match gagne</TableHead>
                      <TableHead className="text-center">Match perdu</TableHead>
                      <TableHead className="text-center">Total point</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankedSheetRanking.length > 0 ? (
                      rankedSheetRanking.map((row, index) => (
                        <TableRow key={`${row.id || "classement"}-${index}`}>
                          <TableCell className="text-center font-mono text-muted-foreground">
                            {row.rank}
                          </TableCell>
                          <TableCell className="font-medium">{row.participant}</TableCell>
                          <TableCell className="text-center">{row.played}</TableCell>
                          <TableCell className="text-center">{row.won}</TableCell>
                          <TableCell className="text-center">{row.lost}</TableCell>
                          <TableCell className="text-center">{row.pointsClassement}</TableCell>
                        </TableRow>
                      ))
                    ) : rankedFallbackRanking.length === 0 ? (
                      <EmptyTableRow colSpan={6} label="Aucun classement disponible." />
                    ) : (
                      rankedFallbackRanking.map((row, index) => (
                        <TableRow key={`${row.id || "ranking"}-${row.participant || "sans-participant"}-${index}`}>
                          <TableCell className="text-center font-mono text-muted-foreground">
                            {row.rank}
                          </TableCell>
                          <TableCell className="font-medium">{row.participant}</TableCell>
                          <TableCell className="text-center">{row.played}</TableCell>
                          <TableCell className="text-center">{row.won}</TableCell>
                          <TableCell className="text-center">{row.lost}</TableCell>
                          <TableCell className="text-center">{row.pointsClassement}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}
