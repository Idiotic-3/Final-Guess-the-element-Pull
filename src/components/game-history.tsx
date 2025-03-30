import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { type GameHistory as GameHistoryType, supabase } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function GameHistory() {
  const { session } = useAuth()
  const [history, setHistory] = useState<GameHistoryType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('game_history')
        .select('*')
        .eq('user_id', session.user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setHistory(data)
    } catch (error) {
      console.error('Error fetching game history:', error)
    } finally {
      setLoading(false)
    }
  }, [session.user?.id])

  useEffect(() => {
    if (session.user) {
      fetchHistory()
    }
  }, [session.user, fetchHistory])

  if (loading) {
    return <div>Loading history...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Games</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  {new Date(game.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{game.score}</TableCell>
                <TableCell>{game.total_questions}</TableCell>
                <TableCell>
                  {Math.round((game.score / game.total_questions) * 100)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
