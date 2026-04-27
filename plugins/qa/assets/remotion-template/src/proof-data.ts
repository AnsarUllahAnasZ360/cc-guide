export const proofData = {
  title: "QA verification",
  statusLabel: "recorded",
  verdict: "pending",
  durationInFrames: 1050,
  fps: 30,
  screenshots: [],
  walkthrough: null,
  walkthroughVideo: null,
  walkthroughFrames: [],
  walkthroughFrameFps: 6,
  recordingSource: null,
  walkthroughDurationSeconds: 0,
  timing: {
    introSeconds: 14,
    walkthroughSeconds: 300,
    outroSeconds: 14,
    targetProofVideoSeconds: {
      min: 300,
      max: 600
    },
    smokeMode: false,
    durationOverrideSeconds: null
  },
  proofVideoPolicy: {
    primaryEvidence: "browser-walkthrough-recording",
    screenshotRole: "supporting-chapter-evidence",
    requiresPassingVerdict: true,
    requiresWalkthroughRecording: true,
    allowNonPassingReport: false,
    cleanGates: false,
    passingVerdict: false
  },
  gates: {},
  hasAudio: false,
  narrationSegments: [] as Array<{
    startSeconds: number;
    chapter: string;
    text: string;
    file: string;
  }>,
  routesTested: [],
  commandsRun: [],
  checks: [],
  blockers: [],
  reportSummary: ""
} as const;
