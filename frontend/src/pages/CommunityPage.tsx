// Community page — browse, sort, and like websites published by other users.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  ExternalLink,
  Eye,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { communityPageStyles as s } from "../assets/dummyStyles";
import { Card, ProjectThumbnail } from "../assets/ui";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ProjectGridSkeleton } from "../components/Skeletons";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../queryKeys";
import type { CommunityProject } from "../types";
import { apiError, getCommunity, likeCommunityProject } from "../utils/api";

const filters = [
  { label: "New", key: "new" },
  { label: "Most viewed", key: "views" },
  { label: "Most loved", key: "likes" },
] as const;

// Main community page: fetches published projects and renders the sortable grid.
export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sort, setSort] = useState<"new" | "views" | "likes">("new");
  const queryClient = useQueryClient();
  const communityKey = queryKeys.community.list(sort);
  const communityQuery = useQuery({
    queryKey: communityKey,
    queryFn: () => getCommunity(sort),
  });
  const projects = communityQuery.data?.projects ?? [];
  const likeMutation = useMutation({
    mutationFn: likeCommunityProject,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: communityKey });
      const previous = queryClient.getQueryData<{ projects: CommunityProject[] }>(communityKey);
      queryClient.setQueryData<{ projects: CommunityProject[] }>(communityKey, (current) =>
        current
          ? {
              projects: current.projects.map((project) =>
                project.id === id
                  ? {
                      ...project,
                      likedByMe: !project.likedByMe,
                      likes: Math.max(
                        0,
                        (project.likes ?? 0) + (project.likedByMe ? -1 : 1),
                      ),
                    }
                  : project,
              ),
            }
          : current,
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(communityKey, context.previous);
      }
    },
    onSuccess: (result, id) => {
      queryClient.setQueryData<{ projects: CommunityProject[] }>(communityKey, (current) =>
        current
          ? {
              projects: current.projects.map((project) =>
                project.id === id
                  ? { ...project, likes: result.likes, likedByMe: result.liked }
                  : project,
              ),
            }
          : current,
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: communityKey }),
  });

  return (
    <div className={s.container}>
      <Navbar />

      <section className={s.heroWrapper}>
        <div className={s.heroBg} style={s.heroBgStyle} />
        <div className={s.heroInner}>
          <h1 className={s.heroTitle}>Published Projects</h1>
          <p className={s.heroSub}>
            Real projects published by Creova users. Click Open to view it
            live, or tap the heart to show some love.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className={s.filterBar}>
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setSort(f.key)}
                className={`${s.filterButtonBase} ${
                  sort === f.key ? s.filterButtonActive : s.filterButtonInactive
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {communityQuery.isPending ? (
            <ProjectGridSkeleton community />
          ) : communityQuery.isError ? (
            <Card className={`${s.cardMessage} ${s.errorText}`}>
              Couldn't load community: {apiError(communityQuery.error)}
            </Card>
          ) : projects.length === 0 ? (
            <Card className={`${s.cardMessage} ${s.emptyText}`}>
              No published projects yet. Be the first — create one and hit{" "}
              <span className={s.emptyHighlight}>Publish</span>.
            </Card>
          ) : (
            <div className={s.grid}>
              {projects.map((p) => (
                <CommunityCard
                  key={p.id}
                  project={p}
                  isLoggedIn={Boolean(user)}
                  onOpen={() => navigate(`/preview/${p.id}`)}
                  onLike={() => {
                    if (!user) {
                      navigate("/login");
                      return;
                    }
                    likeMutation.mutate(p.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

// One project card: thumbnail, title, Open button, and like/heart toggle.
interface CommunityCardProps {
  project: CommunityProject;
  isLoggedIn: boolean;
  onOpen: () => void;
  onLike: () => void;
}

function CommunityCard({
  project,
  isLoggedIn,
  onOpen,
  onLike,
}: CommunityCardProps) {
  const initial = (project.author || "A").charAt(0).toUpperCase();
  const date = project.publishedAt
    ? new Date(project.publishedAt).toLocaleDateString()
    : "";
  const likedByMe = Boolean(project.likedByMe);

  return (
    <Card hover className={s.card}>
      {/* Thumbnail is clickable too — opens preview */}
      <button
        type="button"
        onClick={onOpen}
        className={s.thumbnailWrapper}
        aria-label={`Open ${project.name}`}
      >
        <ProjectThumbnail html={project.html} />
        <span className={s.websiteTag}>Website</span>
        {project.isOwn && (
          <span className={s.ownBadge}>
            <Check className={s.ownBadgeIcon} strokeWidth={3} />
            Published by you
          </span>
        )}
      </button>

      <div className={s.cardBody}>
        {project.isOwn && (
          <div className={s.ownIndicator}>
            <span className={s.ownDot} />
            Your project — live in community
          </div>
        )}
        <h3 className={s.projectTitle}>{project.name}</h3>

        <div className={s.actionRow}>
          {/* Open button — primary action */}
          <button
            onClick={onOpen}
            className={s.openButton}
          >
            <ExternalLink className={s.iconSm} /> Open
          </button>
          {/* Heart toggle — separate from Open. Red when liked. */}
          <button
            onClick={onLike}
            disabled={project.isOwn}
            title={
              project.isOwn
                ? "You can't like your own project"
                : likedByMe
                  ? "Unlike"
                  : isLoggedIn
                    ? "Like"
                    : "Sign in to like"
            }
            className={`${s.likeButtonBase} ${
              likedByMe ? s.likeButtonLiked : s.likeButtonUnliked
            } ${project.isOwn ? s.likeButtonOwn : ""}`}
          >
            <Heart
              className={`${s.likeIcon} ${
                likedByMe ? s.likeIconFilled : ""
              }`}
            />
            {project.likes ?? 0}
          </button>
        </div>

        <div className={s.footerRow}>
          <div className={s.authorInfo}>
            <div className={s.authorAvatar}>{initial}</div>
            <span className={s.authorName}>
              {project.author || "Anonymous"}
            </span>
          </div>
          <div className={s.metaGroup}>
            {date && (
              <span className={s.metaItem}>
                <Calendar className={s.iconXs} /> {date}
              </span>
            )}
            <span className={s.metaItem}>
              <Eye className={s.iconXs} /> {project.views ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}