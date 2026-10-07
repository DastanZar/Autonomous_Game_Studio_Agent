# Why your power bill went up (a building you've never seen)

A format pilot: the hand-and-pencil "drawn while you watch" style (the old "draw my life" trend, as on
@SportsBall_Visual) applied to a story around us. The whole video is one sheet of paper. A drawn hand
sketches each beat into its own part of the page while the camera pans across it, then the camera pulls
back to show the whole page and a red arrow joins the data center to the bill.

- Channel: `studio/channels/sketch/bible.json` (draft; working name "Drawn Out", the name is the user's call)
- Kit: `studio/engine/kits/sketch.js` (reusable): seeded wobbly pencil strokes revealed over time, back-and-forth
  coloured-pencil hatching, hand lettering (Patrick Hand, Gochi Hand: SIL OFL 1.1), a drawn hand and pencil that
  follow the stroke tip, the desk and paper, the camera, and pencil-scratch sound cues
- Page content: `scenes.js`; map outlines: `data/states_east.json` (Natural Earth 1:50m, public domain)

## Facts (every number on the page)

| Claim | Source |
|---|---|
| Data centers used about 4.4% of US electricity in 2023; 6.7-12% expected by 2028 (LBNL estimate) | [DOE, Dec 2024](https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers) (official) |
| PJM serves more than 67 million people in 13 states and D.C. (all or part of each) | [PJM release, 17 Dec 2025](https://www.pjm.com/-/media/DotCom/about-pjm/newsroom/2025-releases/20251217-pjm-auction-procures-134479-mw-of-generation-resources.pdf); [IEEFA](https://ieefa.org/resources/projected-data-center-growth-spurs-pjm-capacity-prices-factor-10) |
| The capacity auction pays for enough power-plant capacity to meet forecast peak demand | IEEFA; PJM release |
| Capacity price (rest of RTO, $/MW-day): 28.92 (2024/25), 269.92 (2025/26), 329.17 (2026/27), 333.44 = the cap (2027/28) | PJM BRA reports [2024/25](https://www.pjm.com/-/media/markets-ops/rpm/rpm-auction-info/2024-2025/2024-2025-base-residual-auction-report.ashx), [2025/26](https://www.pjm.com/-/media/markets-ops/rpm/rpm-auction-info/2025-2026/2025-2026-base-residual-auction-report.ashx); PJM release; IEEFA; [Maryland OPC](https://content.govdelivery.com/accounts/MDOPC/bulletins/4006939) |
| Without the cap, PJM's simulation clears 2027/28 at $529.80 | [PJM 2027/28 BRA report](https://www.pjm.com/-/media/DotCom/markets-ops/rpm/rpm-auction-info/2027-2028/2027-2028-bra-report.pdf) (official) |
| Forecasts filled with data centers (AI boom between the Dec 2022 and Jul 2024 auctions; ~5,100 of 5,250 MW of 2027/28 forecast growth) | IEEFA; PJM release |
| Data centers caused 63% of the 2025/26 increase, $9.3 billion recovered from customers (market monitor's estimate) | Monitoring Analytics via IEEFA |
| D.C. Pepco home bills +$21/month from June 2025; about half ($10) from capacity prices (consumer counsel's estimate) | D.C. OPC via IEEFA |

Context kept out of the script but in the risk notes: SemiAnalysis argues the market design, not AI itself, is the
main cause (Texas has no capacity auction and saw futures move only a few percent).

Every quote is machine-checked against the fetched source (`studio/tools/verify_quotes.py`: 9 claims, 0 NOT_FOUND).
