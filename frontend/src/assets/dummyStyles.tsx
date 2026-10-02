// src/assets/dummyStyles.js

export const builderPageStyles = {
  // ─── Shared / Reusable ──────────────────────────────────────
  gradientButton:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100",
  iconSm: "w-3.5 h-3.5",
  iconMd: "w-4 h-4",
  iconLg: "w-7 h-7",
  flexRow: "flex items-center gap-2",
  flexRowGap: "flex gap-2",
  flexColCenter: "flex flex-col items-center justify-center",
  textWhite: "text-white",
  textWhite80: "text-white/80",
  textWhite55: "text-white/55",
  textWhite45: "text-white/45",
  textWhite30: "text-white/30",
  textWhite20: "text-white/20",
  transition: "transition",
  borderWhite6: "border border-white/6",
  borderWhite8: "border border-white/8",
  bgWhite3: "bg-white/3",
  bgWhite5: "bg-white/5",
  bgWhite6: "bg-white/6",
  bgWhite8: "bg-white/8",
  bgWhite10: "bg-white/10",
  bgDark: "bg-[#0a0b0c]", // used in chat and topbar
  bgPreview: "bg-[#0c0d0f]",
  bgMain: "bg-[#08090a]",
  roundedLg: "rounded-lg",
  roundedXl: "rounded-xl",
  roundedFull: "rounded-full",
  hiddenMd: "hidden md:block",
  inlineMd: "hidden md:inline",
  inlineSm: "hidden sm:inline",
  flexSm: "hidden sm:flex",

  // ─── BuilderPage (main container & layout) ──────────────
  container: "flex flex-col h-screen bg-[#08090a] text-white",
  mainFlex: "flex flex-1 overflow-hidden",
  chatPanel: "w-[360px] shrink-0 hidden md:flex",
  mobileWarning:
    "md:hidden bg-amber-500/10 border-t border-amber-500/20 px-4 py-2.5 text-[12px] text-amber-200 flex items-center gap-2",
  mobileWarningBack: "ml-auto font-semibold underline",

  // Published banner
  publishedBanner:
    "bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center gap-2 text-[13px] text-emerald-200",
  publishedLink: "font-semibold underline",

  // Loading / Error states (FullScreenMessage)
  loadingSpinner: "w-6 h-6 animate-spin text-indigo-300 mb-3",
  errorTitle: "text-red-400 mb-3",
  errorSub: "text-white/55 text-[13px]",
  errorButton: "", // uses gradientButton – we'll reference directly

  // ─── BuilderChat ───────────────────────────────────────────
  chatContainer: "flex flex-col h-full bg-[#0a0b0c] border-r border-white/6",
  chatHeader:
    "px-4 py-3 border-b border-white/6 flex items-center gap-2.5",
  chatHeaderIcon:
    "w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center",
  chatHeaderIconInner: "w-3.5 h-3.5 text-white",
  chatHeaderTitleContainer: "flex-1 min-w-0",
  chatHeaderTitle: "text-[13px] font-semibold text-white",
  chatHeaderCredits: "text-[11px] text-white/45",

  chatMessages: "flex-1 overflow-y-auto p-4 space-y-3.5",
  emptyChat: "text-center text-[13px] text-white/55 px-3 pt-6",
  emptyChatSub: "mb-4",

  retryButton:
    "w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/8 hover:bg-amber-500/[0.14] text-[13px] font-medium text-amber-200 transition",

  suggestionsContainer: "pt-2 space-y-2",
  suggestionsLabel: "text-[11px] text-white/40 px-1",
  suggestionButton:
    "w-full text-left px-3 py-2 rounded-lg bg-white/3 hover:bg-white/6 border border-white/6 hover:border-white/12 text-[13px] text-white/80 transition flex items-center gap-2",
  suggestionIcon: "w-3.5 h-3.5 text-indigo-300 shrink-0",

  chatInputArea: "p-3 border-t border-white/6",
  creditsWarning:
    "mb-2 flex items-center gap-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[12px] text-amber-200",
  creditsWarningIcon: "w-3.5 h-3.5 shrink-0 text-amber-300",
  creditsWarningText: "flex-1 leading-snug",
  creditsWarningBold: "font-semibold text-white",
  buyCreditsButton:
    "shrink-0 px-2.5 py-1 rounded-md bg-amber-400 text-amber-950 text-[11.5px] font-semibold hover:bg-amber-300 transition",

  inputContainer:
    "flex items-end gap-2 bg-white/3 border border-white/8 focus-within:border-white/18 rounded-xl p-2 transition",
  textarea:
    "flex-1 bg-transparent px-2 py-1.5 text-[13px] text-white placeholder-white/35 resize-none focus:outline-none disabled:cursor-not-allowed",
  sendButtonBase: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition",
  sendButtonActive: "", // uses gradientButton (we'll combine)
  sendButtonDisabled: "bg-white/6 text-white/30",
  sendIcon: "w-4 h-4",
  inputHint: "text-[11px] text-white/30 mt-2 px-1",

  // ─── Message ──────────────────────────────────────────────
  messageUl: "list-disc pl-4 space-y-1 my-1.5",
  messageP: "leading-relaxed",
  messageSpacer: "h-1.5",
  messageBodyWrapper: "space-y-1",

  messageContainer: "flex gap-2",
  messageRowReverse: "flex-row-reverse",

  errorIconContainer:
    "w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0",
  errorIcon: "w-3 h-3 text-red-300",
  errorMessage:
    "max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap bg-red-500/8 text-red-200 border border-red-500/30",

  avatarBase: "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white",
  avatarUser: "bg-white/10",
  avatarAssistant: "bg-linear-to-br from-indigo-500 to-violet-600",
  avatarIcon: "w-3 h-3",

  messageBubbleBase: "max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed",
  messageBubbleUser: "bg-indigo-500 text-white rounded-tr-sm whitespace-pre-wrap",
  messageBubbleAssistant: "bg-white/5 text-white/85 rounded-tl-sm border border-white/6",

  // ─── TypingIndicator ──────────────────────────────────────
  typingContainer: "flex gap-2",
  typingAvatar: "w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center",
  typingAvatarIcon: "w-3 h-3 text-white",
  typingDotsContainer: "bg-white/5 border border-white/6 px-3 py-2.5 rounded-xl rounded-tl-sm flex gap-1.5",
  typingDot: "w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce",

  // ─── BuilderPreview ──────────────────────────────────────
  previewContainer: "flex-1 bg-[#08090a] p-5 overflow-auto",
  previewToolbar: "flex items-center justify-between gap-3 mb-3",
  previewTabs: "inline-flex items-center gap-1 rounded-lg border border-white/8 bg-white/3 p-1",
  previewTab: "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] text-white/55 transition hover:text-white",
  previewTabActive: "bg-white/10 text-white",
  codeToolbarActions: "flex items-center gap-2 min-w-0",
  codeFileSelect: "max-w-[min(48vw,320px)] truncate rounded-md border border-white/10 bg-[#111214] px-2.5 py-1.5 text-[11px] text-white/80",
  copyCodeButton: "inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[11px] text-white/65 hover:bg-white/5 disabled:opacity-40",
  previewInnerWrapper: "h-full transition-all duration-300",
  previewBox: "h-[calc(100%-48px)] min-h-[420px] bg-[#0c0d0f] rounded-xl border border-white/8 overflow-hidden relative",
  codeView: "h-full overflow-auto bg-[#0b0c0d]",
  codePre: "min-h-full p-5 text-[12px] leading-6 text-emerald-100/85 font-mono whitespace-pre",
  codeEmpty: "grid h-full min-h-[420px] place-items-center px-8 text-center text-[13px] text-white/45",
  codeGenerating: "sticky top-0 z-10 flex items-center gap-2 border-b border-white/8 bg-[#111214]/95 px-4 py-2.5 text-[11px] text-emerald-200",
  codePreviewNotice: "grid h-full min-h-[420px] content-center justify-items-center px-8 text-center",

  generatingOverlay:
    "absolute inset-0 bg-[#0c0d0f]/85 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3",
  generatingSpinner: "w-7 h-7 text-indigo-300 animate-spin",
  generatingText: "text-[13px] font-medium text-white/85",
  generatingSub: "text-[11px] text-white/45",

  // ─── EmptyState ──────────────────────────────────────────
  emptyStateContainer: "h-full flex flex-col items-center justify-center text-center px-8",
  emptyIconContainer:
    "w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5",
  emptyIcon: "w-7 h-7 text-white",
  emptyTitle: "text-[15px] font-semibold text-white mb-1.5",
  emptyDesc: "text-[13px] text-white/55 max-w-sm mb-5",
  emptyGenerateButton: "", // uses gradientButton

  // ─── BuilderTopbar ───────────────────────────────────────
  topbar: "bg-[#0a0b0c] border-b border-white/6 px-4 py-2.5 flex items-center gap-4",
  topbarLeft: "flex items-center gap-3 min-w-0",
  topbarBack: "p-1.5 -ml-1.5 rounded-md text-white/55 hover:bg-white/5 hover:text-white transition",
  topbarBackIcon: "w-4 h-4",
  topbarLogo: "hidden md:block",
  topbarSlash: "text-white/20 hidden md:inline",
  topbarNameInput:
    "bg-transparent text-[13px] font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-md px-1.5 py-0.5 min-w-0 truncate",

  deviceToggle: "hidden md:flex items-center bg-white/4 rounded-lg p-0.5 border border-white/6 mx-auto",
  deviceButtonBase: "p-1.5 rounded-md transition",
  deviceButtonActive: "bg-white/8 text-white",
  deviceButtonInactive: "text-white/45 hover:text-white",
  deviceIcon: "w-4 h-4",

  actionsContainer: "flex items-center gap-2 ml-auto",

  creditsButton:
    "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/6 bg-white/3 text-[12px] font-medium hover:bg-white/6 hover:border-white/12 transition",
  creditsIcon: "w-3.5 h-3.5 text-indigo-300",
  creditsLabel: "text-white/55",
  creditsNumber: "tabular-nums",

  actionButton:
    "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-[13px] font-medium text-white/80 rounded-md hover:bg-white/5 disabled:opacity-40 transition",
  actionButtonIcon: "w-3.5 h-3.5",
  actionButtonText: "hidden sm:inline",

  githubButton:
    "hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white/80 rounded-md hover:bg-white/5 disabled:opacity-40 transition",

  publishButtonBase: "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition",
  publishButtonPublished: "bg-emerald-500 hover:bg-emerald-400 text-white",
  publishButtonUnpublished: "", // uses gradientButton
  publishIcon: "w-3.5 h-3.5",

  // ─── SaveStatus ──────────────────────────────────────────
  saveStatusGenerating:
    "text-[12px] text-indigo-300 hidden md:inline-flex items-center gap-1.5",
  saveStatusSpinner: "w-3 h-3 animate-spin",
  saveStatusError: "text-[12px] text-red-400 hidden md:inline",
  saveStatusSaving: "text-[12px] text-white/45 hidden md:inline",
  saveStatusSaved: "text-[12px] text-emerald-300/80 hidden md:inline",
};

// src/assets/dummyStyles.js (append these exports)

export const communityPageStyles = {
  // ─── Shared / Reusable ────────────────────────────────────
  iconSm: "w-3.5 h-3.5",
  iconXs: "w-3 h-3",
  transition: "transition",

  // ─── Page Container ───────────────────────────────────────
  container: "min-h-screen bg-[#08090a] text-white",

  // ─── Hero Section ────────────────────────────────────────
  heroWrapper: "relative pt-32 pb-10 px-4 overflow-hidden",
  heroBg: "absolute inset-0 pointer-events-none",
  heroBgStyle: {
    background:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,138,76,0.22) 0%, rgba(255,92,92,0.14) 30%, transparent 65%)",
  },
  heroInner: "relative max-w-5xl mx-auto",
  heroTitle: "text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-3",
  heroSub: "text-white/55 max-w-xl",

  // ─── Filters ─────────────────────────────────────────────
  filterBar: "flex flex-wrap items-center gap-2 mb-7",
  filterButtonBase:
    "px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition",
  filterButtonActive: "bg-white text-black border-white",
  filterButtonInactive:
    "border-white/8 text-white/70 hover:text-white hover:border-white/20",

  // ─── Loading / Error / Empty ─────────────────────────────
  cardMessage: "p-12 text-center text-[13px]",
  loadingText: "text-white/55",
  loadingSpinner: "w-5 h-5 animate-spin inline mr-2 text-indigo-300",
  errorText: "text-red-300",
  emptyText: "text-white/55",
  emptyHighlight: "font-semibold text-white",

  // ─── Project Grid ─────────────────────────────────────────
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",

  // ─── CommunityCard ──────────────────────────────────────
  card: "overflow-hidden flex flex-col", // combined with Card hover

  thumbnailWrapper:
    "relative block w-full text-left cursor-pointer group",
  websiteTag:
    "absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/85 backdrop-blur text-black text-[10px] font-bold uppercase tracking-wider z-30",
  ownBadge:
    "absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/95 backdrop-blur text-white text-[11px] font-bold uppercase tracking-wider z-30 shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-300/50",
  ownBadgeIcon: "w-3 h-3",

  cardBody: "p-4 flex-1 flex flex-col",

  ownIndicator:
    "mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 self-start",
  ownDot: "w-1.5 h-1.5 rounded-full bg-emerald-400",

  projectTitle:
    "font-semibold text-white text-[15px] leading-snug line-clamp-2 mb-1.5",

  actionRow: "mt-auto flex items-center gap-2",

  openButton:
    "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-[12.5px] font-semibold hover:bg-white/90 transition",

  likeButtonBase:
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12.5px] font-medium transition",
  likeButtonLiked:
    "border-rose-500/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/20",
  likeButtonUnliked:
    "border-white/10 bg-white/4 text-white/70 hover:text-white hover:border-white/20",
  likeButtonOwn: "opacity-40 cursor-not-allowed",
  likeIcon: "w-3.5 h-3.5 transition",
  likeIconFilled: "fill-rose-400 text-rose-400",

  footerRow:
    "mt-3 pt-3 border-t border-white/6 flex items-center justify-between gap-3",

  authorAvatar:
    "w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white text-[10px] font-semibold flex items-center justify-center shrink-0",
  authorName: "text-[12px] text-white/70 truncate",
  authorInfo: "flex items-center gap-2 min-w-0",

  metaGroup: "flex items-center gap-3 text-[11px] text-white/45 shrink-0",
  metaItem: "inline-flex items-center gap-1",
};

// src/assets/dummyStyles.js – append this export

export const dashboardPageStyles = {
  // ─── Shared / Reusable ──────────────────────────────────
  iconSm: "w-3.5 h-3.5",
  iconXs: "w-3 h-3",
  transition: "transition",
  flexRow: "flex items-center gap-2",
  flexCol: "flex flex-col",
  textWhite: "text-white",
  textWhite55: "text-white/55",
  textWhite45: "text-white/45",
  textWhite40: "text-white/40",
  textWhite35: "text-white/35",
  textWhite20: "text-white/20",
  borderWhite8: "border border-white/8",
  borderWhite10: "border border-white/10",
  bgWhite3: "bg-white/3",
  bgWhite5: "bg-white/5",
  bgWhite8: "bg-white/8",
  bgWhite10: "bg-white/10",
  bgDark: "bg-[#0c0d0f]",
  bgMain: "bg-[#08090a]",
  roundedLg: "rounded-lg",
  roundedXl: "rounded-xl",
  roundedMd: "rounded-md",
  gradientButton:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100",

  // ─── Page Container ─────────────────────────────────────
  container: "min-h-screen bg-[#08090a] text-white",
  main: "pt-24 pb-20 px-4",
  inner: "max-w-6xl mx-auto",

  // ─── PromptBox ──────────────────────────────────────────
  promptSection:
    "relative rounded-2xl border border-white/8 bg-[#0c0d0f] p-4 sm:p-8 overflow-hidden",
  promptBg: "absolute inset-0 pointer-events-none opacity-60",
  promptBgStyle: {
    background:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,138,76,0.22) 0%, rgba(255,92,92,0.14) 30%, transparent 65%)",
  },
  promptContent: "relative",
  promptBadge:
    "text-[12px] uppercase tracking-[0.16em] text-indigo-300/80 font-medium mb-2.5 inline-flex items-center gap-1.5",
  promptBadgeIcon: "w-3.5 h-3.5",
  promptTitle: "text-2xl sm:text-3xl font-semibold tracking-tight mb-1.5",
  promptSub: "text-[14px] text-white/55 mb-6",
  frameworkSelectorRow: "flex flex-wrap items-center gap-2 mb-4",
  frameworkSelectorLabel: "text-[12px] text-white/55",
  frameworkSelector: "rounded-md border border-white/12 bg-[#171819] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-emerald-400/60",

  creditsWarning:
    "mb-4 flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[13px] text-amber-200",
  creditsWarningIcon: "w-4 h-4 shrink-0 text-amber-300",
  creditsWarningText: "flex-1",
  creditsWarningBold: "font-semibold text-white",
  topUpButton:
    "self-stretch sm:self-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400 text-amber-950 text-[12.5px] font-semibold hover:bg-amber-300 transition whitespace-nowrap",

  inputArea:
    "rounded-xl border border-white/10 bg-[#0f1011]/80 backdrop-blur p-3 max-w-3xl",
  textarea:
    "w-full bg-transparent px-3 py-2 text-[14px] text-white placeholder-white/35 resize-none focus:outline-none",
  inputFooter:
    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2",
  inputHint:
    "flex items-center gap-1.5 text-[11px] sm:text-[12px] text-white/40 px-2",
  inputHintIcon: "w-3.5 h-3.5 text-indigo-300 shrink-0",
  inputHintText: "leading-tight",
  inputKbd:
    "px-1 py-0.5 rounded bg-white/10 text-white/60 text-[10px]",
  generateLoading:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 px-4 py-2 text-[13px] self-stretch sm:self-auto", // same as gradientButton but with loading state
  promptError: "mt-3 text-[12px] text-red-400",

  // ─── Project List Header ──────────────────────────────
  listHeader:
    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 mt-10",
  listTitle: "text-[20px] font-semibold tracking-tight",
  listControls: "flex items-center gap-2 sm:gap-3 w-full sm:w-auto",
  searchBox: "relative flex-1 sm:flex-initial",
  searchIcon:
    "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 pointer-events-none",
  searchInput:
    "pl-9 pr-3 py-1.5 rounded-md bg-white/3 border border-white/8 text-[13px] text-white placeholder-white/35 focus:outline-none focus:border-white/20 w-full sm:w-44",
  createButton:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-[13px] font-semibold transition hover:bg-white/90 shrink-0 whitespace-nowrap",
  createButtonTextHidden: "hidden xs:inline sm:inline", // used for xs/sm
  createButtonTextMobile: "xs:hidden sm:hidden", // used for small screens

  // ─── Loading / Error / Empty ──────────────────────────
  cardMessage: "p-10 text-center text-[13px]",
  loadingText: "text-white/55",
  loadingSpinner: "w-5 h-5 animate-spin inline mr-2 text-indigo-300",
  errorText: "text-red-300",
  emptyText: "text-white/55",

  // ─── Project Grid ─────────────────────────────────────
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
  noMatch: "p-8 col-span-full text-center text-[13px] text-white/55",

  // ─── ProjectCard ──────────────────────────────────────
  card: "overflow-hidden flex flex-col",
  thumbnailWrapper: "relative",
  statusBadge:
    "absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur border z-30",
  statusLive:
    "bg-emerald-500/25 text-emerald-100 border-emerald-300/30",
  statusDraft: "bg-black/40 text-white border-white/15",

  cardBody: "p-4 flex-1 flex flex-col",
  cardHeader: "flex items-start justify-between gap-2",
  projectName: "font-semibold text-white text-[14px] truncate flex-1",
  typeTag: "px-1.5 py-0.5 rounded-full bg-white/6 text-white/65 text-[10px] font-semibold uppercase tracking-wider shrink-0",
  projectDate:
    "flex items-center gap-1.5 text-[11px] text-white/40 mb-4",
  projectDateIcon: "w-3 h-3",
  actionGrid: "mt-auto grid grid-cols-3 gap-1.5",
  actionButton:
    "inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/8 text-[12px] font-medium text-white/85 transition disabled:opacity-40",
  actionButtonIcon: "w-3 h-3",
  publishButtonLive:
    "group/pub inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-emerald-500/15 hover:bg-red-500/15 border border-emerald-500/30 hover:border-red-500/40 text-[12px] font-semibold text-emerald-200 hover:text-red-300 transition-all disabled:opacity-50",
  publishButtonLiveIcon: "w-3 h-3 group-hover/pub:hidden",
  publishButtonLiveIconHover: "w-3 h-3 hidden group-hover/pub:block",
  publishButtonLiveText: "group-hover/pub:hidden",
  publishButtonLiveTextHover: "hidden group-hover/pub:inline",
  publishButtonDraft:
    "inline-flex items-center justify-center text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 gap-1 px-2 py-1.5 rounded-md text-[12px]",
  deleteButton:
    "mt-2 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] text-white/35 hover:text-red-300 transition",
  generateButton:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 px-4 py-2 text-[13px] self-stretch sm:self-auto",

  // ─── ContributionGraph ──────────────────────────────
  graphSection:
    "rounded-2xl border border-white/8 bg-[#0c0d0f] p-5 sm:p-6",
  graphHeader:
    "flex items-center justify-between mb-5 gap-3",
  graphTitleGroup: "min-w-0",
  graphTitle: "text-[15px] font-semibold text-white",
  graphSub: "text-[12px] text-white/45 mt-0.5",
  graphSubLoading: "text-white/45",
  graphSubError: "text-white/45",
  graphSubTotal: "tabular-nums text-white/85",
  graphLoading:
    "h-32 flex items-center justify-center text-white/45 text-[12px]",
  graphLoadingSpinner:
    "w-4 h-4 animate-spin mr-2 text-indigo-300",
  graphScroll: "overflow-x-auto -mx-1 px-1 pb-1",
  graphInner: "flex gap-2",
  dayLabels:
    "flex flex-col text-[10px] text-white/35 pt-[18px] shrink-0",
  dayLabelItem: "flex items-center",
  graphGridWrapper: "min-w-0",
  monthLabelsRow:
    "relative h-[14px] mb-1",
  monthLabel:
    "absolute text-[10px] text-white/55 leading-none",
  weeksContainer: "flex",
  weekColumn: "flex flex-col",

  // ─── Cell ──────────────────────────────────────────────
  cellBase:
    "rounded-[3px] ring-1 transition-all duration-150",
  cellFuture: "opacity-0 pointer-events-none",
  cellLevel0: "bg-white/[0.05] ring-white/[0.03]",
  cellLevel1: "bg-emerald-500/30 ring-emerald-400/20",
  cellLevel2: "bg-emerald-500/55 ring-emerald-400/30",
  cellLevel3: "bg-emerald-400/80 ring-emerald-300/40",
  cellLevel4: "bg-emerald-300 ring-emerald-200/50",
  cellHover: "hover:ring-white/40 hover:scale-110 cursor-pointer",

  // ─── Tooltip ──────────────────────────────────────────
  tooltip:
    "fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 px-2.5 py-1.5 rounded-md bg-[#1a1b1f] border border-white/15 text-[11px] text-white shadow-2xl whitespace-nowrap",
  tooltipArrow:
    "absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2 h-2 rotate-45 bg-[#1a1b1f] border-r border-b border-white/15",

  // ─── Legend ──────────────────────────────────────────
  legend:
    "hidden sm:flex items-center gap-1.5 text-[10px] text-white/45 shrink-0",
  legendLabel: "text-white/45",
  legendCell: "rounded-[3px] ring-1",
};

export const forgotPasswordPageStyles = {
  // ─── Shared icons ──────────────────────────────────────
  iconSm: "w-3.5 h-3.5",
  iconMd: "w-4 h-4",

  // ─── Back / footer links ──────────────────────────────
  backLink:
    "text-white/70 hover:text-white inline-flex items-center gap-1.5",
  backLinkIcon: "w-3.5 h-3.5",

  // ─── Form spacing ──────────────────────────────────────
  form: "space-y-4",

  // ─── Info box (ShieldCheck) ────────────────────────────
  infoBox:
    "flex items-center gap-2 p-3 rounded-lg border border-white/6 bg-white/2 text-[12px] text-white/55",
  infoIcon: "w-4 h-4 text-indigo-300 shrink-0",

  // ─── Primary button (with icon) ────────────────────────
  buttonPrimary:
    "w-full py-2.5 rounded-lg text-[14px] font-semibold bg-white text-black hover:bg-white/90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2",
  buttonPrimaryIcon: "w-4 h-4",

  // ─── Secondary button (no icon) ────────────────────────
  buttonSecondary:
    "w-full py-2.5 rounded-lg text-[14px] font-semibold bg-white text-black hover:bg-white/90 transition disabled:opacity-60",

  // ─── Label ──────────────────────────────────────────────
  label: "block text-[13px] font-medium text-white/85 mb-1.5",

  // ─── OTP input ──────────────────────────────────────────
  otpInput:
    "w-full bg-white/3 border border-white/8 rounded-lg px-3 py-3 text-center text-[24px] tracking-[0.45em] font-semibold text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40",

  // ─── Error message ──────────────────────────────────────
  error: "mt-1.5 text-[12px] text-red-400",

  // ─── Resend row ─────────────────────────────────────────
  resendRow: "flex items-center justify-between text-[12px] text-white/55",
  resendButton:
    "text-white font-semibold hover:underline underline-offset-4 disabled:no-underline disabled:text-white/35 disabled:cursor-not-allowed",
};

// src/assets/dummyStyles.js – append this export

export const landingPageStyles = {
  // ─── Page container ──────────────────────────────────
  container: "min-h-screen bg-[#08090a] text-white",

  // ─── Hero ────────────────────────────────────────────
  heroSection: "relative pt-32 pb-24 px-4 overflow-hidden",
  heroInner: "relative max-w-3xl mx-auto text-center",

  // Hero – trial badge
  trialBadge:
    "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/4 text-[12px] mb-8 hover:bg-white/7 transition",
  trialBadgeNew:
    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-linear-to-r from-rose-500/30 to-amber-400/30 text-amber-200 text-[10px] font-semibold tracking-wide ring-1 ring-amber-400/30",
  trialBadgeText: "text-white/80",
  trialBadgeIcon: "w-3.5 h-3.5 text-white/40",

  // Hero – headings
  heroTitle:
    "text-[44px] sm:text-[64px] leading-[1.05] font-semibold tracking-[-0.03em] text-white mb-5",
  heroTitleHighlight:
    "bg-linear-to-br from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent",
  heroSub: "text-[17px] text-white/55 max-w-xl mx-auto mb-10 leading-relaxed",

  // Hero – input box
  heroInputWrapper: "relative max-w-2xl mx-auto",
  heroInputGlow:
    "absolute -inset-px rounded-2xl opacity-40 blur-md",
  heroInputBox:
    "relative rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur p-3",
  heroTextarea:
    "w-full bg-transparent px-3 py-2 text-[15px] text-white placeholder-white/35 resize-none focus:outline-none",
  heroInputFooter:
    "flex items-center justify-between pt-2",
  heroInputHint:
    "flex items-center gap-1.5 text-[11px] text-white/40 px-2",
  heroInputHintIcon: "w-3.5 h-3.5 text-orange-300",
  heroCreateButton:
    "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-zinc-900 bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.6)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition",
  heroCreateButtonIcon: "w-3.5 h-3.5",

  // Hero – trust bar
  heroTrust: "mt-16 flex flex-col items-center gap-4",
  heroTrustLabel: "text-[11px] uppercase tracking-[0.2em] text-white/35",
  heroTrustLogos:
    "flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-70 text-white/50 text-[13px] font-medium",
  heroTrustItem: "inline-flex items-center gap-1.5",
  heroTrustDot: "w-1.5 h-1.5 rounded-full",

  // ─── Features ────────────────────────────────────────
  featuresSection:
    "relative py-24 px-4 border-t border-white/6",
  featuresInner: "max-w-6xl mx-auto",
  featuresHeader: "text-center mb-14",
  featuresBadge:
    "text-[12px] uppercase tracking-[0.16em] text-orange-300/80 font-medium mb-3",
  featuresTitle:
    "text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-3",
  featuresTitleHighlight:
    "bg-linear-to-br from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent",
  featuresSub: "text-white/55 max-w-lg mx-auto",

  featuresGrid:
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",

  featureCard:
    "bg-zinc-900/80 border border-white/[0.07] rounded-2xl transition-all duration-200 hover:border-white/16 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_rgba(255,138,76,0.18)] p-6 group",
  featureIconWrapper:
    "relative w-10 h-10 rounded-xl border border-white/8 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
  featureIcon: "w-4.5 h-4.5", // note: keep as string
  featureTitle: "text-[15px] font-semibold text-white mb-1.5 tracking-tight",
  featureDesc: "text-[13px] text-white/55 leading-relaxed",

  // ─── CTA ──────────────────────────────────────────────
  ctaSection:
    "relative py-24 px-4 border-t border-white/6 overflow-hidden",
  ctaBg:
    "absolute inset-0 pointer-events-none",
  ctaBgStyle: {
    background:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,138,76,0.22) 0%, rgba(255,92,92,0.14) 30%, transparent 65%)",
  },
  ctaInner: "relative max-w-3xl mx-auto text-center",

  ctaFreeBadge:
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/4 border border-white/10 text-[11px] text-white/65 mb-5",
  ctaFreeBadgeIcon: "w-3 h-3 text-orange-300",

  ctaTitle:
    "text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mb-4",
  ctaTitleHighlight:
    "bg-linear-to-br from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent",
  ctaSub: "text-white/55 mb-8 max-w-md mx-auto",

  ctaButton:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 px-5 py-2.5 text-[14px]",
  ctaButtonIcon: "w-4 h-4",
};

// src/assets/dummyStyles.js – append this export

export const loginPageStyles = {
  // ─── Form ──────────────────────────────────────────────
  form: "space-y-4",

  // ─── Verified banner ──────────────────────────────────
  verifiedBanner:
    "flex items-center gap-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/8 text-[12.5px] text-emerald-200",
  verifiedIcon: "w-4 h-4 shrink-0",

  // ─── Password field row ───────────────────────────────
  passwordRow: "flex items-center justify-between mb-1.5",
  passwordLabel: "text-[13px] font-medium text-white/85",
  forgotLink: "text-[12px] text-white/55 hover:text-white transition",

   signUpLink: "text-white font-semibold hover:underline underline-offset-4",

  // ─── Submit error ──────────────────────────────────────
  submitError: "text-[12px] text-red-400 -mt-1",

  // ─── Submit button ─────────────────────────────────────
  submitButton:
    "w-full py-2.5 rounded-lg text-[14px] font-semibold bg-white text-black hover:bg-white/90 transition disabled:opacity-60",
};

// src/assets/dummyStyles.js – append this export

export const notFoundPageStyles = {
  // ─── Page container ──────────────────────────────────────
  container:
    "min-h-screen relative flex flex-col items-center justify-center px-4 bg-[#08090a] text-white overflow-hidden",

  // ─── Logo position ──────────────────────────────────────
  logoWrapper: "absolute top-6 left-6 z-10",

  // ─── Content ────────────────────────────────────────────
  content: "relative z-10 text-center max-w-lg",

  // ─── 404 badge ──────────────────────────────────────────
  badge: "text-[12px] uppercase tracking-[0.16em] text-indigo-300/80 font-medium mb-3",

  // ─── 404 number ─────────────────────────────────────────
  number:
    "text-[120px] sm:text-[160px] leading-none font-semibold tracking-tighter bg-clip-text text-transparent bg-[linear-gradient(180deg,#fff_30%,rgba(255,255,255,0.2))] mb-6",

  // ─── Title ──────────────────────────────────────────────
  title: "text-xl sm:text-2xl font-semibold tracking-tight mb-2.5",

  // ─── Description ────────────────────────────────────────
  description: "text-white/55 mb-8",

  // ─── Button group ───────────────────────────────────────
  buttonGroup: "flex flex-col sm:flex-row gap-3 justify-center",

  // ─── Primary button (Home) ─────────────────────────────
  primaryButton:
    "inline-flex items-center justify-center rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 gap-2 px-5 py-2.5 text-[13px]",

  // ─── Secondary button (Go back) ────────────────────────
  secondaryButton:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-[13px] font-semibold transition",

  // ─── Icons ──────────────────────────────────────────────
  icon: "w-4 h-4",
};

// src/assets/dummyStyles.js – append this export

export const previewPageStyles = {
  // ─── Loading ──────────────────────────────────────────────
  loadingSpinner: "w-6 h-6 animate-spin text-indigo-300 mb-3",

  // ─── Error ────────────────────────────────────────────────
  errorTitle: "text-red-400 mb-3",
  errorMessage: "text-white/55 text-[13px]",
  errorButton:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 mt-5 px-4 py-2 text-[13px]",

  // ─── Main container ──────────────────────────────────────
  container: "flex flex-col h-screen bg-[#08090a] text-white",

  // ─── Header ──────────────────────────────────────────────
  header: "bg-[#0a0b0c] border-b border-white/6 px-4 py-2.5 flex items-center gap-4",
  backLink: "flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition",
  backIcon: "w-4 h-4",
  logoWrapper: "hidden md:block",
  projectInfo: "flex-1 min-w-0 text-center",
  projectName: "text-[13px] font-semibold text-white truncate",
  projectAuthor: "text-[11px] text-white/45 truncate",
  actions: "flex items-center gap-2",
  viewsBadge: "hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/6 bg-white/3 text-[12px] text-white/70",
  viewsIcon: "w-3.5 h-3.5",
  likeButton: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/8 bg-white/3 hover:bg-white/7 text-[13px] font-medium text-white/85 transition disabled:opacity-60",
  likeIcon: "w-3.5 h-3.5 text-pink-300",

  // ─── Preview area ────────────────────────────────────────
  previewArea: "flex-1 bg-[#0a0b0c]",
  iframe: "w-full h-full border-0 bg-white",

  // ─── Empty state ────────────────────────────────────────
  emptyContainer: "h-full flex flex-col items-center justify-center text-white/55",
  emptyIcon: "w-8 h-8 text-white/30 mb-3",
};

// src/assets/dummyStyles.js – append this export

export const pricingPageStyles = {
  // ─── Page container ──────────────────────────────────────
  container: "min-h-screen bg-[#08090a] text-white",

  // ─── Hero section ────────────────────────────────────────
  hero: "relative pt-32 pb-10 px-4 text-center overflow-hidden",
  heroBg: "absolute inset-0 pointer-events-none",
  heroBgStyle: {
    background:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,138,76,0.22) 0%, rgba(255,92,92,0.14) 30%, transparent 65%)",
  },
  heroInner: "relative",
  heroBadge: "text-[12px] uppercase tracking-[0.16em] text-indigo-300/80 font-medium mb-3",
  heroTitle: "text-4xl sm:text-6xl font-semibold tracking-[-0.03em] mb-4",
  heroTitleBr: "sm:hidden",
  heroSub: "text-white/55 max-w-xl mx-auto",

  // ─── StripeReturnBanner ──────────────────────────────────
  bannerBase: "max-w-3xl mx-4 sm:mx-auto mt-6 mb-2 p-4 rounded-xl border",
  bannerCancelled:
    "border-amber-500/30 bg-amber-500/10 text-[13px] text-amber-200 flex items-start gap-2",
  bannerVerifying:
    "border-indigo-500/30 bg-indigo-500/10 text-[13px] text-indigo-200",
  bannerError:
    "border-red-500/30 bg-red-500/10 text-[13px] text-red-200 flex items-start gap-2",
  bannerSuccess:
    "border-emerald-500/30 bg-emerald-500/10 text-[13.5px] text-emerald-200 flex items-start gap-2",
  bannerIcon: "w-4 h-4 mt-0.5 shrink-0",
  bannerIconSuccess: "w-4 h-4 mt-0.5 shrink-0 text-emerald-300",
  bannerBodySuccess: "font-semibold text-white",
  bannerBodySuccessSub: "text-emerald-200/80 mt-0.5",

  // ─── FAQ section ─────────────────────────────────────────
  faqSection: "py-20 px-4 border-t border-white/6",
  faqContainer: "max-w-3xl mx-auto",
  faqHeading: "text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-10",
  faqList: "space-y-2",
  faqItem: "group p-5 rounded-xl border border-white/8 bg-[#0c0d0f]",
  faqSummary:
    "flex items-center justify-between cursor-pointer text-white font-semibold text-[14px] list-none",
  faqPlus: "text-indigo-300 text-xl transition-transform group-open:rotate-45",
  faqAnswer: "mt-3 text-[13px] text-white/60 leading-relaxed",

  // ─── Pricing component ───────────────────────────────────
  pricingSection: "relative py-24 px-4",
  pricingSectionWithBorder: "border-t border-white/6",
  pricingContainer: "max-w-5xl mx-auto",
  pricingHeader: "text-center mb-10",
  pricingHeaderBadge: "text-[12px] uppercase tracking-[0.16em] text-indigo-300/80 font-medium mb-3",
  pricingHeaderTitle: "text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-3",
  pricingHeaderSub: "text-white/55 max-w-lg mx-auto",

  // ─── FreeBanner ──────────────────────────────────────────
  freeBanner:
    "relative rounded-2xl border border-indigo-500/25 bg-[linear-gradient(180deg,rgba(99,102,241,0.10),rgba(99,102,241,0.02))] p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between",
  freeBannerLeft: "flex items-center gap-3",
  freeBannerIconBox:
    "w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center shrink-0",
  freeBannerIcon: "w-5 h-5",
  freeBannerTitle: "text-[14px] font-semibold text-white",
  freeBannerSub: "text-[12px] text-white/55",
  freeBannerButton:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 px-5 py-2.5 text-[13px] shrink-0",

  // ─── Warnings & errors ───────────────────────────────────
  configWarning:
    "mb-6 rounded-xl border border-amber-500/30 bg-amber-500/6 p-4 text-[13px] text-amber-200 flex items-start gap-2.5",
  configWarningIcon: "w-4 h-4 mt-0.5 shrink-0",
  configWarningStrong: "font-semibold",
  configWarningCode: "font-mono text-[12px]",
  errorBox:
    "mb-6 rounded-xl border border-red-500/30 bg-red-500/8 p-4 text-[13px] text-red-300",

  // ─── Loading states ──────────────────────────────────────
  loadingWrapper: "py-16 text-center text-[13px] text-white/55",
  loadingSpinner: "w-5 h-5 animate-spin inline mr-2 text-indigo-300",
  loadError: "py-12 text-center text-[13px] text-red-300",

  // ─── Package grid ────────────────────────────────────────
  packageGrid: "grid grid-cols-1 md:grid-cols-3 gap-4 mt-6",
  packageFooter: "text-center text-[12px] text-white/35 mt-8",

  // ─── PackageCard ─────────────────────────────────────────
  cardBase: "relative rounded-2xl p-6 flex flex-col",
  cardHighlighted:
    "border border-indigo-500/40 bg-[linear-gradient(180deg,rgba(94,106,210,0.12),rgba(94,106,210,0.02))] shadow-[0_0_0_1px_rgba(94,106,210,0.2),0_30px_60px_-30px_rgba(94,106,210,0.5)]",
  cardNormal: "border border-white/8 bg-[#0c0d0f]",
  popularBadge:
    "absolute -top-2.5 left-6 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-semibold uppercase tracking-widest",
  packageName: "text-[15px] font-semibold text-white",
  packageTagline: "text-[12px] text-white/50 mt-0.5 mb-5",
  priceRow: "flex items-end gap-1 mb-1",
  price: "text-3xl font-semibold text-white tracking-tight",
  priceSuffix: "text-[12px] text-white/45 mb-1.5",
  perCredit: "text-[12px] text-white/55 mb-5",
  featureList: "space-y-2.5 text-[13px] text-white/70 mb-6",
  featureItem: "flex items-start gap-2",
  featureIcon: "w-4 h-4 mt-0.5 shrink-0 text-indigo-300",
  featureText: "font-semibold text-white",
  buyButton:
    "mt-auto w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed",
  buyButtonHighlighted:
    "text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0",
  buyButtonNormal:
    "bg-white/6 hover:bg-white/10 text-white border border-white/8",
  buySpinner: "w-3.5 h-3.5 animate-spin",
};

// src/assets/dummyStyles.js – append this export

export const registerPageStyles = {
  // ─── Form ──────────────────────────────────────────────
  form: "space-y-4",

  // ─── Submit error ──────────────────────────────────────
  submitError: "text-[12px] text-red-400 -mt-1",

  // ─── Submit button ─────────────────────────────────────
  submitButton:
    "w-full py-2.5 rounded-lg text-[14px] font-semibold bg-white text-black hover:bg-white/90 transition disabled:opacity-60",

  // ─── Info boxes ────────────────────────────────────────
  infoBox:
    "p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/6 text-[12px] text-indigo-200/90 space-y-1.5",
  infoRow: "flex items-center gap-2",
  infoDotIndigo: "inline-block w-1.5 h-1.5 rounded-full bg-indigo-400",
  infoDotEmerald: "inline-block w-1.5 h-1.5 rounded-full bg-emerald-400",
  infoHighlight: "font-semibold text-white",

  // ─── Footer link ──────────────────────────────────────
  signInLink: "text-white font-semibold hover:underline underline-offset-4",
};

// src/assets/dummyStyles.js – append this export

export const settingsPageStyles = {
  // ─── Page container ──────────────────────────────────────
  container: "min-h-screen bg-[#08090a] text-white",
  main: "pt-24 pb-20 px-4",
  inner: "max-w-3xl mx-auto",

  // ─── Page header ────────────────────────────────────────
  pageHeader: "mb-8",
  pageTitle: "text-2xl sm:text-3xl font-semibold tracking-tight",
  pageSub: "text-[14px] text-white/55 mt-1.5",

  // ─── Settings rows container ────────────────────────────
  rowsContainer: "space-y-5",

  // ─── SettingsRow component ──────────────────────────────
  rowCard: "rounded-xl border border-white/8 bg-[#0c0d0f] overflow-hidden",
  rowInner: "px-6 pt-6 pb-5",
  rowTitle: "text-[16px] font-semibold text-white",
  rowDesc: "text-[13px] text-white/55 mt-1",
  rowChildren: "mt-5",
  rowFooter: "px-6 py-3 bg-white/2 border-t border-white/6 flex items-center justify-between gap-3",
  rowHintMuted: "text-[12px] text-white/45",
  rowHintError: "text-[12px] text-red-400",
  rowHintOk: "text-[12px] text-emerald-300",
  rowSaveButton:
    "px-4 py-1.5 rounded-md bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition disabled:opacity-60",

  // ─── Email section ──────────────────────────────────────
  emailCard: "rounded-xl border border-white/8 bg-[#0c0d0f] px-6 py-6",
  emailTitle: "text-[16px] font-semibold text-white",
  emailDesc: "text-[13px] text-white/55 mt-1",
  emailWrapper: "relative mt-5",
  emailInput:
    "w-full px-3 py-2.5 pr-10 rounded-lg bg-white/3 border border-white/8 text-[14px] text-white/45 cursor-not-allowed",
  emailLock: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30",

  // ─── Delete section ──────────────────────────────────────
  deleteCard:
    "rounded-xl border border-red-500/30 bg-[linear-gradient(180deg,rgba(239,68,68,0.06),rgba(239,68,68,0.02))] overflow-hidden",
  deleteInner: "px-6 pt-6 pb-5 flex items-start gap-3",
  deleteIcon: "w-5 h-5 text-red-400 mt-0.5 shrink-0",
  deleteTitle: "text-[16px] font-semibold text-white",
  deleteDesc: "text-[13px] text-white/55 mt-1",
  deleteFooter: "px-6 py-3 bg-red-500/4 border-t border-red-500/20 flex items-center justify-end gap-2",
  deleteCancel:
    "px-4 py-1.5 rounded-md text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/5 transition",
  deleteConfirm:
    "px-4 py-1.5 rounded-md bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold transition disabled:opacity-60",
  deleteTrigger:
    "px-4 py-1.5 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-[13px] font-semibold transition",
};

// src/assets/dummyStyles.js – append this export

export const verifyEmailPageStyles = {
  // ─── Verified state ──────────────────────────────────────
  verifiedContainer: "flex flex-col items-center text-center py-4",
  verifiedIconWrapper:
    "w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mb-4",
  verifiedIcon: "w-7 h-7 text-emerald-300",
  verifiedTitle: "text-[15px] font-semibold text-white mb-1",
  verifiedSub: "text-[13px] text-white/60",

  // ─── Form ────────────────────────────────────────────────
  form: "space-y-4",

  // ─── OTP input override ──────────────────────────────────
  otpInput: "text-center tracking-[0.5em] text-lg font-semibold",

  // ─── Submit button ──────────────────────────────────────
  submitButton:
    "w-full py-2.5 rounded-lg text-[14px] font-semibold bg-white text-black hover:bg-white/90 transition disabled:opacity-60",

  // ─── Resend row ──────────────────────────────────────────
  resendRow: "flex items-center justify-between text-[12px] text-white/55 pt-1",
  resendLeft: "inline-flex items-center gap-1.5",
  resendIcon: "w-3.5 h-3.5",
  resendButton:
    "text-white font-semibold hover:underline underline-offset-4 disabled:no-underline disabled:text-white/40 disabled:cursor-not-allowed",

  // ─── Footer link ────────────────────────────────────────
  signUpLink: "text-white font-semibold hover:underline underline-offset-4",
};

// src/assets/dummyStyles.js – append this export

export const githubModalStyles = {
  // ─── Modal overlay ──────────────────────────────────────────
  overlay: "fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",
  modal: "relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0c0d0f] shadow-2xl shadow-black/60 overflow-hidden",

  // ─── Close button ──────────────────────────────────────────
  closeButton: "absolute top-3 right-3 p-1.5 rounded-md text-white/55 hover:text-white hover:bg-white/5 transition z-10",

  // ─── Modal header ──────────────────────────────────────────
  header: "shrink-0 px-6 pt-6 pb-4 border-b border-white/6 flex items-center gap-3",
  headerIconWrapper: "w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center",
  headerIcon: "w-4.5 h-4.5 text-white",
  headerTitle: "text-[16px] font-semibold text-white",
  headerSub: "text-[12px] text-white/55",

  // ─── Form container ────────────────────────────────────────
  form: "p-6 space-y-4",

  // ─── Info box ──────────────────────────────────────────────
  infoBox: "rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-[12px] text-white/75 leading-relaxed",
  infoTitle: "font-semibold text-white mb-1",
  infoList: "space-y-1 text-white/65",
  code: "text-white/85 px-1 rounded bg-white/6 text-[11px]",

  // ─── Visibility buttons ────────────────────────────────────
  visibilityGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3",
  visibilityBtn: (active: boolean) =>
    `flex items-start gap-2.5 text-left p-3 rounded-lg border transition ${
      active ? "border-indigo-500/50 bg-indigo-500/8" : "border-white/8 bg-white/2 hover:bg-white/4"
    }`,
  visibilityIcon: "w-4 h-4 mt-0.5 text-indigo-300",
  visibilityLabel: "text-[13px] font-semibold text-white",
  visibilitySub: "text-[11px] text-white/55",

  // ─── Checkbox ──────────────────────────────────────────────
  checkbox: (size: string) => `flex items-center gap-2 ${size} cursor-pointer select-none`,
  checkboxInput: "w-4 h-4 accent-indigo-500",

  // ─── Error box ─────────────────────────────────────────────
  errorBox: "rounded-lg border border-red-500/30 bg-red-500/6 p-3 text-[12px] text-red-300 flex items-start gap-2",
  errorIcon: "w-4 h-4 mt-0.5 shrink-0",

  // ─── Submit button ─────────────────────────────────────────
  submitButton:
    "inline-flex items-center justify-center rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 w-full gap-2 py-2.5 text-[13px]",
  submitSpinner: "w-4 h-4 animate-spin",

  // ─── Success state ─────────────────────────────────────────
  successContainer: "p-6 space-y-4",
  successBox: "rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-4 flex items-start gap-2.5",
  successIcon: "w-5 h-5 mt-0.5 shrink-0 text-emerald-300",
  successTitle: "text-[14px] font-semibold text-white",
  successSub: "text-[12px] text-emerald-200/80 mt-0.5",

  // ─── Result link ───────────────────────────────────────────
  cardLink: "flex items-center justify-between gap-3 p-3 rounded-lg border transition",
  cardLinkDefault: "border-white/8 bg-white/2 hover:bg-white/5",
  cardLinkIndigo: "border-indigo-500/30 bg-indigo-500/6 hover:bg-indigo-500/10",
  linkIcon: "w-4 h-4 shrink-0",
  linkIconDefault: "text-white/55",
  linkIconIndigo: "text-indigo-300",
  linkLabelDefault: "text-white/55",
  linkLabelIndigo: "text-indigo-200/80",
  linkValue: "text-[13px] font-medium text-white truncate",
  externalIcon: "w-4 h-4 shrink-0",

  
  // ─── Scroll container ──────────────────────────────────────
  scrollContainer: "flex-1 overflow-y-auto",

  // ─── Result link content row ──────────────────────────────
  resultLinkContent: "flex items-center gap-2.5 min-w-0",

  // ─── Checkbox sizes ──────────────────────────────────────
  checkboxSizeLarge: "text-[13px] text-white/80",
  checkboxSizeSmall: "text-[12px] text-white/55",

  // ─── Inline link (underline) ─────────────────────────────
  inlineLink: "underline text-white/70 hover:text-white",

  // ─── Done button ───────────────────────────────────────────
  doneButton:
    "w-full py-2.5 rounded-lg bg-white/6 hover:bg-white/10 border border-white/8 text-[13px] font-semibold text-white transition",
};

// src/assets/dummyStyles.js – append this export

export const vercelModalStyles = {
  // ─── Overlay & Modal ──────────────────────────────────────
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4",
  modal: "bg-[#0c0d0f] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 relative",

  // ─── Close button ──────────────────────────────────────────
  closeButton:
    "absolute top-3 right-3 p-1.5 rounded-md text-white/55 hover:bg-white/5 hover:text-white transition disabled:opacity-40",
  iconSm: "w-4 h-4",
  iconXs: "w-3.5 h-3.5",
  iconMd: "w-5 h-5",

  // ─── Header ────────────────────────────────────────────────
  headerRow: "flex items-center gap-2.5 mb-1.5",
  headerIconBox: "w-7 h-7 rounded-lg bg-black flex items-center justify-center",
  headerIcon: "w-4 h-4 text-white",
  headerTitle: "text-[16px] font-semibold",
  headerTitleSuccess: "flex items-center gap-1.5",

  // ─── Description text ──────────────────────────────────────
  descText: "text-[12.5px] text-white/55 mb-5 leading-relaxed",
  descTextSuccess: "text-[12.5px] text-white/55 mb-4 leading-relaxed",

  // ─── Inline code ──────────────────────────────────────────
  inlineCode: "text-white/70 px-1 py-0.5 rounded bg-white/5 text-[11px]",

  // ─── Form ──────────────────────────────────────────────────
  form: "space-y-3.5",

  // ─── Form fields ──────────────────────────────────────────
  label: "block text-[12px] font-medium text-white/75 mb-1.5",
  field:
    "w-full px-3 py-2 rounded-lg bg-white/4 border border-white/10 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/25",
  fieldMono: "font-mono",
  hint: "text-[11px] text-white/40 mt-1.5",
  inlineLink: "text-indigo-300 hover:text-indigo-200 underline",

  // ─── Checkbox ──────────────────────────────────────────────
  checkboxWrapper:
    "flex items-center gap-2 text-[12px] text-white/60 cursor-pointer select-none",
  checkboxInput: "w-3.5 h-3.5 accent-indigo-500",

  // ─── Error box ─────────────────────────────────────────────
  errorBox:
    "px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/8 text-[12px] text-red-200",

  // ─── Submit button ─────────────────────────────────────────
  submitButton:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 w-full px-4 py-2.5 text-[13.5px]",
  submitSpinner: "w-4 h-4 animate-spin",

  // ─── Success view ──────────────────────────────────────────
  successIconBox:
    "w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center",
  successIcon: "w-4 h-4 text-emerald-300",
  successSparkle: "w-4 h-4 text-emerald-300",

  // ─── URL box ──────────────────────────────────────────────
  urlBox:
    "px-3 py-2 rounded-lg bg-white/4 border border-white/10 flex items-center gap-2 mb-4",
  urlText: "flex-1 text-[12px] text-white truncate",

  // ─── Icon buttons (copy/open) ────────────────────────────
  iconButton:
    "p-1.5 rounded-md text-white/55 hover:bg-white/5 hover:text-white transition",

  // ─── QR code ──────────────────────────────────────────────
  qrImage: "w-[180px] h-[180px] rounded-lg border border-white/10",

  // ─── Status text ──────────────────────────────────────────
  statusText: "text-[11px] text-amber-300/80 text-center mb-3",

  // ─── Done button ──────────────────────────────────────────
  doneButton:
    "w-full px-4 py-2 rounded-lg border border-white/10 bg-white/4 hover:bg-white/8 text-[13px] text-white/85 transition",
};

// src/assets/dummyStyles.js – append this export

export const authShellStyles = {
  // ─── Page container ──────────────────────────────────────
  container: "relative min-h-screen flex flex-col bg-[#08090a] text-white overflow-hidden",

  // ─── Header ──────────────────────────────────────────────
  header: "relative px-6 py-5 flex items-center justify-between",

  // ─── Back home link ──────────────────────────────────────
  backLink: "flex items-center gap-1 text-[13px] text-white/55 hover:text-white transition",
  backIcon: "w-3.5 h-3.5",

  // ─── Main content ────────────────────────────────────────
  main: "relative flex-1 flex items-start sm:items-center justify-center px-4 pb-12",

  // ─── Inner wrapper ──────────────────────────────────────
  inner: "w-full max-w-md",

  // ─── Card ────────────────────────────────────────────────
  card: "rounded-2xl border border-white/8 bg-[#0c0d0f]/80 backdrop-blur-xl p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]",

  // ─── Title ──────────────────────────────────────────────
  title: "text-[22px] font-semibold tracking-tight text-white",

  // ─── Subtitle ────────────────────────────────────────────
  subtitle: "text-[13px] text-white/55 mt-1.5 mb-6",

  // ─── Footer ──────────────────────────────────────────────
  footer: "mt-5 text-center text-[13px] text-white/55",
};

// src/assets/dummyStyles.js – append this export

export const footerStyles = {
  // ─── Footer container ────────────────────────────────────
  footer: "border-t border-white/6 px-4 py-10",

  // ─── Inner wrapper ──────────────────────────────────────
  inner: "max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6",

  // ─── Brand section ──────────────────────────────────────
  brand: "text-center md:text-left",
  brandText: "mt-3 text-[13px] text-white/55",

  // ─── Navigation links ──────────────────────────────────
  nav: "flex items-center gap-6 text-[13px] text-white/60",
  navLink: "hover:text-white transition",

  // ─── Copyright ──────────────────────────────────────────
  copyright:
    "max-w-6xl mx-auto mt-8 pt-6 border-t border-white/6 text-center text-[12px] text-white/45",
};

// src/assets/dummyStyles.js – append this export

export const navbarStyles = {
  // ─── Navbar root ─────────────────────────────────────────
  root: "fixed top-0 inset-x-0 z-50 bg-[#08090a]/80 backdrop-blur-xl border-b border-white/6",

  // ─── Container (inner) ──────────────────────────────────
  container: "relative max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between",

  // ─── Desktop center links ──────────────────────────────
  centerLinks:
    "hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1",

  // ─── NavLink base (shared) ─────────────────────────────
  navLinkBase: "px-3.5 py-1.5 text-[13px] font-medium rounded-md transition-colors",

  // ─── NavLink active / inactive ─────────────────────────
  navLinkActive: "text-white",
  navLinkInactive: "text-white/55 hover:text-white",

  // ─── Desktop right side ────────────────────────────────
  desktopRight: "hidden md:flex items-center gap-3",

  // ─── Sign in link (desktop) ────────────────────────────
  signInLink: "text-[13px] font-medium text-white/70 hover:text-white px-3 py-1.5",

  // ─── Primary button (reusable) ─────────────────────────
  btnPrimary:
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-zinc-950 font-bold tracking-tight bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 shadow-[0_10px_30px_-8px_rgba(255,138,76,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition",

  // ─── Hamburger button ──────────────────────────────────
  hamburger: "md:hidden p-2 text-white/70 hover:text-white",
  hamburgerIcon: "w-5 h-5",

  // ─── Mobile menu ────────────────────────────────────────
  mobileMenu:
    "md:hidden border-t border-white/6 bg-[#08090a]/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-1",

  // ─── Mobile link ────────────────────────────────────────
  mobileLink: "px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/5",

  // ─── Mobile divider ─────────────────────────────────────
  mobileDivider: "pt-2 mt-2 border-t border-white/6 flex flex-col gap-1",

  // ─── Mobile account link ───────────────────────────────
  mobileAccountLink:
    "px-3 py-2 text-sm text-white/70 rounded-lg hover:bg-white/5 flex items-center gap-2",

  // ─── Mobile sign out ────────────────────────────────────
  mobileSignOut:
    "px-3 py-2 text-sm text-white/70 rounded-lg hover:bg-white/5 flex items-center gap-2 text-left",

  // ─── Mobile get started button ─────────────────────────
  mobileGetStarted: "w-full text-sm py-2.5",

  // ─── Icon sizes ─────────────────────────────────────────
  iconSm: "w-3.5 h-3.5",
  iconMd: "w-4 h-4",

  // ─── UserMenu ───────────────────────────────────────────
  userMenuWrapper: "relative flex items-center gap-3",

  // ─── Credits pill ──────────────────────────────────────
  creditsPill:
    "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/3 text-[13px] font-medium text-white hover:bg-white/[0.07] transition",
  creditsIcon: "w-3.5 h-3.5 text-indigo-300",
  creditsLabel: "text-white/70",
  creditsNumber: "tabular-nums",
  plusIcon: "w-3 h-3 text-white/45 ml-0.5",

  // ─── Avatar ─────────────────────────────────────────────
  avatar:
    "w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white text-[12px] font-semibold flex items-center justify-center ring-1 ring-white/10 hover:ring-white/20 transition",

  // ─── Dropdown ───────────────────────────────────────────
  dropdown:
    "absolute right-0 top-12 w-64 rounded-xl border border-white/10 bg-[#0f1011] shadow-xl shadow-black/40 overflow-hidden z-50",

  // ─── Dropdown header ────────────────────────────────────
  dropdownHeader:
    "flex items-center gap-3 px-4 py-3 border-b border-white/5",

  // ─── Dropdown user info ─────────────────────────────────
  dropdownUserInfo: "min-w-0",
  dropdownUserName: "text-[13px] font-semibold text-white truncate",
  dropdownUserEmail: "text-[11px] text-white/50 truncate",

  // ─── Dropdown body ──────────────────────────────────────
  dropdownBody: "p-1.5",

  // ─── Dropdown item ──────────────────────────────────────
  dropdownItem:
    "flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition",

  // ─── Dropdown sign out ──────────────────────────────────
  dropdownSignOut:
    "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition",

  // ─── Account link icon class (indigo) ──────────────────
  accountIconIndigo: "text-indigo-300",
};
// src/assets/dummyStyles.js – append this export

export const protectedRouteStyles = {
  // ─── Loading spinner container ──────────────────────────
  loadingContainer: "flex items-center justify-center min-h-screen bg-[#08090a]",
  loadingSpinner:
    "inline-block rounded-full border-4 border-white/10 border-t-indigo-400 w-9 h-9 animate-spin",
};

// src/assets/dummyStyles.js – append this export

export const scrollToTopStyles = {
  // ─── Floating button ─────────────────────────────────────
  button:
    "fixed right-6 bottom-6 z-50 md:right-8 md:bottom-8 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-linear-to-br from-rose-500 via-orange-500 to-amber-400 text-zinc-950 shadow-xl shadow-orange-500/40 hover:scale-105 transform transition cursor-pointer",

  // ─── Icon ────────────────────────────────────────────────
  icon: "w-5 h-5 md:w-6 md:h-6",
};

// src/assets/dummyStyles.js – append this export

export const sharedUiStyles = {
  // ─── Card ──────────────────────────────────────────────────
  card: "rounded-2xl bg-[#0c0d0f] border border-white/8",
  cardHover: "hover:border-white/16 transition-colors",

  // ─── Logo ──────────────────────────────────────────────────
  logoLink: "flex items-center gap-2 group",
  logoImg: "w-5 h-5",
  logoSpan: "text-[15px] font-semibold tracking-tight text-white",

  // ─── Input ─────────────────────────────────────────────────
  inputLabel: "block text-[13px] font-medium text-white/85 mb-1.5",
  inputWrapper: "relative",
  inputBase:
    "w-full bg-white/3 border rounded-lg px-3 py-2.5 text-[14px] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 transition-all duration-150",
  inputError: "border-red-500/50",
  inputDefault: "border-white/8 hover:border-white/[0.14]",
  inputWithRight: "pr-10",
  inputToggle:
    "absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80 transition",
  inputRightSlot:
    "absolute right-2.5 top-1/2 -translate-y-1/2",
  inputHint: "mt-1.5 text-[12px]",
  inputHintError: "text-red-400",
  inputHintMuted: "text-white/45",

  // ─── ProjectThumbnail ──────────────────────────────────────
  thumbnailWrapper: "relative overflow-hidden bg-[#0f1011]",
  thumbnailLoading:
    "absolute inset-0 flex items-center justify-center text-[11px] text-white/30 bg-[#0f1011] z-10",
  thumbnailIframe: "absolute top-0 left-0 border-0 bg-white",
  thumbnailEmpty:
    "absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/35 text-[11px]",
  thumbnailEmptyIcon: "w-5 h-5",
  thumbnailOverlay: "absolute inset-0 z-20",

  // ─── FullScreenMessage ────────────────────────────────────
  fullScreen:
    "flex flex-col items-center justify-center min-h-screen bg-[#08090a] text-white text-center px-4",

  // ─── PageBackdrop ─────────────────────────────────────────
  backdropGradient: "absolute inset-0 pointer-events-none",
  backdropGrid: "absolute inset-0 pointer-events-none",

  // Style objects (now extracted)
  backdropGradientStyle: {
    background:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,138,76,0.22) 0%, rgba(255,92,92,0.14) 30%, transparent 65%)",
  },
  backdropGridStyle: {
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
    maskImage:
      "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
  },
};