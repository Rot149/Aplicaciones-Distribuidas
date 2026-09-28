import { useState, useEffect } from 'react';
import { Tarea } from '../types';

const STORAGE_KEY = 'tareas_app';
const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=10';

export const useTareas = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevaTarea, setNuevaTarea] = useState('');

  // Carga inicial: primero localStorage, luego API si no hay datos
  useEffect(() => {
    const cargarTareas = async () => {
      try {
        const guardadas = localStorage.getItem(STORAGE_KEY);
        if (guardadas) {
          setTareas(JSON.parse(guardadas));
          setCargando(false);
          return;
        }

        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al cargar tareas desde la API');
        const data = await res.json();
        const tareasApi: Tarea[] = data.map((item: { id: number; title: string; completed: boolean }) => ({
          id: item.id,
          texto: item.title,
          completada: item.completed,
        }));
        setTareas(tareasApi);
      } catch (err: unknown) {
        const mensaje = err instanceof Error ? err.message : 'Error desconocido';
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarTareas();
  }, []);

  // Persistir en localStorage cuando las tareas cambien (solo si ya cargó)
  useEffect(() => {
    if (!cargando) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
    }
  }, [tareas, cargando]);

  // Agregar tarea con validación
  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;
    const nueva: Tarea = {
      id: Date.now(),
      texto: nuevaTarea.trim(),
      completada: false,
    };
    setTareas(prev => [...prev, nueva]);
    setNuevaTarea('');
  };

  // Alternar completada/pendiente
  const toggleTarea = (id: number) => {
    setTareas(prev =>
      prev.map(t => t.id === id ? { ...t, completada: !t.completada } : t)
    );
  };

  // Eliminar tarea por id
  const eliminarTarea = (id: number) => {
    setTareas(prev => prev.filter(t => t.id !== id));
  };

  return {
    tareas,
    cargando,
    error,
    nuevaTarea,
    setNuevaTarea,
    agregarTarea,
    toggleTarea,
    eliminarTarea,
  };
};
