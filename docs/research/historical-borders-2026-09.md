# Historical border data: licence check (2026-09-29)

**Why this is needed:** the why-map "how_did" series animates how borders changed. AGENT_PROMPT forbids
hand-drawn geography, so every historical border has to come from a dataset whose licence allows
monetised video.

## Findings

| Dataset | Coverage | Licence (as checked) | Verdict |
|---|---|---|---|
| **OpenHistoricalMap** | Crowdsourced, dated boundary relations. Probed on 2026-09-29 via its Overpass API. | **CC0** (public domain) "unless noted otherwise via a license=* tag on an individual element". Source: the OHM FAQ on the OSM wiki. | **Use as the primary source.** Check each relation's `license` tag, and verify extents against a reference source. |
| Natural Earth | Modern borders only | Public domain | **Fallback:** merge modern units when a historical line follows today's internal borders, and label it "approximate". |
| CShapes 2.0 (ETH Zurich) | States and dependencies 1886–2019, coded from scholarly sources | The website states no licence. The CRAN R package that bundles it is GPL (≥ 2). | **Reference only**, for checking dates and extents. Ask the authors before rendering its geometry. |
| aourednik/historical-basemaps | World, 5,000 years, coarse | GPL-3.0. Its README calls it a work in progress and says borders are approximate (a BORDERPRECISION field of 1–3). | **Not used.** Copyleft terms are unclear for rendered monetised video, and precision is low. |
| Thenmap | Nordic countries, recent decades | No licence found on its site | Not needed |

**OpenHistoricalMap coverage probe** (admin_level=2 relations, `name:en`):

| Search | Relations | Date range | Notes |
|---|---|---|---|
| Mexico | 28 | 1823 → 1970 | Includes 1846–48 (Mexican Cession) and 1854 |
| Roman Empire | 19 | 14 BC → AD 395 | One relation explicitly tagged `license=CC0-1.0` |
| Ottoman Empire | 32 | 1299 → 1922 | |
| Thailand / Siam | 13 | 1867 → today | |
| Switzerland | 7 | 1803 → today | |
| Portugal | 4 | from 1910 only | **Gap:** no medieval Portugal/Spain |

**Rules for the series** (also in the why-map bible, `look.historical_borders`):
- The on-screen date is the dataset's date.
- Label "approximate" where the data is approximate.
- Credit "Historical borders: OpenHistoricalMap contributors". CC0 doesn't require credit; we give it anyway.
- Where OHM has a gap (for example, Portugal before 1910), use the Natural Earth fallback or drop the topic.

## Not verified
- Legal reading: this is a licence-text check, not legal advice.
- OHM accuracy per relation. It's crowdsourced, so each episode's research stage cross-checks it
  (CShapes, or scholarly maps) and records that check in the fact table.
