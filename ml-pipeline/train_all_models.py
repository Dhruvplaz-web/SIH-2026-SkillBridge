"""
================================================================================
SKILLSETU (SIH26044): MASTER TRAINING PIPELINE RUNNER
Trains and cross-validates all 8 Sovereign Machine Learning Engines
================================================================================
"""

import os
import sys
import time
import subprocess

def run_trainer(script_name, description):
    print("\n" + "#" * 80)
    print(f"--> EXECUTING TRAINING FOR: {description} ({script_name})")
    print("#" * 80)
    
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    start_time = time.time()
    
    result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
    duration = time.time() - start_time
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print("[STDERR / WARNINGS]:", result.stderr)
        
    if result.returncode == 0:
        print(f"--> [SUCCESS] Completed in {duration:.2f} seconds\n")
    else:
        print(f"--> [ERROR] Process exited with code {result.returncode}\n")
    return result.returncode == 0

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    print("\n" + "=" * 80)
    print("      SKILLSETU (SIH26044): FULL SOVEREIGN ML ENGINE TRAINING SUITE")
    print("      8 Pure-Coded & Trained Machine Learning Models")
    print("=" * 80)

    trainers = [
        ("train_retention_xgboost.py", "1. Candidate Retention & Offer Predictor (XGBoost)"),
        ("train_ats_bm25.py", "2. Hybrid Lexical-Semantic ATS Matcher (Okapi BM25)"),
        ("train_fraud_isolation_forest.py", "3. Employment Scam Sentinel (Isolation Forest)"),
        ("train_skill_ner.py", "4. Sovereign Skill Extractor (BIO Token Classifier)"),
        ("train_shortage_forecaster.py", "5. National Skill-Shortage Forecaster (VAR)"),
        ("train_certificate_verifier.py", "6. Credential Anti-Forgery Sentinel (Shannon Entropy)"),
        ("train_curriculum_vectorizer.py", "7. Curriculum Topic Gap Vectorizer (N-Gram Jaccard)"),
        ("train_interview_evaluator.py", "8. Interview Speech NLP Evaluator (TTR & Concept Matrix)"),
    ]

    total_start = time.time()
    success_count = 0

    for script, desc in trainers:
        ok = run_trainer(script, desc)
        if ok:
            success_count += 1

    total_duration = time.time() - total_start
    print("=" * 80)
    print(f"MASTER TRAINING SUMMARY: {success_count}/{len(trainers)} Models Successfully Trained & Verified")
    print(f"Total Pipeline Duration: {total_duration:.2f} seconds")
    print("All Model Artifacts Exported to: ml-pipeline/model_artifacts/")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
