import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { subscribeToTasks } from '../services/firestoreService'
import type { Task } from '../types'

/**
 * Hook que expone las tareas del usuario en tiempo real.
 * Empieza en loading=true para poder mostrar skeletons mientras llega
 * el primer snapshot.
 */
export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sin usuario no hay nada a qué suscribirse (ej: durante el logout).
    // El reset de tasks/loading para ese caso se resuelve al derivar el
    // valor de retorno más abajo, sin necesidad de un setState acá.
    if (!userId) return

    // Resetea loading al iniciar cada suscripción (userId nuevo). Es el mismo
    // patrón que documenta React para efectos de fetching (ver "You Might Not
    // Need an Effect"): la regla set-state-in-effect lo marca por defecto,
    // pero acá es intencional y no genera un loop de renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const unsubscribe = subscribeToTasks(
      userId,
      (nextTasks) => {
        setTasks(nextTasks)
        setLoading(false)
      },
      (error) => {
        console.error('Error al cargar tareas:', error)
        toast.error('No se pudieron cargar las tareas.')
        setLoading(false)
      },
    )

    // Cancela la suscripción al desmontar o al cambiar el userId.
    return unsubscribe
  }, [userId])

  return {
    tasks: userId ? tasks : [],
    loading: userId ? loading : false,
  }
}
