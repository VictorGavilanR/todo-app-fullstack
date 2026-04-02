import { useEffect, useState, useRef, KeyboardEvent, TouchEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "../api/api";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface Props {
  setIsAuthenticated: (value: boolean) => void;
}

const appleFont = {
  fontFamily: "-apple-system, 'SF Pro Text', BlinkMacSystemFont, sans-serif",
};

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const SWIPE_THRESHOLD = 60;
  const DELETE_WIDTH = 72;

  const handleStart = (clientX: number) => {
    startX.current = clientX;
    isDragging.current = true;
  };

  const handleMove = (clientX: number) => {
    if (startX.current === null || !isDragging.current) return;
    const diff = startX.current - clientX;
    if (diff < 0) {
      if (isSwiped) setOffset(Math.max(0, DELETE_WIDTH + diff));
      return;
    }
    setOffset(Math.min(diff, DELETE_WIDTH));
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (offset > SWIPE_THRESHOLD) {
      setOffset(DELETE_WIDTH);
      setIsSwiped(true);
    } else {
      setOffset(0);
      setIsSwiped(false);
    }
    startX.current = null;
  };

  const handleClose = () => {
    setOffset(0);
    setIsSwiped(false);
  };

  const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();
  const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
  const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => { if (isDragging.current) handleEnd(); };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative rounded-2xl overflow-hidden select-none"
    >
      {/* Delete button behind */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500 rounded-2xl"
        style={{ width: DELETE_WIDTH }}
      >
        <button
          onClick={() => onDelete(task.id)}
          className="flex flex-col items-center justify-center gap-1 w-full h-full active:opacity-70 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          <span className="text-white text-[11px] font-medium" style={appleFont}>
            Eliminar
          </span>
        </button>
      </div>

      {/* Task card */}
      <div
        className={`flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3.5 border rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${
          task.completed ? "border-gray-100" : "border-white/60"
        }`}
        style={{
          transform: `translateX(-${offset}px)`,
          transition: isDragging.current ? "none" : "transform 0.25s ease",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            if (isSwiped) { handleClose(); return; }
            onToggle(task);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
            task.completed
              ? "bg-blue-500 border-blue-500"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                width="11" height="11" viewBox="0 0 12 12"
                fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"
              >
                <polyline points="2,6 5,9 10,3" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Title */}
        <p
          className={`flex-1 text-[15px] transition-all duration-300 pointer-events-none ${
            task.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
          style={appleFont}
        >
          {task.title}
        </p>

        {/* Swipe hint */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#d1d5db" strokeWidth="1.8" strokeLinecap="round"
          className={`flex-shrink-0 transition-opacity duration-300 pointer-events-none ${isSwiped ? "opacity-0" : "opacity-60"}`}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </div>
    </motion.div>
  );
}

function Tasks({ setIsAuthenticated }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    toast.success("Sesión cerrada");
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await api.get("tasks/");
        setTasks(res.data);
      } catch {
        toast.error("No se pudieron cargar las tareas");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    if (!newTask.trim()) return;
    setIsAdding(true);
    try {
      const res = await api.post("tasks/", { title: newTask });
      setTasks((prev) => [...prev, res.data]);
      setNewTask("");
      toast.success("Tarea agregada");
    } catch {
      toast.error("Error al crear la tarea");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      const res = await api.patch(`tasks/${task.id}/`, {
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
      toast.success(res.data.completed ? "¡Tarea completada! 🎉" : "Tarea reabierta");
    } catch {
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`tasks/${id}/`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tarea eliminada");
    } catch {
      toast.error("Error al eliminar la tarea");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreateTask();
  };

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const doneCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #e0eaff 0%, #f5f5f7 40%, #fce4ec 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg flex flex-col gap-5 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-[28px] font-semibold tracking-tight text-gray-900"
              style={{ fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif" }}
            >
              Mis Tareas
            </h1>
            <p className="text-[14px] text-gray-500 mt-0.5" style={appleFont}>
              {doneCount} de {totalCount} completadas
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-red-400 transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-red-50/80"
            style={appleFont}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </motion.button>
        </div>

        {/* Progress bar */}
        <AnimatePresence>
          {totalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0.95 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="flex flex-col gap-1.5"
            >
              <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <p className="text-[12px] text-gray-400 text-right" style={appleFont}>
                {progress}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nueva tarea..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-[48px] rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 px-4 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
            style={appleFont}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleCreateTask}
            disabled={isAdding || !newTask.trim()}
            className="h-[48px] w-[48px] rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white transition-colors duration-150 flex items-center justify-center shadow-sm flex-shrink-0"
          >
            {isAdding ? (
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
              </motion.svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Filter tabs */}
        <AnimatePresence>
          {totalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-white/60"
            >
              {(["all", "pending", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 h-8 rounded-lg text-[13px] font-medium transition-all duration-200 relative ${
                    filter === f ? "text-gray-800" : "text-gray-400 hover:text-gray-600"
                  }`}
                  style={appleFont}
                >
                  {filter === f && (
                    <motion.div
                      layoutId="filterPill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Completadas"}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks list */}
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-center justify-center py-16 gap-3 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center border border-white/60">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round">
                    <rect x="3" y="5" width="18" height="15" rx="3" />
                    <path d="M8 5V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                  </svg>
                </div>
                <p className="text-[14px] text-gray-400" style={appleFont}>
                  {filter === "done"
                    ? "Aún no has completado ninguna tarea"
                    : filter === "pending"
                      ? "¡Todo listo! No hay tareas pendientes"
                      : "Agrega tu primera tarea"}
                </p>
              </motion.div>
            ) : (
              filtered.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-[12px] text-gray-400/70" style={appleFont}>
            Desliza hacia la izquierda para eliminar
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default Tasks;