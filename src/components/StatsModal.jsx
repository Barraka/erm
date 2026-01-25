import { useState, useEffect } from "react";
import { X, Trophy, Skull, Clock, Lightbulb, BarChart3, Calendar, ChevronDown, MessageSquare } from "lucide-react";
import { getAllSessions } from "../utils/soundEffectsDB";
import { useToast } from "./ToastProvider";

export default function StatsModal({ onClose }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "victory", "defeat"
  const [expandedComments, setExpandedComments] = useState(new Set());
  const { showToast } = useToast();

  const toggleCommentExpanded = (sessionId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      // Sort by date descending (newest first)
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      showToast("Erreur lors du chargement de l'historique.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const victories = sessions.filter(s => s.result === "victory").length;
  const defeats = sessions.filter(s => s.result === "defeat").length;
  const winRate = totalSessions > 0 ? Math.round((victories / totalSessions) * 100) : 0;

  const completedSessions = sessions.filter(s => s.roomDuration && s.timeRemaining !== undefined);
  const avgTimeUsed = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.roomDuration - s.timeRemaining), 0) / completedSessions.length)
    : 0;

  const avgHints = totalSessions > 0
    ? (sessions.reduce((sum, s) => sum + (s.hintsGiven || 0), 0) / totalSessions).toFixed(1)
    : 0;

  // Filter sessions
  const filteredSessions = filter === "all"
    ? sessions
    : sessions.filter(s => s.result === filter);

  // Format time from seconds to MM:SS
  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Format date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-40"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex flex-col w-[85vw] max-w-4xl h-[80vh] rounded-2xl overflow-hidden fade-in"
        style={{
          backgroundColor: "var(--color-bg-primary)",
          border: "1px solid var(--color-border-light)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            borderBottom: "1px solid var(--color-border-light)",
          }}
        >
          <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Statistiques
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: "var(--color-bg-tertiary)",
              color: "var(--color-text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-danger)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Summary */}
          <section
            className="rounded-xl p-5"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <BarChart3 size={20} style={{ color: "var(--color-accent-primary)" }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Résumé
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Sessions */}
              <div
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <div className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {totalSessions}
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Sessions
                </div>
              </div>

              {/* Win Rate */}
              <div
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <div className="text-2xl font-bold" style={{ color: "var(--color-success)" }}>
                  {winRate}%
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Victoires
                </div>
              </div>

              {/* Avg Time */}
              <div
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <div className="text-2xl font-bold" style={{ color: "var(--color-accent-primary)" }}>
                  {formatTime(avgTimeUsed)}
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Temps moyen
                </div>
              </div>

              {/* Avg Hints */}
              <div
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "var(--color-bg-tertiary)" }}
              >
                <div className="text-2xl font-bold" style={{ color: "var(--color-warning)" }}>
                  {avgHints}
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Indices / session
                </div>
              </div>
            </div>
          </section>

          {/* Session History */}
          <section
            className="rounded-xl p-5"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "var(--color-bg-tertiary)" }}
                >
                  <Calendar size={20} style={{ color: "var(--color-warning)" }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Historique
                </h3>
              </div>

              {/* Filter buttons */}
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Tout" },
                  { value: "victory", label: "Victoires" },
                  { value: "defeat", label: "Défaites" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: filter === value
                        ? "var(--color-accent-primary)"
                        : "var(--color-bg-tertiary)",
                      color: filter === value ? "white" : "var(--color-text-secondary)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div
                className="text-center py-8"
                style={{ color: "var(--color-text-muted)" }}
              >
                Chargement...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div
                className="text-center py-8 rounded-lg"
                style={{
                  backgroundColor: "var(--color-bg-tertiary)",
                  color: "var(--color-text-muted)",
                }}
              >
                {filter === "all"
                  ? "Aucune session enregistrée."
                  : `Aucune ${filter === "victory" ? "victoire" : "défaite"} enregistrée.`}
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredSessions.map((session) => {
                  const timeUsed = session.roomDuration - session.timeRemaining;
                  const isVictory = session.result === "victory";

                  return (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor: "var(--color-bg-tertiary)",
                        border: `1px solid ${isVictory ? "var(--color-success)" : "var(--color-danger)"}20`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Result Icon */}
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: isVictory
                              ? "rgba(34, 197, 94, 0.2)"
                              : "rgba(239, 68, 68, 0.2)",
                          }}
                        >
                          {isVictory ? (
                            <Trophy size={18} style={{ color: "var(--color-success)" }} />
                          ) : (
                            <Skull size={18} style={{ color: "var(--color-danger)" }} />
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {formatDate(session.date)}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {isVictory ? "Victoire" : "Défaite"}
                          </div>
                        </div>

                        {/* Time Used */}
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} style={{ color: "var(--color-text-muted)" }} />
                          <span
                            className="text-sm tabular-nums"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {formatTime(timeUsed)}
                          </span>
                        </div>

                        {/* Hints */}
                        <div className="flex items-center gap-1.5">
                          <Lightbulb size={14} style={{ color: "var(--color-warning)" }} />
                          <span
                            className="text-sm tabular-nums"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {session.hintsGiven || 0}
                          </span>
                        </div>
                      </div>

                      {/* Comments */}
                      {session.comments && (
                        <div
                          className="mt-2 pt-2"
                          style={{
                            borderTop: "1px solid var(--color-border-light)",
                          }}
                        >
                          <button
                            onClick={() => toggleCommentExpanded(session.id)}
                            className="flex items-center gap-1.5 text-xs font-medium mb-1 transition-all duration-200"
                            style={{ color: "var(--color-text-muted)" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "var(--color-accent-primary)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "var(--color-text-muted)";
                            }}
                          >
                            <MessageSquare size={12} />
                            Commentaire :
                            <ChevronDown
                              size={14}
                              className="transition-transform duration-200"
                              style={{
                                transform: expandedComments.has(session.id) ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            />
                          </button>
                          <div
                            className="text-sm whitespace-pre-wrap"
                            style={{
                              color: "var(--color-text-secondary)",
                              display: expandedComments.has(session.id) ? "block" : "-webkit-box",
                              WebkitLineClamp: expandedComments.has(session.id) ? "unset" : 1,
                              WebkitBoxOrient: "vertical",
                              overflow: expandedComments.has(session.id) ? "visible" : "hidden",
                            }}
                          >
                            {session.comments}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            borderTop: "1px solid var(--color-border-light)",
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-primary px-6 py-2.5 text-base font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
