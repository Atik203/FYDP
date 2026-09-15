# Image Generation Prompts — Journal Figures (Gemini / Nano Banana)

Copy each prompt below into Gemini image generation. One figure per prompt. The prompts follow the visual style of Figure 1 (`methodology-flow.jpg`): flat vector infographic, white background, rounded cards, numbered circles, navy arrows.

## How to use

1. Open Gemini and paste one prompt block at a time.
2. Generate at the stated aspect ratio and size. Export the result as PNG at high resolution (ideally 300 dpi, at least 1920 px on the long side).
3. Check every label spelling. Fix one label with: `Keep everything else the same. Only fix the label "WRONG TEXT" to "RIGHT TEXT".`
4. Remove unwanted extra elements with: `Remove everything that is not listed in the prompt. Keep the layout and labels unchanged.`
5. Save files with the names below and send them for insertion into the paper.

Suggested file names:

| File | Figure |
| --- | --- |
| `fig-dataflow.png` | Data flow diagram |
| `fig-round-loop.png` | Round loop diagram |
| `fig-context.png` | Context diagram |
| `fig-pipeline.png` | Pipeline overview (Figure 1 refresh) |
| `fig-trust-detail.png` | Trust update detail (optional) |
| `fig-claim-example.png` | Claim verification example (optional) |

## Gemini / Nano Banana prompting tips

- Describe one flat vector infographic. Do not use photorealistic words (`photo`, `realistic`, `3D`, `render`).
- Put every label in double quotes exactly as it must appear. Keep each label to 1 to 4 words.
- Always state the aspect ratio and pixel size in the prompt, for example `16:9 landscape, 1920x1080 pixels`.
- Give hex color codes instead of color names. Gemini follows hex codes more reliably.
- State the reading order (left to right, top to bottom, clockwise) and the arrow directions.
- State the background (`pure white`) and the outline style (`uniform 2 px navy outlines`).
- Image models can garble long text and math symbols. Keep formulas short. If a formula comes out wrong, ask for the box title only and tell me the empty box position. I will overlay the formula in LaTeX.
- If a label is misspelled, use an edit instruction instead of regenerating the whole image.
- Ask for `publisher-quality academic figure` to move the style toward a clean paper figure.

## Shared style sheet (matches Figure 1)

- Background: pure white `#FFFFFF`
- Card body: light gray `#F8FAFC`, light blue `#EEF2FF`, or light teal `#ECFDF5`
- Primary blue (headers, arrows): `#1E40AF`
- Teal (second-half stages, evaluation strip): `#0F766E`
- Amber (pipeline strip, injection box): `#B45309`
- Green (supported): `#15803D`
- Red (contradicted): `#B91C1C`
- Orange-brown (contested): `#B45309`
- Gray (unverifiable, neutral text): `#475569`
- Near-black (main text): `#0A0A0A`
- Shapes: rounded rectangles with 2 px outlines, numbered dark-navy circles (18 px radius) at the top-left of each card, thick navy arrows
- Font: bold clean sans-serif, high legibility for print

---

## 1. Data Flow Diagram prompt

Purpose: replaces `data-flow.png` in the paper; shows the seven processes, the external entities, and the three data stores.

Aspect ratio and size: `16:9 landscape, 1920x1080 pixels`, pure white background.

```
Create a flat vector infographic of a level-one data flow diagram for an academic paper. Use a pure white background, bold clean sans-serif labels, rounded rectangles with 2 px outlines, and thick navy arrows. Use the palette: navy blue #1E40AF for process cards in the top row, teal #0F766E for process cards in the bottom row, light gray #F8FAFC for card bodies, near-black #0A0A0A for text, gray #475569 for data stores, amber #B45309 for the injection note. Draw the flow in an S-shape: the top row reads left to right, then a thick curved arrow leads down to the bottom row, and the bottom row reads left to right.

Top row, left to right, four process cards, each with a numbered dark-navy circle:
1. "P1 Intake and Gate"
2. "P2 Debate Orchestration"
3. "P3 Claim Decomposition"
4. "P4 Retrieval and Verification"

Bottom row, left to right, three process cards, each with a numbered dark-navy circle:
5. "P5 Trust Update"
6. "P6 Weighted Aggregation"
7. "P7 Result Packaging"

Add four external entities as sharp-corner rectangles with double outlines:
- Top left: "Evaluation Harness" with the second line "GPQA · MMLU-Pro"
- Top right: "User / Researcher"
- Bottom left: "Evidence Sources" with the second line "PubMed · arXiv · Semantic Scholar"
- Bottom right: "Model Serving" with the second line "vLLM + 3 LLMs"

Add three data stores as open cylinders:
- "D1 Debate State" in the center
- "D2 Evidence and Verdict Log" below center left
- "D3 Results Log" below center right

Draw labeled arrows between the elements. Use these exact arrow labels, each written once and kept short:
"question", "debate = yes", "positions", "atomic claims", "verdicts", "trust updates", "answer", "log", "result package", "queries", "passages", "inference requests", "responses", "state".

Keep the layout clean with even spacing and no overlapping shapes. Do not add extra icons, people, robots, shadows, gradients, textures, watermarks, or any text that is not listed above.
```

---

## 2. Round Loop Diagram prompt

Purpose: shows one debate round as a cycle and where the injection point sits.

Aspect ratio and size: `4:3 landscape, 1600x1200 pixels`, pure white background.

```
Create a flat vector infographic of a circular process loop for an academic paper. Use a pure white background, bold clean sans-serif labels, rounded cards with 2 px outlines, and thick navy arrows that bend along a circle. Use the palette: navy blue #1E40AF, teal #0F766E, amber #B45309, green #15803D, red #B91C1C, light gray #F8FAFC, near-black #0A0A0A.

Arrange six nodes clockwise around a large circle, each node is a rounded card with a numbered dark-navy circle:
1. "Round t positions", inside the card show three small agent chips labeled "A", "B", "C"
2. "Claim decomposition", second line "atomic factual claims"
3. "Source-partitioned retrieval", show three small chips labeled "PubMed", "arXiv", "Semantic Scholar"
4. "Evidence verdicts", show four small pills labeled "Supported" in green, "Contradicted" in red, "Unverifiable" in gray, "Contested" in amber
5. "Trust update", second line "bounded 0.1 to 0.9"
6. "Revision", second line "peers + own trust"

In the center of the circle place the text "K = 3 rounds maximum". Draw one thick arrow from node 6 back to node 1 to close the loop, and label that arrow "next round".

Below the loop, place one dashed amber rectangle labeled "Injection point" with the second line "stress test only". Connect it to the arrow between node 6 and node 1 with a dashed amber arrow.

Keep labels short and correctly spelled. Do not add extra icons, people, robots, shadows, gradients, textures, watermarks, or any text that is not listed above.
```

If the "Trust update" card needs the formula, add this line inside the card: `S(t+1) = S(t) + alpha V - beta H`. Expect the formula to be garbled; if so, use the version above without the formula and I will overlay it in LaTeX.

---

## 3. Context Diagram prompt

Purpose: shows the system boundary and the external actors of the framework.

Aspect ratio and size: `16:9 landscape, 1920x1080 pixels`, pure white background.

```
Create a flat vector infographic of a system context diagram for an academic paper. Use a pure white background, bold clean sans-serif labels, rounded rectangles with 2 px outlines, and thick navy arrows. Use the palette: navy blue #1E40AF, teal #0F766E, amber #B45309, light blue #EEF2FF, light gray #F8FAFC, near-black #0A0A0A.

Place one large rounded rectangle in the center labeled "Trust-Calibrated Multi-Agent Deliberation Framework" with a thicker border in navy blue #1E40AF.

Place five external entity boxes around the center, each a small rounded rectangle in light blue #EEF2FF with a navy outline:
- Top center: "User / Researcher"
- Middle left: "Evaluation Harness" with the second line "GPQA · MMLU-Pro"
- Middle right: "Evidence Sources" with the second line "PubMed · arXiv · Semantic Scholar"
- Bottom left: "Model Serving" with the second line "vLLM + 3 LLMs"
- Bottom right: "GPU Cloud" with the second line "RTX PRO 6000 96GB"

Draw pairs of arrows between the center and each entity. Use these exact arrow labels:
- Between the user and the center: "question" and "result package"
- Between the harness and the center: "questions" and "scores and metrics"
- Between the center and the evidence sources: "claim queries" and "retrieved passages"
- Between the center and the model serving: "inference requests" and "agent responses"
- Between the GPU cloud and the model serving: "GPU compute" as one dashed amber arrow

Keep the layout symmetric with even spacing and no overlapping shapes. Do not add extra icons, people, robots, shadows, gradients, textures, watermarks, or any text that is not listed above.
```

---

## 4. Pipeline Overview prompt (Figure 1 refresh)

Purpose: cleaner rebuild of the current Figure 1 (`methodology-flow.jpg`) with the same content and a more consistent look.

Aspect ratio and size: `16:9 landscape, 2000x1125 pixels`, pure white background.

```
Create a flat vector infographic of an eight-stage pipeline for an academic paper. Use a pure white background, bold clean sans-serif labels, rounded cards with 2 px outlines, numbered dark-navy circles, and thick navy arrows. Follow this palette: navy blue #1E40AF for stages 1 to 4 headers and arrows, teal #0F766E for stages 5 to 8 headers, light gray #F8FAFC for card bodies, amber #B45309 for the pipeline strip and the injection note, green #15803D for a supported pill, red #B91C1C for a contradicted pill, gray #475569 for an unverifiable pill, near-black #0A0A0A for text.

At the very top, place one wide rounded rectangle labeled "Trust-Calibrated Multi-Agent Deliberation Framework".

Draw the pipeline in two rows. The top row reads left to right, the bottom row reads left to right, and a thick curved arrow leads from the end of the top row down to the start of the bottom row. Each stage is a rounded card with a two-tone header and a numbered dark-navy circle at the top-left.

Top row:
1. "Scientific Question"
2. "Confidence Gate" drawn as a diamond shape, with a small branch arrow pointing down labeled "Direct Answer"
3. "Multi-Agent Debate", inside show three small agent chips labeled "Agent A", "Agent B", "Agent C", and the second line "3 heterogeneous LLMs · up to 3 rounds"
4. "Claim Decomposition", second line "reasoning split into atomic factual claims"

Bottom row:
5. "Evidence Retrieval", second line "PubMed · arXiv · Semantic Scholar", and a third small line "OpenAlex fallback"
6. "Evidence Verdict", show four small pills labeled "Supported" in green, "Contradicted" in red, "Unverifiable" in gray, "Contested" in amber
7. "Trust Update", second line "bounded 0.1 to 0.9", third line "renormalized each round"
8. "Trust-Weighted Aggregation", second line "Final Answer + Citations + Trust Trajectory"

Below stage 3, place one dashed amber rounded rectangle labeled "Injection point" with the second line "fabricated wrong consensus (sycophancy stress test)", connected to stage 3 and stage 4 with a thin dashed amber arrow.

At the bottom of the image, place one wide horizontal strip. The left tab of the strip is teal #0F766E with white text "Evaluation". The rest of the strip is light teal #ECFDF5 with the text "GPQA · MMLU-Pro" followed by four outlined pills labeled "Accuracy", "Consensus-Collapse Rate", "Minority-Preservation Rate", "Evidence-Calibration Rate", and the last text "No model fine-tuning".

Keep labels short and correctly spelled. Do not add extra icons, people, robots, shadows, gradients, textures, watermarks, or any text that is not listed above.
```

---

## 5. Trust Update Detail prompt (optional)

Purpose: one small figure that explains the bounded trust update step by step. Useful if a reviewer asks how the weights are computed.

Aspect ratio and size: `4:3 landscape, 1600x1200 pixels`, pure white background.

```
Create a flat vector infographic of a five-step computation chain for an academic paper. Use a pure white background, bold clean sans-serif labels, rounded cards with 2 px outlines, and thick navy arrows. Use the palette: navy blue #1E40AF, teal #0F766E, light blue #EEF2FF, light gray #F8FAFC, near-black #0A0A0A, green #15803D, red #B91C1C.

Draw the chain left to right as five rounded cards, each with a numbered dark-navy circle:
1. "Verdict counts", second line "supported V, contradicted H"
2. "Raw score", second line "S(t+1) = S(t) + aV - bH"
3. "Softmax", second line "positive values"
4. "Clamp", second line "0.1 to 0.9"
5. "Renormalize", second line "sum equals 1"

Below the chain, place one row of three small agent chips labeled "Agent A", "Agent B", "Agent C". Under each chip draw a horizontal bar chart with three bars of different heights in navy blue, teal, and amber, and one caption under the bars "trust weights".

Keep labels short and correctly spelled. Do not add extra icons, people, robots, shadows, gradients, textures, watermarks, or any text that is not listed above.
```

---

## 6. Claim Verification Example prompt (optional)

Purpose: one small example figure for the Proposed Method section showing how a single claim is checked.

Aspect ratio and size: `16:9 landscape, 1920x1080 pixels`, pure white background.

```
Create a flat vector infographic of a single claim verification example for an academic paper. Use a pure white background, bold clean sans-serif labels, rounded cards with 2 px outlines, and thick navy arrows. Use the palette: navy blue #1E40AF, teal #0F766E, green #15803D, red #B91C1C, amber #B45309, light gray #F8FAFC, near-black #0A0A0A.

Draw three panels left to right, connected with thick navy arrows.

Panel 1, labeled "Agent answer": one rounded card with the text "Drug X lowers blood pressure" and below it one highlighted claim chip labeled "Claim c1" outlined in navy.

Panel 2, labeled "Retrieved evidence": one rounded card that looks like a short paper abstract, with one highlighted line in light amber, and a small tag below "PubMed".

Panel 3, labeled "Verdict": one large pill labeled "Supported" in green, and below the pill a short line "trust score rises".

Add one dashed gray arrow from panel 2 back to panel 1 labeled "claim checked".

Keep labels short and correctly spelled. Do not add extra icons, people, robots, shadows, gradients, textures, watermarks, or any text that is not listed above.
```

---

## Insertion notes

- After generation, send the PNG files. I will place them with `\includegraphics`, add captions, and fix label text if the image model misspells something.
- Equations in images are often garbled. For any figure that needs a formula, generate the figure with an empty or titled box and I will overlay the formula in LaTeX.
- Keep each figure at one concept. If a figure feels crowded, generate two smaller figures instead.
