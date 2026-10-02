// Dashboard — lists the logged-in user's projects and the "new project" prompt box.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dashboardPageStyles as s } from "../assets/dummyStyles";
import { Card, ProjectThumbnail } from "../assets/ui";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ActivityGraphSkeleton, ProjectGridSkeleton } from "../components/Skeletons";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../queryKeys";
import type {
  CreateProjectRequest,
  Project,
  ProjectFramework,
  ProjectUpdate,
} from "../types";
import {
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  apiError,
  apiStatus,
  getContributions,
  getProjects,
  updateProject,
} from "../utils/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<ProjectFramework>("html");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const autoCreatedRef = useRef(false);
  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getProjects,
    enabled: Boolean(user),
  });
  const projects = projectsQuery.data?.projects ?? [];
  const createMutation = useMutation({
    mutationFn: apiCreateProject,
    onSuccess: ({ project }) => navigate(`/projects/${project.id}`),
    onError: (err) => {
      setError(apiError(err));
      if (apiStatus(err) === 402) navigate("/pricing");
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) =>
      updateProject(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    onError: (err) => setError(apiError(err)),
  });
  const deleteMutation = useMutation({
    mutationFn: apiDeleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    onError: (err) => setError(apiError(err)),
  });

  // Creates a new project then opens it; sends the user to pricing if out of credits.
  function createProject(body: CreateProjectRequest) {
    setError("");
    createMutation.mutate(body);
  }

  // Flips a project between published and draft, then reloads the list.
  function togglePublish(p: Project) {
    updateMutation.mutate({ id: p.id, data: { published: !p.published } });
  }

  // Deletes a project by id, then reloads the list.
  function deleteProject(id: string) {
    deleteMutation.mutate(id);
  }

  // Starts creating a project from the typed prompt (ignores empty input).
  function handleCreate() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    createProject({ prompt: trimmed, framework });
  }

  // Scrolls to the prompt box, briefly highlights it, and focuses the input.
  function handleFocusPrompt() {
    const input = document.querySelector<HTMLElement>("[data-prompt-input]");
    if (!input) return;
    const card = input.closest("section") || input;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    const pulseClasses = ["ring-4", "ring-orange-400/45", "transition-shadow"];
    card.classList.add(...pulseClasses);
    setTimeout(() => {
      input.focus({ preventScroll: true });
    }, 380);
    setTimeout(() => {
      card.classList.remove(...pulseClasses);
    }, 1400);
  }

  // Auto-create project if redirected from Hero with a prompt query param.
  useEffect(() => {
    const incomingPrompt = searchParams.get("prompt");
    if (
      incomingPrompt &&
      !autoCreatedRef.current &&
      !createMutation.isPending &&
      (user?.credits ?? 0) >= 5
    ) {
      autoCreatedRef.current = true;
      setSearchParams({}, { replace: true });
      createProject({ prompt: incomingPrompt, framework });
    }
  }, [searchParams, createMutation.isPending, user?.credits]); // eslint-disable-line

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className={s.container}>
      <Navbar />
      <main className={s.main}>
        <div className={s.inner}>
          <PromptBox
            prompt={prompt}
            setPrompt={setPrompt}
            framework={framework}
            setFramework={setFramework}
            onSubmit={handleCreate}
            onTopUp={() => navigate("/pricing")}
            loading={createMutation.isPending}
            credits={user?.credits ?? 0}
            error={error}
            firstName={user?.name?.split(" ")[0] || "there"}
          />

          <div className="mt-8">
            <ContributionGraph />
          </div>

          <div className={s.listHeader}>
            <h2 className={s.listTitle}>My projects</h2>
            <div className={s.listControls}>
              <div className={s.searchBox}>
                <Search className={s.searchIcon} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className={s.searchInput}
                />
              </div>
              <button
                onClick={handleFocusPrompt}
                className={s.createButton}
              >
                <Plus className={s.iconSm} />{" "}
                <span className={s.createButtonTextHidden}>Create new</span>
                <span className={s.createButtonTextMobile}>New</span>
              </button>
            </div>
          </div>

          {projectsQuery.isPending ? (
            <ProjectGridSkeleton />
          ) : projectsQuery.isError ? (
            <Card className={`${s.cardMessage} ${s.errorText}`}>
              Couldn't load projects: {apiError(projectsQuery.error)}
            </Card>
          ) : projects.length === 0 ? (
            <Card className={`${s.cardMessage} ${s.emptyText}`}>
              No projects yet. Use the prompt above to create your first one.
            </Card>
          ) : (
            <div className={s.grid}>
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpen={() => navigate(`/projects/${p.id}`)}
                  onPreview={() =>
                    window.open(`/preview/${p.id}`, "_blank", "noopener")
                  }
                  onPublishToggle={() => togglePublish(p)}
                  onDelete={() => {
                    if (confirm(`Delete "${p.name}"? This cannot be undone.`))
                      deleteProject(p.id);
                  }}
                  publishing={updateMutation.isPending}
                />
              ))}
              {filtered.length === 0 && (
                <Card className={s.noMatch}>
                  No projects match "{query}".
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// The "new project" box: heading, credit warning, prompt textarea, and generate button.
interface PromptBoxProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  framework: ProjectFramework;
  setFramework: React.Dispatch<React.SetStateAction<ProjectFramework>>;
  onSubmit: () => void;
  onTopUp: () => void;
  loading: boolean;
  credits: number;
  error: string;
  firstName: string;
}

function PromptBox({
  prompt,
  setPrompt,
  framework,
  setFramework,
  onSubmit,
  onTopUp,
  loading,
  credits,
  error,
  firstName,
}: PromptBoxProps) {
  const NEW_SITE_COST = 5;
  const needsTopUp = credits < NEW_SITE_COST;
  const deficit = NEW_SITE_COST - credits;
  return (
    <section className={s.promptSection}>
      <div className={s.promptBg} style={s.promptBgStyle} />
      <div className={s.promptContent}>
        <p className={s.promptBadge}>
          <Sparkles className={s.promptBadgeIcon} /> New project
        </p>
        <h1 className={s.promptTitle}>
          Hi {firstName}, what do we build today?
        </h1>
        <p className={s.promptSub}>
          Describe your idea in plain English. We'll do the rest.
        </p>
        <div className={s.frameworkSelectorRow}>
          <label htmlFor="project-framework" className={s.frameworkSelectorLabel}>
            Build with
          </label>
          <select
            id="project-framework"
            value={framework}
            onChange={(event) =>
              setFramework(event.target.value as ProjectFramework)
            }
            className={s.frameworkSelector}
          >
            <option value="html">HTML</option>
            <option value="react">React</option>
            <option value="nextjs">Next.js</option>
          </select>
        </div>
        {needsTopUp && (
          <div className={s.creditsWarning}>
            <Zap className={s.creditsWarningIcon} />
            <div className={s.creditsWarningText}>
              <span className={s.creditsWarningBold}>
                Not enough credits.
              </span>{" "}
              A new site costs {NEW_SITE_COST}. You have {credits} — need{" "}
              {deficit} more.
            </div>
            <button
              onClick={onTopUp}
              className={s.topUpButton}
            >
              Buy credits
            </button>
          </div>
        )}
        <div className={s.inputArea}>
          <textarea
            data-prompt-input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            rows={3}
            placeholder="A portfolio website for a wedding photographer..."
            className={s.textarea}
          />
          <div className={s.inputFooter}>
            <div className={s.inputHint}>
              <Sparkles className={s.inputHintIcon} />
              <span className={s.inputHintText}>
                5 credits per new site · 2 per change · {credits} left ·{" "}
                <kbd className={s.inputKbd}>Enter</kbd> to generate
              </span>
            </div>
            {needsTopUp ? (
              <button
                onClick={onTopUp}
                className={s.topUpButton}
              >
                <Zap className={s.iconSm} /> Top up — need {deficit} more
              </button>
            ) : (
              <button
                onClick={onSubmit}
                disabled={loading || !prompt.trim()}
                className={s.generateButton}
              >
                {loading ? (
                  <>
                    <Loader2 className={`${s.iconSm} animate-spin`} /> Creating...
                  </>
                ) : (
                  <>
                    Generate <ArrowUp className={s.iconSm} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {error && <p className={s.promptError}>{error}</p>}
      </div>
    </section>
  );
}

// One project card: thumbnail, name, date, and preview/open/publish/delete buttons.
interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onPreview: () => void;
  onPublishToggle: () => void;
  onDelete: () => void;
  publishing: boolean;
}

function ProjectCard({
  project,
  onOpen,
  onPreview,
  onPublishToggle,
  onDelete,
  publishing,
}: ProjectCardProps) {
  return (
    <Card hover className={s.card}>
      <div className={s.thumbnailWrapper}>
        <ProjectThumbnail html={project.html} />
        <span
          className={`${s.statusBadge} ${
            project.published ? s.statusLive : s.statusDraft
          }`}
        >
          {project.published ? "LIVE" : "DRAFT"}
        </span>
      </div>
      <div className={s.cardBody}>
        <div className={s.cardHeader}>
          <h3 className={s.projectName}>{project.name}</h3>
          <span className={s.typeTag}>Website</span>
        </div>
        <div className={s.projectDate}>
          <Calendar className={s.projectDateIcon} />
          {project.updatedAt
            ? new Date(project.updatedAt).toLocaleDateString()
            : "—"}
        </div>
        <div className={s.actionGrid}>
          <button
            onClick={onPreview}
            disabled={!project.html}
            className={s.actionButton}
          >
            <Eye className={s.actionButtonIcon} /> Preview
          </button>
          <button
            onClick={onOpen}
            className={s.actionButton}
          >
            <ExternalLink className={s.actionButtonIcon} /> Open
          </button>
          {project.published ? (
            <button
              onClick={onPublishToggle}
              disabled={publishing}
              className={s.publishButtonLive}
            >
              <CheckCircle2 className={s.publishButtonLiveIcon} />
              <X className={s.publishButtonLiveIconHover} />
              <span className={s.publishButtonLiveText}>Published</span>
              <span className={s.publishButtonLiveTextHover}>Unpublish</span>
            </button>
          ) : (
            <button
              onClick={onPublishToggle}
              disabled={publishing || !project.html}
              className={s.publishButtonDraft}
            >
              <Rocket className={s.actionButtonIcon} /> Publish
            </button>
          )}
        </div>
        <button
          onClick={onDelete}
          className={s.deleteButton}
        >
          <Trash2 className={s.actionButtonIcon} /> Delete project
        </button>
      </div>
    </Card>
  );
}

// ContributionGraph — GitHub-style heatmap of your daily project activity.
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LEVEL_COLORS = [
  s.cellLevel0,
  s.cellLevel1,
  s.cellLevel2,
  s.cellLevel3,
  s.cellLevel4,
];

const CELL = 12;
const GAP = 3;
const COL = CELL + GAP;

// Maps a contribution count to a heatmap color level (0 to 4).
interface GridDay {
  date: Date;
  key: string;
  count: number | null;
}

interface MonthLabel {
  index: number;
  label: string;
}

interface HoveredDay extends GridDay {
  rect: DOMRect;
}

function levelFor(count: number): number {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 7) return 3;
  return 4;
}

// Returns a copy of the date set to midnight UTC.
function startOfDayUTC(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

// Builds the 53-week by 7-day grid of days (with counts) for the heatmap.
function buildGrid(daysMap: Record<string, number>): GridDay[][] {
  const today = startOfDayUTC(new Date());
  const endSat = new Date(today);
  endSat.setUTCDate(endSat.getUTCDate() + (6 - endSat.getUTCDay()));
  const start = new Date(endSat);
  start.setUTCDate(start.getUTCDate() - 52 * 7 - 6);
  const weeks: GridDay[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 53; w++) {
    const week: GridDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);
      const key = date.toISOString().slice(0, 10);
      const count = date <= today ? daysMap[key] || 0 : null;
      week.push({ date, key, count });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// Picks which columns get a month label, spaced out so they don't crowd.
function monthLabelsFor(weeks: GridDay[][]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let lastMonth = -1;
  let lastIndex = -Infinity;
  weeks.forEach((week, i) => {
    const firstDay = week[0].date;
    const month = firstDay.getUTCMonth();
    if (month !== lastMonth && i - lastIndex >= 4) {
      labels.push({ index: i, label: MONTHS[month] });
      lastMonth = month;
      lastIndex = i;
    }
  });
  return labels;
}

function ContributionGraph() {
  const [hover, setHover] = useState<HoveredDay | null>(null);
  const contributionsQuery = useQuery({
    queryKey: queryKeys.contributions,
    queryFn: getContributions,
  });
  const contributions = contributionsQuery.data;

  const daysMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of contributions?.days || []) m[d.date] = d.count;
    return m;
  }, [contributions]);

  const weeks = useMemo(() => buildGrid(daysMap), [daysMap]);
  const monthLabels = useMemo(() => monthLabelsFor(weeks), [weeks]);
  const total = contributions?.total ?? 0;
  const gridWidth = 53 * COL;

  return (
    <section className={s.graphSection}>
      <header className={s.graphHeader}>
        <div className={s.graphTitleGroup}>
          <h2 className={s.graphTitle}>Your activity</h2>
          <p className={s.graphSub}>
            {contributionsQuery.isPending ? (
              "Loading..."
            ) : contributionsQuery.isError ? (
              `Couldn't load: ${apiError(contributionsQuery.error)}`
            ) : (
              <>
                <span className={s.graphSubTotal}>{total}</span>{" "}
                {total === 1 ? "contribution" : "contributions"} in the last
                year
              </>
            )}
          </p>
        </div>
        <Legend />
      </header>
      {contributionsQuery.isPending ? (
        <ActivityGraphSkeleton />
      ) : (
        <div className={s.graphScroll}>
          <div className={s.graphInner}>
            {/* Day labels column */}
            <div
              className={s.dayLabels}
              style={{ gap: `${GAP}px` }}
            >
              {[..."MTWTFSS"].map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${CELL}px`, lineHeight: `${CELL}px` }}
                  className={s.dayLabelItem}
                >
                  {i === 0 ? "Mon" : i === 2 ? "Wed" : i === 4 ? "Fri" : ""}
                </div>
              ))}
            </div>

            <div className={s.graphGridWrapper}>
              {/* Month labels row */}
              <div
                className={s.monthLabelsRow}
                style={{ width: `${gridWidth}px` }}
              >
                {monthLabels.map(({ index, label }) => (
                  <span
                    key={`${index}-${label}`}
                    className={s.monthLabel}
                    style={{ left: `${index * COL}px`, top: 0 }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* 53 columns × 7 rows */}
              <div className={s.weeksContainer} style={{ gap: `${GAP}px` }}>
                {weeks.map((week, wi) => (
                  <div
                    key={wi}
                    className={s.weekColumn}
                    style={{ gap: `${GAP}px` }}
                  >
                    {week.map((day, di) => (
                      <Cell
                        key={di}
                        day={day}
                        onEnter={(rect) => setHover({ ...day, rect })}
                        onLeave={() => setHover(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {hover && hover.count !== null && (
        <Tooltip date={hover.date} count={hover.count} rect={hover.rect} />
      )}
    </section>
  );
}

// One square in the heatmap; shows its activity color and reports hover position.
interface CellProps {
  day: GridDay;
  onEnter: (rect: DOMRect) => void;
  onLeave: () => void;
}

function Cell({ day, onEnter, onLeave }: CellProps) {
  const isFuture = day.count === null;
  const level = isFuture ? -1 : levelFor(day.count ?? 0);
  return (
    <div
      onMouseEnter={(e) =>
        !isFuture && onEnter(e.currentTarget.getBoundingClientRect())
      }
      onMouseLeave={onLeave}
      style={{ width: `${CELL}px`, height: `${CELL}px` }}
      className={`${s.cellBase} ${
        isFuture ? s.cellFuture : LEVEL_COLORS[level]
      } ${!isFuture ? s.cellHover : ""}`}
    />
  );
}

// Small popup showing the date and contribution count for the hovered cell.
interface TooltipProps {
  date: Date;
  count: number | null;
  rect: DOMRect;
}

function Tooltip({ date, count, rect }: TooltipProps) {
  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const text =
    count === 0
      ? `No contributions on ${new Date(date).toLocaleDateString(undefined, dateOpts)}`
      : `${count} ${count === 1 ? "contribution" : "contributions"} on ${new Date(date).toLocaleDateString(undefined, dateOpts)}`;
  return (
    <div
      role="tooltip"
      className={s.tooltip}
      style={{ left: rect.left + rect.width / 2, top: rect.top - 8 }}
    >
      {text}
      <span className={s.tooltipArrow} />
    </div>
  );
}

// The "Less ... More" color scale shown next to the activity graph.
function Legend() {
  return (
    <div className={s.legend}>
      <span>Less</span>
      {LEVEL_COLORS.map((cls, i) => (
        <span
          key={i}
          className={`${s.legendCell} ${cls}`}
          style={{ width: `${CELL}px`, height: `${CELL}px` }}
        />
      ))}
      <span>More</span>
    </div>
  );
}