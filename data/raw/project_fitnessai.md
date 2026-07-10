## What it does
FitnessAI is a computer-vision fitness form-checker. It classifies which of three
exercises (squats, bicep curls, shoulder press) a person is performing from live or
uploaded video, and gives real-time posture correction tips based on body pose data —
aimed at catching bad form the way a trainer would, without needing one present.

## My role
Built solo, end to end: collected the training video data myself for all three
exercises, built the pose-to-feature extraction pipeline, trained the classifier, and
built the rule-based correction-tip logic and live video inference.

## Tech stack (current version)
- Pose extraction: MediaPipe + OpenCV — converts raw exercise video into frame-by-frame
  pose landmark data
- Classifier: XGBoost, trained on the extracted frame-wise pose features
- Inference: OpenCV for live video input, frame-by-frame classification
- Feedback: rule-based logic that maps specific pose deviations to posture correction
  tips (e.g. knee alignment, back angle)

## Key results / metrics
- Self-collected dataset across 3 exercise classes (squats, bicep curls, shoulder
  press), converted from raw video into structured per-frame pose feature data via
  MediaPipe.
- Live classification pipeline: webcam/video input → MediaPipe pose extraction →
  XGBoost classification → rule-based correction tip, running frame by frame in
  real time.

## Interesting decisions / tradeoffs
- **MediaPipe over training a custom pose model:** using MediaPipe's pretrained pose
  landmarks as the feature source instead of building pose estimation from scratch
  let the project focus its ML effort on the actual differentiator — classification
  and form feedback — rather than reinventing pose estimation.
- **XGBoost over a deep model for the first version:** with a self-collected dataset
  of limited size, a gradient-boosted tree model on structured landmark features was
  the more data-efficient choice than a neural network — good accuracy without
  needing a huge video dataset.
- **Rule-based correction tips as a deliberate v1 choice:** rules over specific pose
  angles (e.g. knee-over-toe, back curvature) are fully explainable and don't need any
  additional training data — a reasonable tradeoff for a first version, with a known
  ceiling that motivated the planned upgrade below.

## Planned upgrade (in progress / roadmap — worth mentioning if asked "what's next")
- Replacing the frame-by-frame XGBoost classifier with an LSTM to model movement as a
  temporal sequence rather than independent frames, which should better capture
  rep-quality issues that only show up across time (e.g. tempo, incomplete range of
  motion) rather than in a single frame.
- Adding an LLM layer that receives a JSON snapshot of the live prediction every ~5
  seconds and returns a short, natural-language posture correction tip (or other
  relevant coaching feedback) instead of only fixed rule-based messages — same
  "deterministic system produces the signal, LLM explains it in plain language"
  pattern used in ThreatLens and SiliconSeal.

## Links
- GitHub: https://github.com/CommitSaif11/FitnessAI