import React from 'react'
import { DropsetRoutine } from '@/types/types'
import { ExerciseItem } from './ExerciseItem'

interface RoutineListProps {
  routines: DropsetRoutine[]
  onSave: (routine: DropsetRoutine, reps: number, note: string) => Promise<{ success: boolean; message: string | null; error?: string }>
}

export const RoutineList: React.FC<RoutineListProps> = ({ routines, onSave }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {routines.map((routine) => (
        <ExerciseItem key={routine.id} routine={routine} onSave={onSave} />
      ))}
    </div>
  )
}
