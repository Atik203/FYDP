# Experiment report template

Copy this file to `<experiment-id>/README.md` when a run finishes, fill every section, and add the artifact files under `<experiment-id>/artifacts/`. Keep the index at the top so a teammate can jump to any section. Delete the guidance in italics.

**Status: ⬜ PASS / ❌ FAIL / ⚠️ PARTIAL** · Run date: **<YYYY-MM-DD>** (<HH:MM UTC>) · Phase <N> · <blueprint reference>

## Index

1. [Objective](#1-objective)
2. [Result summary](#2-result-summary)
3. [Environment and hardware](#3-environment-and-hardware)
4. [Models served](#4-models-served)
5. [Configuration used](#5-configuration-used)
6. [Process](#6-process)
7. [Measurements](#7-measurements)
8. [Issues found and fixes](#8-issues-found-and-fixes)
9. [Cost](#9-cost)
10. [Artifacts](#10-artifacts)
11. [Next steps](#11-next-steps)

---

## 1. Objective

*What question this run answers, which gate/phase it serves, and the exact pass criterion decided BEFORE running.*

## 2. Result summary

*Pass/fail table with the headline numbers (runs, completions, failures). One-sentence verdict.*

## 3. Environment and hardware

*Provider + instance id, GPU + driver, CPU/RAM/disk, OS/Python, vLLM version, transformers version, observed GPU memory and utilization.*

## 4. Models served

*Agent → checkpoint → quant → port → gpu_memory_utilization, plus the exact serve commands used.*

## 5. Configuration used

*Rounds, max_model_len, output caps, HF_HOME, dataset + revision, seeds, sample caps.*

## 6. Process

*Numbered commands, exactly as run, so anyone can reproduce.*

## 7. Measurements

### 7.1 <volume metrics>
### 7.2 <per-agent behaviour>
### 7.3 <timing distribution>
### 7.4 <artifact schema>
### 7.5 <known quirks>

## 8. Issues found and fixes

*Table: issue → root cause → fix (with commit). This is the most valuable section for the next run.*

## 9. Cost

*Provider invoice line items, not estimates. State the lesson (what dominated the bill).*

## 10. Artifacts

*Links to every file in `artifacts/` with one-line descriptions and sizes.*

## 11. Next steps

*What follows from this run: code items, next experiment, compute/budget estimate.*
