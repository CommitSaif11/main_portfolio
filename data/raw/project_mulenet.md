## What it does
MuleNet is a fraud intelligence platform for banks that detects mule accounts (accounts
used to launder or move fraudulent funds). It ingests transaction/account data, scores
every account for fraud risk, classifies the type of mule typology involved, and gives
investigators a SHAP-based explanation for every flagged account through a live
dashboard and API.

## My role
Built solo. Designed and implemented the full ML pipeline (feature engineering, model
training/ensembling, evaluation), the explainability layer, the FastAPI scoring API,
and the React dashboard.

## Tech stack
- Backend: FastAPI, Python
- ML: LightGBM, XGBoost, Random Forest, Isolation Forest, KMeans, Scikit-learn,
  imbalanced-learn
- Explainability: SHAP
- Frontend: React, Vite, Tailwind CSS, Recharts

## Key results / metrics
- AUC-ROC: 99.1% ± 0.5% (5-fold cross-validation)
- Precision (fraud class): 98.7% ± 2.7%
- Recall (fraud class): 72.8% ± 8.6%
- AUC-PR: 92.9% ± 4.2%
- 96.3% detection rate on High/Critical risk accounts (78 of 81)
- Live single-account scoring API responds in under 50ms
- No synthetic data used in test sets — evaluation is on real held-out data

## Interesting decisions / tradeoffs
- **Ensemble over a single model:** the pipeline combines LightGBM and XGBoost (for
  supervised fraud classification) with Isolation Forest and KMeans (for unsupervised
  anomaly/typology detection), rather than relying on one model type. Supervised
  models are strong when labeled fraud patterns exist; the unsupervised layer helps
  catch novel mule typologies that don't match historical labels.
- **Precision vs. recall tradeoff is deliberate:** precision (98.7%) is prioritized
  over recall (72.8%) because in a real banking fraud-ops context, false positives
  mean wasted investigator time and customer friction, while the High/Critical bucket
  still catches 96.3% of the accounts that matter most — the system is tuned to be
  trusted, not just maximally sensitive.
- **SHAP for every flagged account, not just model-level explainability:** each
  individual account gets its own explanation, since the audience (bank
  investigators/compliance) needs to justify a flag for reporting purposes, not just
  see aggregate feature importance.
- **Sub-50ms live scoring:** achieved by pre-training and serializing all models to
  `.pkl` files ahead of time, so the live `/api/score/live` endpoint only does
  inference, not training or heavy feature computation, on the request path.
- **Mule typology classification (4 types)** on top of a single risk score, so
  investigators get a "what kind of mule pattern is this" answer, not just a
  fraud/not-fraud binary.

## Links
- GitHub: https://github.com/CommitSaif11/Bank_Mule_Detection
- Live Demo: https://mulenet-dashboard.onrender.com/