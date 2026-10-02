// Preview page — full-screen view of a single published or owned site.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Heart, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { previewPageStyles as s } from "../assets/dummyStyles";
import { FullScreenMessage, Logo } from "../assets/ui";
import { PreviewPageSkeleton } from "../components/Skeletons";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../queryKeys";
import type { CommunityProject, Project } from "../types";
import {
  apiError,
  getCommunityProject,
  getProject,
  likeCommunityProject,
} from "../utils/api";
import { safePreviewHtml } from "../utils/safePreview";

// Loads one project by its id and shows it full-screen with view/like actions.
export default function PreviewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const previewKey = queryKeys.community.detail(id ?? "", Boolean(user));
  const previewQuery = useQuery({
    queryKey: previewKey,
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error("Project id is missing");
      try {
        return await getCommunityProject(id);
      } catch (publicError) {
        if (!user) throw new Error("This preview isn't public yet.");
        try {
          return await getProject(id);
        } catch {
          throw publicError;
        }
      }
    },
  });
  const project = previewQuery.data?.project;
  const likeMutation = useMutation({
    mutationFn: likeCommunityProject,
    onSuccess: ({ likes, liked }, projectId) => {
      queryClient.setQueryData<
        { project: CommunityProject } | { project: Project }
      >(previewKey, (current) =>
        current?.project.id === projectId
          ? {
              ...current,
              project: { ...current.project, likes, likedByMe: liked },
            }
          : current,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all });
    },
  });

  // Sends a like for the current project and updates the like count.
  function handleLike() {
    if (!project || likeMutation.isPending) return;
    likeMutation.mutate(project.id);
  }

  if (previewQuery.isPending) {
    return <PreviewPageSkeleton />;
  }
  if (previewQuery.isError || !project) {
    return (
      <FullScreenMessage>
        <p className={s.errorTitle}>Preview unavailable</p>
        <p className={s.errorMessage}>
          {previewQuery.error ? apiError(previewQuery.error) : "Project not found"}
        </p>
        <Link
          to="/community"
          className={s.errorButton}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Browse community
        </Link>
      </FullScreenMessage>
    );
  }
  const authorName: string =
    "author" in project && typeof project.author === "string"
      ? project.author
      : "Anonymous";

  return (
    <div className={s.container}>
      <header className={s.header}>
        <Link
          to="/community"
          className={s.backLink}
        >
          <ArrowLeft className={s.backIcon} /> Community
        </Link>
        <div className={s.logoWrapper}>
          <Logo />
        </div>
        <div className={s.projectInfo}>
          <p className={s.projectName}>{project.name}</p>
          <p className={s.projectAuthor}>
            by {authorName}
          </p>
        </div>
        <div className={s.actions}>
          {typeof project.views === "number" && (
            <span className={s.viewsBadge}>
              <Eye className={s.viewsIcon} /> {project.views}
            </span>
          )}
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={s.likeButton}
          >
            <Heart className={s.likeIcon} />
            {project.likes ?? 0}
          </button>
        </div>
      </header>

      <div className={s.previewArea}>
        {project.html ? (
          <iframe
            title={project.name}
            srcDoc={safePreviewHtml(project.html)}
            sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
            className={s.iframe}
          />
        ) : (
          <div className={s.emptyContainer}>
            <Sparkles className={s.emptyIcon} />
            This project has no generated HTML yet.
          </div>
        )}
      </div>
    </div>
  );
}